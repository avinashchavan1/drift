import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, urlBase64ToUint8Array } from '../api/notifications';

const SW_PATH = '/sw.js';

function isSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function useNotifications() {
  const [supported,   setSupported]   = useState(false);
  const [permission,  setPermission]  = useState('default');
  const [subscribed,  setSubscribed]  = useState(false);
  const [prefs,       setPrefs]       = useState({ dueSoon: true, overdueAlerts: true, dailyDigest: true });
  const [loading,     setLoading]     = useState(false);
  const [swReg,       setSwReg]       = useState(null);

  // On mount: check support, register SW, load status
  useEffect(() => {
    if (!isSupported()) return;
    setSupported(true);
    setPermission(Notification.permission);

    // Register service worker
    navigator.serviceWorker.register(SW_PATH).then(reg => {
      setSwReg(reg);

      // Listen for messages from the SW
      navigator.serviceWorker.addEventListener('message', e => {
        if (e.data?.type === 'SUBSCRIPTION_CHANGED') {
          handleSubscriptionChanged(e.data.subscription, reg);
        }
      });

      // Check if already subscribed
      return reg.pushManager.getSubscription();
    }).then(existingSub => {
      if (existingSub) setSubscribed(true);
    }).catch(console.error);

    // Load server-side prefs
    notificationsApi.getStatus().then(data => {
      if (data.subscribed) {
        setSubscribed(true);
        setPrefs({
          dueSoon:       data.dueSoon       ?? true,
          overdueAlerts: data.overdueAlerts ?? true,
          dailyDigest:   data.dailyDigest   ?? true,
        });
      }
    }).catch(() => {});
  }, []);

  const handleSubscriptionChanged = useCallback(async (subJson, reg) => {
    try {
      const keyData = await notificationsApi.getVapidKey();
      const appKey  = urlBase64ToUint8Array(keyData.key);
      const newSub  = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appKey });
      const json    = newSub.toJSON();
      await notificationsApi.subscribe({
        endpoint:      json.endpoint,
        p256dh:        json.keys.p256dh,
        auth:          json.keys.auth,
        ...prefs,
      });
    } catch (e) {
      console.error('Resubscribe failed', e);
    }
  }, [prefs]);

  const requestAndSubscribe = useCallback(async (newPrefs) => {
    if (!isSupported()) return false;
    setLoading(true);
    try {
      // 1. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      // 2. Get VAPID key
      const keyData = await notificationsApi.getVapidKey();
      const appKey  = urlBase64ToUint8Array(keyData.key);

      // 3. Subscribe via PushManager
      let reg = swReg;
      if (!reg) reg = await navigator.serviceWorker.register(SW_PATH);
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appKey });

      // 4. Send to backend
      const json = sub.toJSON();
      const mergedPrefs = newPrefs || prefs;
      await notificationsApi.subscribe({
        endpoint: json.endpoint,
        p256dh:   json.keys.p256dh,
        auth:     json.keys.auth,
        ...mergedPrefs,
      });

      setSubscribed(true);
      setPrefs(mergedPrefs);
      return true;
    } catch (e) {
      console.error('Subscribe failed', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [swReg, prefs]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      let reg = swReg;
      if (!reg) reg = await navigator.serviceWorker.getRegistration(SW_PATH);
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await notificationsApi.unsubscribe(sub.endpoint);
          await sub.unsubscribe();
        }
      }
      setSubscribed(false);
    } catch (e) {
      console.error('Unsubscribe failed', e);
    } finally {
      setLoading(false);
    }
  }, [swReg]);

  const updatePrefs = useCallback(async (newPrefs) => {
    const merged = { ...prefs, ...newPrefs };
    setPrefs(merged);
    if (subscribed) {
      // Re-subscribe with updated prefs
      await requestAndSubscribe(merged);
    }
  }, [prefs, subscribed, requestAndSubscribe]);

  const sendTest = useCallback(async () => {
    try {
      await notificationsApi.sendTest();
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    supported,
    permission,
    subscribed,
    prefs,
    loading,
    requestAndSubscribe,
    unsubscribe,
    updatePrefs,
    sendTest,
  };
}

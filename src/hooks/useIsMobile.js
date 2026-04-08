import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport is narrower than `breakpoint` px.
 * Updates instantly on resize — no Tailwind CSS breakpoints involved.
 */
export default function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = e => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return mobile;
}

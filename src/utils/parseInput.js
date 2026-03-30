import {
  addDays, setHours, setMinutes, startOfDay,
  nextMonday, nextTuesday, nextWednesday, nextThursday,
  nextFriday, nextSaturday, nextSunday,
} from 'date-fns';

// Category color palettes — using inline styles to avoid Tailwind JIT purging dynamic class names
export const CATEGORY_PALETTES = {
  work:     { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  health:   { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  personal: { bg: '#f3e8ff', text: '#7e22ce', dot: '#a855f7' },
  learning: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  finance:  { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  social:   { bg: '#fce7f3', text: '#9d174d', dot: '#ec4899' },
};

const DEFAULT_PALETTE = { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' };

export function getCategoryColor(category) {
  if (!category) return null;
  return CATEGORY_PALETTES[category.toLowerCase()] || DEFAULT_PALETTE;
}


// Time and date patterns hoisted to module scope to avoid re-creating on every keystroke
const TIME_PATTERNS = [
  { re: /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i, parse: (m, now) => parseTimeAmPm(parseInt(m[1]), parseInt(m[2]), m[3], now) },
  { re: /\b(\d{1,2})\s*(am|pm)\b/i,          parse: (m, now) => parseTimeAmPm(parseInt(m[1]), 0, m[2], now) },
  { re: /\b(\d{1,2}):(\d{2})\b/,             parse: (m, now) => setMinutes(setHours(now, parseInt(m[1])), parseInt(m[2])) },
];

const DATE_KEYWORDS = [
  { re: /\btoday\b/i,           date: (_, now) => startOfDay(now) },
  { re: /\btomorrow\b/i,        date: (_, now) => startOfDay(addDays(now, 1)) },
  { re: /\bnext week\b/i,       date: (_, now) => startOfDay(addDays(now, 7)) },
  { re: /\bmonday\b/i,          date: (_, now) => startOfDay(nextMonday(now)) },
  { re: /\btuesday\b/i,         date: (_, now) => startOfDay(nextTuesday(now)) },
  { re: /\bwednesday\b/i,       date: (_, now) => startOfDay(nextWednesday(now)) },
  { re: /\bthursday\b/i,        date: (_, now) => startOfDay(nextThursday(now)) },
  { re: /\bfriday\b/i,          date: (_, now) => startOfDay(nextFriday(now)) },
  { re: /\bsaturday\b/i,        date: (_, now) => startOfDay(nextSaturday(now)) },
  { re: /\bsunday\b/i,          date: (_, now) => startOfDay(nextSunday(now)) },
  { re: /\bin (\d+) days?\b/i,  date: (m, now) => startOfDay(addDays(now, parseInt(m[1]))) },
];

/**
 * Parse natural language task input.
 * Returns { title, dueDate, category }
 */
export function parseTaskInput(raw) {
  let text = raw.trim();
  let dueDate = null;
  let category = null;

  // Extract category: #tag at any position
  const catMatch = text.match(/#(\w+)/);
  if (catMatch) {
    category = catMatch[1].toLowerCase();
    text = text.replace(catMatch[0], '').trim();
  }

  const now = new Date();

  // Time patterns (e.g., "5pm", "5:30pm", "17:00")
  let parsedTime = null;
  for (const { re, parse } of TIME_PATTERNS) {
    const m = text.match(re);
    if (m) {
      parsedTime = parse(m, now);
      text = text.replace(m[0], '').trim();
      break;
    }
  }

  // Relative date keywords
  for (const { re, date } of DATE_KEYWORDS) {
    const m = text.match(re);
    if (m) {
      const base = date(m, now);
      dueDate = parsedTime
        ? setMinutes(setHours(base, parsedTime.getHours()), parsedTime.getMinutes())
        : base;
      text = text.replace(m[0], '').trim();
      break;
    }
  }

  // If we have a time but no date, assume today
  if (parsedTime && !dueDate) {
    dueDate = setMinutes(setHours(startOfDay(now), parsedTime.getHours()), parsedTime.getMinutes());
  }

  // Clean up trailing/leading punctuation and extra spaces
  const title = text.replace(/\s+/g, ' ').replace(/^[,\s]+|[,\s]+$/g, '').trim();

  return {
    title: title || raw.trim(),
    dueDate,
    category,
  };
}

function parseTimeAmPm(hours, minutes, ampm, now) {
  let h = hours;
  const ap = ampm.toLowerCase();
  if (ap === 'pm' && h !== 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return setMinutes(setHours(now, h), minutes);
}

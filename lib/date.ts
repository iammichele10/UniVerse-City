import { Timestamp } from 'firebase/firestore/lite';

/**
 * Firestore gives back Timestamp objects, not JS Dates — `new Date(timestamp)`
 * silently produces "Invalid Date". This normalizes any of the shapes a
 * date-ish field might arrive in (Firestore Timestamp, JS Date, ISO string,
 * millis number, or null/undefined) into a real Date, or null if there's
 * nothing usable yet (e.g. serverTimestamp() hasn't resolved locally yet).
 */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  // Firestore Timestamp-like plain object (e.g. after JSON round-trip)
  if (typeof value === 'object' && value !== null && 'seconds' in (value as any)) {
    const seconds = (value as any).seconds;
    return new Date(seconds * 1000);
  }
  return null;
}

/** Formats a date-ish value, or a fallback string if it can't be resolved yet. */
export function formatDate(
  value: unknown,
  options: Intl.DateTimeFormatOptions = {},
  fallback = ''
): string {
  const d = toDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString('en-US', options);
}

/** "2h ago" / "3d ago" style formatting, for comments. Falls back to a
 * short date once it's more than a week old, and to `fallback` if the
 * value isn't resolvable yet (e.g. serverTimestamp() hasn't synced locally). */
export function formatRelativeTime(value: unknown, fallback = 'just now'): string {
  const d = toDate(value);
  if (!d) return fallback;
  const seconds = Math.round((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

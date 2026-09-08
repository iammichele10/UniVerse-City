import { Timestamp } from 'firebase/firestore';

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

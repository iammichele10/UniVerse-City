import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { db } from './firebase';
import type { SiteSettings } from './types';

const SETTINGS_REF = doc(db, 'settings', 'site');

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'The Young Voice',
  tagline: 'The official student blog of Fieldstone Academy',
  estYear: '2026',
  categories: ['Academics', 'Sports', 'Announcements', 'Arts & Culture'],
};

export async function getSettings(): Promise<SiteSettings> {
  const snap = await getDoc(SETTINGS_REF);
  return snap.exists() ? (snap.data() as SiteSettings) : DEFAULT_SETTINGS;
}

export async function updateSettings(data: SiteSettings) {
  return setDoc(SETTINGS_REF, data);
}

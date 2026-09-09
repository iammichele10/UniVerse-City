import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { db } from './firebase';
import type { SiteSettings, TeamMember } from './types';

const SETTINGS_REF = doc(db, 'settings', 'site');

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'The Young Voice',
  tagline: 'The official student blog of Fieldstone Academy',
  estYear: '2026',
  categories: ['Academics', 'Sports', 'Announcements', 'Arts & Culture'],
  aboutIntro: 'The official student blog of Fieldstone Academy. This page introduces the people behind the paper.',
  team: [
    { id: 'ama-boateng', name: 'Ama Boateng', role: 'Editor-in-Chief', photoUrl: null, photoPath: null },
    { id: 'kwame-owusu', name: 'Kwame Owusu', role: 'Managing Editor', photoUrl: null, photoPath: null },
    { id: 'efua-mensah', name: 'Efua Mensah', role: 'Lead Writer', photoUrl: null, photoPath: null },
  ],
};

function normalizeTeam(value: unknown): TeamMember[] {
  if (!Array.isArray(value)) return DEFAULT_SETTINGS.team;
  return value.map((member, index) => ({
    id: typeof member?.id === 'string' && member.id ? member.id : `member-${index + 1}`,
    name: typeof member?.name === 'string' ? member.name : '',
    role: typeof member?.role === 'string' ? member.role : '',
    photoUrl: typeof member?.photoUrl === 'string' && member.photoUrl ? member.photoUrl : null,
    photoPath: typeof member?.photoPath === 'string' && member.photoPath ? member.photoPath : null,
  }));
}

export async function getSettings(): Promise<SiteSettings> {
  const snap = await getDoc(SETTINGS_REF);
  if (!snap.exists()) return DEFAULT_SETTINGS;

  const data = snap.data() as Partial<SiteSettings>;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    categories: Array.isArray(data.categories) ? data.categories : DEFAULT_SETTINGS.categories,
    aboutIntro: typeof data.aboutIntro === 'string' ? data.aboutIntro : DEFAULT_SETTINGS.aboutIntro,
    team: normalizeTeam(data.team),
  };
}

export async function updateSettings(data: SiteSettings) {
  return setDoc(SETTINGS_REF, data);
}

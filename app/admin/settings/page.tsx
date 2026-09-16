'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSettings, updateSettings, DEFAULT_SETTINGS } from '@/lib/settings';
import { uploadTeamPhoto } from '@/lib/cloudinaryTeam';
import type { SiteSettings, TeamMember } from '@/lib/types';

function newMember(): TeamMember { return { id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: '', role: '', photoUrl: null, photoPath: null }; }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false);
  const [error, setError] = useState(''); const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => { getSettings().then((s) => { setSettings(s); setLoading(false); }).catch(() => { setError('Could not load settings.'); setLoading(false); }); }, []);

  function addCategory() { const trimmed = newCategory.trim(); if (!trimmed || settings.categories.includes(trimmed)) return; setSettings({ ...settings, categories: [...settings.categories, trimmed] }); setNewCategory(''); }
  function updateMember(id: string, patch: Partial<TeamMember>) { setSettings({ ...settings, team: settings.team.map((m) => m.id === id ? { ...m, ...patch } : m) }); }
  function moveMember(index: number, direction: -1 | 1) { const next = index + direction; if (next < 0 || next >= settings.team.length) return; const team = [...settings.team]; [team[index], team[next]] = [team[next], team[index]]; setSettings({ ...settings, team }); }
  async function handlePhotoUpload(id: string, file?: File) { if (!file) return; setError(''); setUploadingId(id); try { const result = await uploadTeamPhoto(file, id); updateMember(id, { photoUrl: result.url, photoPath: result.publicId }); } catch (e: any) { setError(e?.message || 'Photo upload failed.'); } finally { setUploadingId(null); } }
  async function handleSave() { setSaving(true); setSaved(false); setError(''); try { await updateSettings(settings); setSaved(true); setTimeout(() => setSaved(false), 2500); } catch (e: any) { setError(e?.message || 'Could not save settings.'); } finally { setSaving(false); } }

  if (loading) return <p className="text-sm text-muted">Loading settings…</p>;

  return (
    <div className="w-full max-w-4xl">
      <div className="border-b border-ink pb-6"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">Publication controls</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">Settings</h1><p className="mt-2 text-sm text-muted">Manage the identity, About page, categories and team shown on the site.</p></div>
      {error && <div className="mt-5 border border-[#d9c8c8] bg-[#f7eeee] px-4 py-3 text-sm text-red-800">{error}</div>}

      <section className="border-b border-rule py-8"><h2 className="font-serif text-2xl">Site identity</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-xs text-muted">Site name<input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="form-field mt-1" /></label><label className="text-xs text-muted">Established year<input value={settings.estYear} onChange={(e) => setSettings({ ...settings, estYear: e.target.value })} className="form-field mt-1" /></label></div><label className="mt-5 block text-xs text-muted">Tagline<input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="form-field mt-1" /></label></section>

      <section className="border-b border-rule py-8"><h2 className="font-serif text-2xl">About page</h2><p className="mt-1 text-xs text-muted">This introduction appears publicly above the team list.</p><textarea value={settings.aboutIntro} onChange={(e) => setSettings({ ...settings, aboutIntro: e.target.value })} rows={5} className="form-field mt-5 resize-y leading-6" /></section>

      <section className="border-b border-rule py-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-serif text-2xl">The Team</h2><p className="mt-1 text-xs text-muted">Publicly shown as name, role and photo. Arrows change the order.</p></div><button onClick={() => setSettings({ ...settings, team: [...settings.team, newMember()] })} className="self-start border border-ink px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-ink hover:text-paper">Add member +</button></div>
        <div className="mt-5">{settings.team.map((member, index) => <div key={member.id} className="border-b border-rule py-5"><div className="grid gap-4 sm:grid-cols-[96px_1fr]"><div className="h-24 w-24 overflow-hidden bg-[#e8e5dc]">{member.photoUrl ? <img src={member.photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-serif text-2xl text-navy">{member.name.split(/\s+/).filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '—'}</div>}</div><div className="space-y-3"><input value={member.name} onChange={(e) => updateMember(member.id, { name: e.target.value })} placeholder="Name" className="form-field" /><input value={member.role} onChange={(e) => updateMember(member.id, { role: e.target.value })} placeholder="Role" className="form-field" /><div className="flex flex-wrap gap-4 text-xs"><label className="cursor-pointer editorial-link">{uploadingId === member.id ? 'Uploading…' : member.photoUrl ? 'Replace photo' : 'Upload photo'}<input type="file" accept="image/*" className="hidden" disabled={uploadingId === member.id} onChange={(e) => { handlePhotoUpload(member.id, e.target.files?.[0]); e.currentTarget.value = ''; }} /></label>{member.photoUrl && <button onClick={() => updateMember(member.id, { photoUrl: null, photoPath: null })} className="text-red-700 underline">Remove photo</button>}</div></div></div><div className="mt-4 flex items-center justify-between border-t border-rule pt-3"><div className="flex gap-4 text-xs"><button disabled={index === 0} onClick={() => moveMember(index, -1)} className="editorial-link disabled:opacity-30">↑ Move up</button><button disabled={index === settings.team.length - 1} onClick={() => moveMember(index, 1)} className="editorial-link disabled:opacity-30">↓ Move down</button></div><button onClick={() => setSettings({ ...settings, team: settings.team.filter((m) => m.id !== member.id) })} className="text-xs text-red-700 underline">Remove member</button></div></div>)}{settings.team.length === 0 && <p className="py-8 text-sm text-muted">No team members yet.</p>}</div>
      </section>

      <section className="py-8"><h2 className="font-serif text-2xl">Categories</h2><p className="mt-1 text-xs text-muted">These categories are used by the post editor and public navigation.</p><div className="mt-5">{settings.categories.map((cat) => <div key={cat} className="flex items-center justify-between border-b border-rule py-3 text-sm"><span>{cat}</span><button onClick={() => setSettings({ ...settings, categories: settings.categories.filter((c) => c !== cat) })} className="text-xs text-red-700 underline">Remove</button></div>)}</div><div className="mt-4 flex gap-2"><input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCategory()} placeholder="New category name" className="form-field" /><button onClick={addCategory} className="w-full shrink-0 border border-ink px-4 py-3 sm:w-auto text-xs font-semibold uppercase tracking-[0.1em] hover:bg-ink hover:text-paper">Add</button></div></section>

      <div className="sticky bottom-0 z-20 mt-4 border-t border-ink bg-white/95 py-3 backdrop-blur"><div className="flex flex-wrap items-center gap-3"><button onClick={handleSave} disabled={saving || uploadingId !== null} className="w-full border border-ink bg-ink px-5 py-3 sm:w-auto sm:py-2.5 text-xs font-semibold uppercase tracking-[0.13em] text-paper hover:bg-[#343934] disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>{saved && <span className="text-xs text-green-700">Saved.</span>}<Link href="/admin" className="text-xs text-muted underline">Back to posts</Link></div></div>
    </div>
  );
}

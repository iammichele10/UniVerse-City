'use client';

import { useEffect, useState } from 'react';
import { getSettings, updateSettings, DEFAULT_SETTINGS } from '@/lib/settings';
import { uploadTeamPhoto } from '@/lib/cloudinaryTeam';
import type { SiteSettings, TeamMember } from '@/lib/types';

function newMember(): TeamMember {
  return {
    id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    role: '',
    photoUrl: null,
    photoPath: null,
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    }).catch(() => {
      setError('Could not load settings.');
      setLoading(false);
    });
  }, []);

  function addCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed || settings.categories.includes(trimmed)) return;
    setSettings({ ...settings, categories: [...settings.categories, trimmed] });
    setNewCategory('');
  }

  function removeCategory(cat: string) {
    setSettings({ ...settings, categories: settings.categories.filter((c) => c !== cat) });
  }

  function updateMember(id: string, patch: Partial<TeamMember>) {
    setSettings({
      ...settings,
      team: settings.team.map((member) => member.id === id ? { ...member, ...patch } : member),
    });
  }

  function addMember() {
    setSettings({ ...settings, team: [...settings.team, newMember()] });
  }

  function removeMember(id: string) {
    const member = settings.team.find((item) => item.id === id);
    setSettings({ ...settings, team: settings.team.filter((member) => member.id !== id) });
  }

  function moveMember(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= settings.team.length) return;
    const team = [...settings.team];
    [team[index], team[nextIndex]] = [team[nextIndex], team[index]];
    setSettings({ ...settings, team });
  }

  async function handlePhotoUpload(id: string, file: File | undefined) {
    if (!file) return;
    setError('');
    setUploadingId(id);
    try {
      const result = await uploadTeamPhoto(file, id);
      updateMember(id, { photoUrl: result.url, photoPath: result.publicId });
    } catch (e: any) {
      setError(e?.message || 'Photo upload failed.');
    } finally {
      setUploadingId(null);
    }
  }

  function removePhoto(id: string) {
    const member = settings.team.find((item) => item.id === id);
    updateMember(id, { photoUrl: null, photoPath: null });
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e?.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading settings…</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Site Settings</h1>
        <p className="mt-1 text-xs text-muted">Manage the site identity, About page, categories, and team.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-serif text-xl">Site identity</h2>
        <div>
          <label className="mb-1 block text-xs text-muted">Site Name</label>
          <input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Tagline</label>
          <input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Est. Year</label>
          <input value={settings.estYear} onChange={(e) => setSettings({ ...settings, estYear: e.target.value })}
            className="w-full max-w-[8rem] rounded-md border border-rule bg-white px-3 py-2 text-sm" />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-serif text-xl">About page</h2>
          <p className="mt-1 text-xs text-muted">This introduction appears at the top of the public About page.</p>
        </div>
        <textarea
          value={settings.aboutIntro}
          onChange={(e) => setSettings({ ...settings, aboutIntro: e.target.value })}
          rows={4}
          className="w-full resize-y rounded-md border border-rule bg-white px-3 py-2 text-sm leading-6"
          placeholder="Tell readers about the publication and the people behind it."
        />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl">The Team</h2>
            <p className="mt-1 text-xs text-muted">Only name, role, and photo are shown publicly. Use the arrows to reorder.</p>
          </div>
          <button onClick={addMember} className="rounded-md border border-rule bg-white px-3 py-2 text-sm">
            + Add member
          </button>
        </div>

        <div className="space-y-3">
          {settings.team.map((member, index) => (
            <div key={member.id} className="rounded-md border border-rule bg-white p-4">
              <div className="flex gap-4">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border border-rule bg-paper-raised font-serif text-lg text-navy">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    member.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '??'
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    value={member.name}
                    onChange={(e) => updateMember(member.id, { name: e.target.value })}
                    placeholder="Name"
                    className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm"
                  />
                  <input
                    value={member.role}
                    onChange={(e) => updateMember(member.id, { role: e.target.value })}
                    placeholder="Role (e.g. Editor-in-Chief)"
                    className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <label className="cursor-pointer rounded-md border border-rule bg-paper px-3 py-2 text-navy">
                      {uploadingId === member.id ? 'Uploading…' : member.photoUrl ? 'Replace photo' : 'Upload photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingId === member.id}
                        onChange={(e) => {
                          handlePhotoUpload(member.id, e.target.files?.[0]);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                    {member.photoUrl && (
                      <button onClick={() => removePhoto(member.id)} className="px-2 py-2 text-red-700 underline">
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3">
                <div className="flex gap-1">
                  <button disabled={index === 0} onClick={() => moveMember(index, -1)}
                    className="rounded border border-rule px-2 py-1 text-sm disabled:opacity-30" aria-label="Move up">↑</button>
                  <button disabled={index === settings.team.length - 1} onClick={() => moveMember(index, 1)}
                    className="rounded border border-rule px-2 py-1 text-sm disabled:opacity-30" aria-label="Move down">↓</button>
                </div>
                <button onClick={() => removeMember(member.id)} className="text-xs text-red-700 underline">Remove member</button>
              </div>
            </div>
          ))}
          {settings.team.length === 0 && (
            <div className="rounded-md border border-dashed border-rule p-6 text-center text-sm text-muted">
              No team members yet.
            </div>
          )}
        </div>
      </section>

      <section>
        <label className="mb-2 block text-xs text-muted">Categories</label>
        <ul className="mb-3 space-y-2">
          {settings.categories.map((cat) => (
            <li key={cat} className="flex items-center justify-between rounded-md border border-rule bg-white px-3 py-2 text-sm">
              {cat}
              <button onClick={() => removeCategory(cat)} className="text-xs text-red-700 underline">remove</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-md border border-rule bg-white px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
          <button onClick={addCategory} className="rounded-md border border-rule bg-white px-3 py-2 text-sm">+ Add</button>
        </div>
      </section>

      <div className="sticky bottom-3 flex items-center rounded-md border border-rule bg-paper-raised/95 p-3 shadow-sm backdrop-blur">
        <button onClick={handleSave} disabled={saving || uploadingId !== null}
          className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="ml-3 text-xs text-green-700">Saved.</span>}
      </div>
    </div>
  );
}

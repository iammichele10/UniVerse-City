'use client';

import { useEffect, useState } from 'react';
import { getSettings, updateSettings, DEFAULT_SETTINGS } from '@/lib/settings';
import type { SiteSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
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

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updateSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <p>Loading settings…</p>;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-lg font-semibold">Site Settings</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-muted mb-1">Site Name</label>
          <input
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Tagline</label>
          <input
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Est. Year</label>
          <input
            value={settings.estYear}
            onChange={(e) => setSettings({ ...settings, estYear: e.target.value })}
            className="w-full max-w-[8rem] rounded-md border border-rule bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted mb-2">Categories</label>
        <ul className="space-y-2 mb-3">
          {settings.categories.map((cat) => (
            <li key={cat} className="flex items-center justify-between rounded-md border border-rule bg-white px-3 py-2 text-sm text-sm">
              {cat}
              <button onClick={() => removeCategory(cat)} className="text-red-700 text-xs underline">
                remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-md border border-rule bg-white px-3 py-2 text-sm text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          />
          <button onClick={addCategory} className="rounded-md border border-rule bg-white px-3 py-2 text-sm text-sm">
            + Add
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
      {saved && <span className="ml-3 text-xs text-green-700">Saved.</span>}
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { auth } from '@/lib/firebase';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { createPost, updatePost, getPostById } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { toDate } from '@/lib/date';
import type { PostStatus } from '@/lib/types';

// Tiptap gives real paragraphs/bold/italic instead of one flat text blob —
// install with: npm install @tiptap/react @tiptap/starter-kit

// Formats a Date for an <input type="datetime-local"> value (local time, no seconds).
function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// useSearchParams() requires a Suspense boundary in the app router, or the
// production build fails — this outer component just provides that.
export default function NewPostPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <NewPostForm />
    </Suspense>
  );
}

function NewPostForm() {
  const searchParams = useSearchParams();
  const editingId = searchParams.get('id'); // present when this is an edit, not a new post

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [tags, setTags] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<PostStatus>('draft');
  const [publishAt, setPublishAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(!!editingId);
  const router = useRouter();

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  // Categories still come from Settings (shared, site-wide). Author name no
  // longer does — it's typed fresh per post below, right before publishing.
  useEffect(() => {
    getSettings().then((s) => {
      setCategories(s.categories);
      if (!editingId) setCategory(s.categories[0] ?? '');
    });
  }, [editingId]);

  // Editing an existing post: load its data into the form once the editor
  // instance and post both exist. Without this, /admin/new?id=... always
  // rendered a blank form and "Save" silently created a duplicate post.
  useEffect(() => {
    if (!editingId || !editor) return;
    let cancelled = false;

    getPostById(editingId).then((post) => {
      if (cancelled || !post) return;
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setCategory(post.category);
      setAuthorName(post.authorName ?? '');
      setTags(post.tags.join(', '));
      setExistingCoverUrl(post.coverImageUrl);
      setStatus(post.status);
      const d = toDate(post.publishAt);
      setPublishAt(d ? toDatetimeLocalValue(d) : '');
      editor.commands.setContent(post.body || '');
      setLoadingPost(false);
    });

    return () => {
      cancelled = true;
    };
  }, [editingId, editor]);

  function slugify(text: string) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  }

  async function notifyRevalidate(cat: string) {
    // Fire-and-forget: makes the publish feel instant on the public site
    // instead of waiting on the 60s backstop cache.
    fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat }),
    }).catch(() => {});
  }

  async function handleSave() {
    setSaving(true);
    try {
      let coverImageUrl: string | null = existingCoverUrl;
      if (coverFile) {
        coverImageUrl = await uploadImageToCloudinary(coverFile);
      }

      const payload = {
        title,
        slug: slugify(title),
        excerpt,
        body: editor?.getHTML() ?? '',
        coverImageUrl,
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
        publishAt: publishAt ? new Date(publishAt) : new Date(),
        authorId: auth.currentUser?.uid ?? '',
        authorName,
      };

      if (editingId) {
        await updatePost(editingId, payload as any);
      } else {
        await createPost(payload as any);
      }

      if (status === 'published') {
        await notifyRevalidate(category);
      }

      router.push('/admin');
    } finally {
      setSaving(false);
    }
  }

  if (loadingPost) {
    return <p className="text-sm text-muted">Loading post…</p>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold">{editingId ? 'Edit Post' : 'New Post'}</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm"
      />
      <input
        placeholder="Short excerpt for cards / SEO"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm"
      />

      <div>
        <label className="mb-1 block text-xs text-muted">Body</label>
        <div className="min-h-[200px] rounded-md border border-rule bg-white px-3 py-2 text-sm [&_.tiptap]:outline-none [&_.tiptap_p]:mb-3">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-rule bg-white px-3 py-2 text-sm sm:flex-1"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="rounded-md border border-rule bg-white px-3 py-2 text-sm sm:flex-1"
        />
      </div>

      <div>
        <label className="block text-xs text-muted">Cover image</label>
        {existingCoverUrl && !coverFile && (
          <div className="my-2 flex h-28 w-28 items-center justify-center overflow-hidden rounded-sm bg-[#F5F4F0]">
            <img src={existingCoverUrl} alt="" className="h-full w-full object-contain" />
          </div>
        )}
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className="text-sm" />
      </div>

      <div>
        <label className="block text-xs text-muted">Byline (author name)</label>
        <input
          placeholder="Your name, shown under the headline"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PostStatus)}
          className="rounded-md border border-rule bg-white px-3 py-2 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
        {status === 'scheduled' && (
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="rounded-md border border-rule bg-white px-3 py-2 text-sm"
          />
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !title || !authorName}
        className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Post'}
      </button>
    </div>
  );
}

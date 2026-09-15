'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EmojiStyle, type EmojiClickData } from 'emoji-picker-react';
import { UnderlineMark, LinkMark } from '@/lib/tiptapFormatting';
import { auth } from '@/lib/firebaseAuth';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { createPost, updatePost, getPostById } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { toDate } from '@/lib/date';
import type { PostStatus } from '@/lib/types';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
});

// Formats a Date for an <input type="datetime-local"> value.
function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// useSearchParams() requires a Suspense boundary in the app router.
export default function NewPostPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <NewPostForm />
    </Suspense>
  );
}

function NewPostForm() {
  const searchParams = useSearchParams();
  const editingId = searchParams.get('id');
  const router = useRouter();

  const editor = useEditor({
    extensions: [StarterKit, UnderlineMark, LinkMark],
    content: '',
    immediatelyRender: false,
  });

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [tags, setTags] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(
    null
  );
  const [status, setStatus] = useState<PostStatus>('draft');
  const [publishAt, setPublishAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(!!editingId);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  // Categories still come from Settings.
  useEffect(() => {
    getSettings().then((s) => {
      setCategories(s.categories);

      if (!editingId) {
        setCategory(s.categories[0] ?? '');
      }
    });
  }, [editingId]);

  // Load an existing post when editing.
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
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  async function notifyRevalidate(cat: string) {
    fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: cat,
      }),
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
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
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
      <h1 className="text-lg font-semibold">
        {editingId ? 'Edit Post' : 'New Post'}
      </h1>

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
        <label className="mb-1 block text-xs text-muted">
          Body
        </label>

        <div className="overflow-hidden rounded-md border border-rule bg-white">
          <div className="relative flex flex-wrap items-center gap-1 border-b border-rule bg-paper-raised p-2">
            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleBold().run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive('bold')
                  ? 'bg-navy text-white'
                  : 'hover:bg-white'
              }`}
              title="Bold"
            >
              <b>B</b>
            </button>

            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleItalic().run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive('italic')
                  ? 'bg-navy text-white'
                  : 'hover:bg-white'
              }`}
              title="Italic"
            >
              <i>I</i>
            </button>

            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleMark('underline').run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive('underline')
                  ? 'bg-navy text-white'
                  : 'hover:bg-white'
              }`}
              title="Underline"
            >
              <u>U</u>
            </button>

            <span className="mx-1 h-5 w-px bg-rule" />

            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: 2 })
                  .run()
              }
              className={`rounded px-2 py-1 text-xs font-semibold ${
                editor?.isActive('heading', { level: 2 })
                  ? 'bg-navy text-white'
                  : 'hover:bg-white'
              }`}
            >
              H2
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: 3 })
                  .run()
              }
              className={`rounded px-2 py-1 text-xs font-semibold ${
                editor?.isActive('heading', { level: 3 })
                  ? 'bg-navy text-white'
                  : 'hover:bg-white'
              }`}
            >
              H3
            </button>

            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleBulletList().run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive('bulletList')
                  ? 'bg-navy text-white'
                  : 'hover:bg-white'
              }`}
              title="Bulleted list"
            >
              • List
            </button>

            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleOrderedList().run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive('orderedList')
                  ? 'bg-navy text-white'
                  : 'hover:bg-white'
              }`}
              title="Numbered list"
            >
              1. List
            </button>

            <button
              type="button"
              onClick={() => {
                if (!editor) return;

                const current = editor.getAttributes('link')
                  .href as string | undefined;

                const url = window.prompt(
                  'Enter URL',
                  current || 'https://'
                );

                if (url === null) return;

                if (!url.trim()) {
                  editor.chain().focus().unsetMark('link').run();
                } else {
                  editor
                    .chain()
                    .focus()
                    .setMark('link', { href: url.trim() })
                    .run();
                }
              }}
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive('link')
                  ? 'bg-navy text-white'
                  : 'hover:bg-white'
              }`}
              title="Add link"
            >
              ↗
            </button>

            <span className="mx-1 h-5 w-px bg-rule" />

            {/* Emoji button */}
            <button
              type="button"
              onClick={() =>
                setEmojiPickerOpen((value) => !value)
              }
              className={`rounded px-2 py-1 text-base ${
                emojiPickerOpen
                  ? 'bg-navy text-white'
                  : 'hover:bg-white'
              }`}
              title="Emoji"
              aria-label="Open emoji picker"
            >
              😊
            </button>

            {/* Responsive emoji picker */}
            {emojiPickerOpen && (
              <div
                className="
                  absolute
                  left-1/2
                  top-full
                  z-40
                  mt-2
                  -translate-x-1/2
                  sm:left-2
                  sm:translate-x-0
                "
              >
                <div className="max-w-[calc(100vw-24px)] overflow-hidden rounded-lg shadow-lg">
                  <EmojiPicker
                    onEmojiClick={(emojiData: EmojiClickData) => {
                      editor
                        ?.chain()
                        .focus()
                        .insertContent(emojiData.emoji)
                        .run();

                      setEmojiPickerOpen(false);
                    }}
                    previewConfig={{
                      showPreview: false,
                    }}
                    width="100%"
                    height={400}
                    emojiStyle={EmojiStyle.NATIVE}
                    lazyLoadEmojis
                  />
                </div>
              </div>
            )}
          </div>

          <div className="min-h-[240px] px-3 py-3 text-sm [&_.tiptap]:min-h-[220px] [&_.tiptap]:outline-none [&_.tiptap_p]:mb-3 [&_.tiptap_h2]:mb-3 [&_.tiptap_h2]:mt-4 [&_.tiptap_h2]:font-serif [&_.tiptap_h2]:text-xl [&_.tiptap_h3]:mb-2 [&_.tiptap_h3]:mt-3 [&_.tiptap_h3]:font-serif [&_.tiptap_h3]:text-lg [&_.tiptap_ul]:mb-3 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:mb-3 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5">
            <EditorContent editor={editor} />
          </div>
        </div>

        <p className="mt-1 text-[11px] text-muted">
          Select text before using the link button. Tap 😊 to open the
          full emoji picker with search, categories and skin tones.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-rule bg-white px-3 py-2 text-sm sm:flex-1"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
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
        <label className="block text-xs text-muted">
          Cover image
        </label>

        {existingCoverUrl && !coverFile && (
          <div className="my-2 flex h-28 w-28 items-center justify-center overflow-hidden rounded-sm bg-[#F5F4F0]">
            <img
              src={existingCoverUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setCoverFile(e.target.files?.[0] ?? null)
          }
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-muted">
          Byline (author name)
        </label>

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
          onChange={(e) =>
            setStatus(e.target.value as PostStatus)
          }
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
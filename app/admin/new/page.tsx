'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EmojiStyle, type EmojiClickData } from 'emoji-picker-react';

import {
  UnderlineMark,
  LinkMark,
  AutoLinkMark,
  HashtagMark,
} from '@/lib/tiptapFormatting';

import { auth } from '@/lib/firebaseAuth';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import {
  createPost,
  updatePost,
  getPostById,
} from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { toDate } from '@/lib/date';
import type { PostStatus } from '@/lib/types';

const EmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  {
    ssr: false,
  }
);

// Formats a Date for an <input type="datetime-local"> value.
function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) =>
    String(n).padStart(2, '0');

  return `${d.getFullYear()}-${pad(
    d.getMonth() + 1
  )}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// useSearchParams() requires a Suspense boundary in the app router.
export default function NewPostPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted">
          Loading…
        </p>
      }
    >
      <NewPostForm />
    </Suspense>
  );
}

function NewPostForm() {
  const searchParams = useSearchParams();
  const editingId = searchParams.get('id');
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineMark,
      LinkMark,
      AutoLinkMark,
      HashtagMark,
    ],
    content: '',
    immediatelyRender: false,
  });

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [tags, setTags] = useState('');
  const [coverFile, setCoverFile] =
    useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] =
    useState<string | null>(null);
  const [status, setStatus] =
    useState<PostStatus>('draft');
  const [publishAt, setPublishAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] =
    useState(!!editingId);
  const [emojiPickerOpen, setEmojiPickerOpen] =
    useState(false);

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

      setPublishAt(
        d ? toDatetimeLocalValue(d) : ''
      );

      editor.commands.setContent(
        post.body || ''
      );

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

  /**
   * Safety-net conversion for hashtags.
   *
   * HashtagMark now creates a real Tiptap mark,
   * so hashtags should already be present in
   * editor.getHTML().
   *
   * This function also catches any plain hashtags
   * that somehow remain unmarked before saving.
   */
  function prepareBodyForSaving(
    html: string
  ): string {
    if (!html) return html;

    const parser = new DOMParser();

    const parsedDocument =
      parser.parseFromString(
        html,
        'text/html'
      );

    const hashtagPattern =
      /#[\p{L}\p{N}_-]+/gu;

    const walker =
      parsedDocument.createTreeWalker(
        parsedDocument.body,
        NodeFilter.SHOW_TEXT
      );

    const textNodes: Text[] = [];

    let currentNode = walker.nextNode();

    while (currentNode) {
      const textNode =
        currentNode as Text;

      const parent =
        textNode.parentElement;

      if (
        parent &&
        parent.tagName !== 'A' &&
        parent.tagName !== 'SCRIPT' &&
        parent.tagName !== 'STYLE' &&
        !parent.hasAttribute(
          'data-hashtag'
        ) &&
        !parent.classList.contains(
          'hashtag-blue'
        )
      ) {
        textNodes.push(textNode);
      }

      currentNode = walker.nextNode();
    }

    for (const textNode of textNodes) {
      const text =
        textNode.nodeValue ?? '';

      hashtagPattern.lastIndex = 0;

      const matches =
        [...text.matchAll(
          hashtagPattern
        )];

      if (matches.length === 0) {
        continue;
      }

      const fragment =
        parsedDocument.createDocumentFragment();

      let lastIndex = 0;

      for (const match of matches) {
        const hashtag = match[0];
        const index =
          match.index ?? 0;

        if (index > lastIndex) {
          fragment.appendChild(
            parsedDocument.createTextNode(
              text.slice(
                lastIndex,
                index
              )
            )
          );
        }

        const span =
          parsedDocument.createElement(
            'span'
          );

        span.className =
          'hashtag-blue';

        span.setAttribute(
          'data-hashtag',
          'true'
        );

        span.setAttribute(
          'style',
          'color:#2563eb;text-decoration:none;'
        );

        span.textContent = hashtag;

        fragment.appendChild(span);

        lastIndex =
          index + hashtag.length;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(
          parsedDocument.createTextNode(
            text.slice(lastIndex)
          )
        );
      }

      textNode.parentNode?.replaceChild(
        fragment,
        textNode
      );
    }

    return (
      parsedDocument.body.innerHTML
    );
  }

  async function handleSave() {
    setSaving(true);

    try {
      let coverImageUrl:
        | string
        | null =
        existingCoverUrl;

      if (coverFile) {
        coverImageUrl =
          await uploadImageToCloudinary(
            coverFile
          );
      }

      const editorHTML =
        editor?.getHTML() ?? '';

      const preparedBody =
        prepareBodyForSaving(
          editorHTML
        );

      const payload = {
        title,
        slug: slugify(title),
        excerpt,
        body: preparedBody,
        coverImageUrl,
        category,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status,
        publishAt: publishAt
          ? new Date(publishAt)
          : new Date(),
        authorId:
          auth.currentUser?.uid ?? '',
        authorName,
      };

      if (editingId) {
        await updatePost(
          editingId,
          payload as any
        );
      } else {
        await createPost(
          payload as any
        );
      }

      if (status === 'published') {
        await notifyRevalidate(
          category
        );
      }

      router.push('/admin');
    } finally {
      setSaving(false);
    }
  }

  if (loadingPost) {
    return (
      <p className="text-sm text-muted">
        Loading post…
      </p>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold">
        {editingId
          ? 'Edit Post'
          : 'New Post'}
      </h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="form-field"
      />

      <input
        placeholder="Short excerpt for cards / SEO"
        value={excerpt}
        onChange={(e) =>
          setExcerpt(e.target.value)
        }
        className="form-field"
      />

      <div>
        <label className="mb-1 block text-xs text-muted">
          Body
        </label>

        <div className="overflow-hidden rounded-sm border border-rule bg-white">
          <div className="relative flex flex-wrap items-center gap-1 border-b border-rule bg-white p-2">
            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleBold()
                  .run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive('bold')
                  ? 'bg-ink text-paper'
                  : 'hover:bg-[#f3f3f1]'
              }`}
              title="Bold"
            >
              <b>B</b>
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleItalic()
                  .run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive('italic')
                  ? 'bg-ink text-paper'
                  : 'hover:bg-[#f3f3f1]'
              }`}
              title="Italic"
            >
              <i>I</i>
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleMark(
                    'underline'
                  )
                  .run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive(
                  'underline'
                )
                  ? 'bg-ink text-paper'
                  : 'hover:bg-[#f3f3f1]'
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
                  .toggleHeading({
                    level: 2,
                  })
                  .run()
              }
              className={`rounded px-2 py-1 text-xs font-semibold ${
                editor?.isActive(
                  'heading',
                  { level: 2 }
                )
                  ? 'bg-ink text-paper'
                  : 'hover:bg-[#f3f3f1]'
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
                  .toggleHeading({
                    level: 3,
                  })
                  .run()
              }
              className={`rounded px-2 py-1 text-xs font-semibold ${
                editor?.isActive(
                  'heading',
                  { level: 3 }
                )
                  ? 'bg-ink text-paper'
                  : 'hover:bg-[#f3f3f1]'
              }`}
            >
              H3
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleBulletList()
                  .run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive(
                  'bulletList'
                )
                  ? 'bg-ink text-paper'
                  : 'hover:bg-[#f3f3f1]'
              }`}
              title="Bulleted list"
            >
              • List
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleOrderedList()
                  .run()
              }
              className={`rounded px-2 py-1 text-sm ${
                editor?.isActive(
                  'orderedList'
                )
                  ? 'bg-ink text-paper'
                  : 'hover:bg-[#f3f3f1]'
              }`}
              title="Numbered list"
            >
              1. List
            </button>

            <span className="mx-1 h-5 w-px bg-rule" />

            <button
              type="button"
              onClick={() =>
                setEmojiPickerOpen(
                  (value) => !value
                )
              }
              className={`rounded px-2 py-1 text-base ${
                emojiPickerOpen
                  ? 'bg-ink text-paper'
                  : 'hover:bg-[#f3f3f1]'
              }`}
              title="Emoji"
              aria-label="Open emoji picker"
            >
              😊
            </button>

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
                <div className="max-w-[calc(100vw-24px)] overflow-hidden rounded-sm shadow-lg">
                  <EmojiPicker
                    onEmojiClick={(
                      emojiData: EmojiClickData
                    ) => {
                      editor
                        ?.chain()
                        .focus()
                        .insertContent(
                          emojiData.emoji
                        )
                        .run();

                      setEmojiPickerOpen(
                        false
                      );
                    }}
                    previewConfig={{
                      showPreview:
                        false,
                    }}
                    width="100%"
                    height={400}
                    emojiStyle={
                      EmojiStyle.NATIVE
                    }
                    lazyLoadEmojis
                  />
                </div>
              </div>
            )}
          </div>

          <div className="min-h-[240px] overflow-x-auto px-3 py-3 text-sm [&_.tiptap]:min-h-[220px] [&_.tiptap]:outline-none [&_.tiptap_p]:mb-3 [&_.tiptap_h2]:mb-3 [&_.tiptap_h2]:mt-4 [&_.tiptap_h2]:font-serif [&_.tiptap_h2]:text-xl [&_.tiptap_h3]:mb-2 [&_.tiptap_h3]:mt-3 [&_.tiptap_h3]:font-serif [&_.tiptap_h3]:text-lg [&_.tiptap_ul]:mb-3 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:mb-3 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5">
            <EditorContent editor={editor} />
          </div>
        </div>

        <p className="mt-1 text-[11px] text-muted">
          Hashtags such as #ManCity
          appear blue but are not
          clickable. Website addresses
          such as meta.ai become
          clickable automatically. Tap
          😊 to open the full emoji
          picker with search, categories
          and skin tones.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="form-field sm:flex-1"
        >
          {categories.map((c) => (
            <option
              key={c}
              value={c}
            >
              {c}
            </option>
          ))}
        </select>

        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) =>
            setTags(e.target.value)
          }
          className="form-field sm:flex-1"
        />
      </div>

      <div>
        <label className="block text-xs text-muted">
          Cover image
        </label>

        {existingCoverUrl &&
          !coverFile && (
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
            setCoverFile(
              e.target.files?.[0] ??
                null
            )
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
          onChange={(e) =>
            setAuthorName(
              e.target.value
            )
          }
          className="form-field"
        />
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value as PostStatus
            )
          }
          className="form-field"
        >
          <option value="draft">
            Draft
          </option>
          <option value="scheduled">
            Scheduled
          </option>
          <option value="published">
            Published
          </option>
        </select>

        {status === 'scheduled' && (
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) =>
              setPublishAt(
                e.target.value
              )
            }
            className="form-field"
          />
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={
          saving ||
          !title ||
          !authorName
        }
        className="w-full border border-ink bg-ink px-4 py-3 text-sm font-medium text-paper hover:bg-[#343934] disabled:opacity-50 sm:w-auto sm:py-2"
      >
        {saving
          ? 'Saving…'
          : 'Save Post'}
      </button>
    </div>
  );
}
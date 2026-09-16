'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllCommentsForAdmin, deleteComment } from '@/lib/comments';
import { formatRelativeTime } from '@/lib/date';
import type { Comment } from '@/lib/types';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try { setComments(await getAllCommentsForAdmin()); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!window.confirm('Delete this comment?')) return;
    try { await deleteComment(id); setComments((items) => items.filter((item) => item.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  return (
    <div>
      <div className="border-b border-ink pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">Moderation</p>
        <h1 className="mt-1 font-serif text-4xl">Comments</h1>
        <p className="mt-2 text-sm text-muted">Keep an eye on the conversation across published posts.</p>
      </div>
      {error && <p className="mt-5 border border-[#d9c8c8] bg-[#f7eeee] px-4 py-3 text-sm text-red-800">{error}</p>}
      {loading ? <p className="mt-7 text-sm text-muted">Loading comments…</p> : (
        <div className="mt-7">
          {comments.map((comment) => (
            <article key={comment.id} className="border-b border-rule py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{comment.authorName} <span className="font-normal text-muted">· {formatRelativeTime(comment.createdAt)}</span></p>
                  <p className="mt-2 max-w-3xl break-words text-sm leading-6">{comment.text}</p>
                  <Link href={`/posts/${comment.postSlug}`} className="editorial-link mt-2 inline-block text-xs">{comment.postTitle}</Link>
                </div>
                <button onClick={() => remove(comment.id)} className="shrink-0 self-start text-xs text-red-700 underline underline-offset-2">Delete</button>
              </div>
            </article>
          ))}
          {comments.length === 0 && <p className="py-10 text-sm text-muted">No comments yet.</p>}
        </div>
      )}
    </div>
  );
}

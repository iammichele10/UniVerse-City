'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getAllPostsForAdmin, deletePost, setPostStatus } from '@/lib/posts';
import { auth } from '@/lib/firebaseAuth';
import { formatDate } from '@/lib/date';
import type { Post } from '@/lib/types';

const ADMIN_EMAILS = ['francismichele90@gmail.com','gwendolynansong490@gmail.com','kwesicodes@gmail.com','ohemaamercy416@gmail.com','selbybenardo@gmail.com'];

function StatusLabel({ status }: { status: Post['status'] }) {
  return <span className={`border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${status === 'published' ? 'border-[#b8cdb7] text-[#37613c]' : status === 'scheduled' ? 'border-[#bdc8d8] text-navy' : 'border-rule text-muted'}`}>{status}</span>;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPosts() {
    setLoading(true); setError('');
    try { setPosts(await getAllPostsForAdmin()); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setLoading(false); }
  }

  useEffect(() => onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser); setAuthReady(true);
    if (!currentUser?.email || !ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim())) {
      setLoading(false); setError('You must be signed in as an administrator.'); return;
    }
    await loadPosts();
  }), []);

  async function publish(id: string) { try { await setPostStatus(id, 'published'); await loadPosts(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } }
  async function remove(id: string) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try { await deletePost(id); await loadPosts(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  if (!authReady || loading) return <p className="text-sm text-muted">Loading posts…</p>;
  if (!user) return <p className="text-sm text-muted">You must be signed in as an administrator.</p>;

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-ink pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">Publication desk</p><h1 className="mt-1 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">Posts</h1><p className="mt-2 text-sm text-muted">Write, edit and manage everything published on UniVerse-City.</p></div>
        <Link href="/admin/new" className="w-full border border-ink px-4 py-3 text-center text-xs sm:w-auto sm:self-start sm:py-2.5 font-semibold uppercase tracking-[0.12em] transition hover:bg-ink hover:text-paper">New post +</Link>
      </div>

      {error && <div role="alert" className="mt-5 border border-[#d9c8c8] bg-[#f7eeee] px-4 py-3 text-sm text-red-800">{error}</div>}

      <div className="mt-7 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead><tr className="border-b border-ink text-[10px] uppercase tracking-[0.12em] text-muted"><th className="py-3 pr-4">Title</th><th className="pr-4">Status</th><th className="pr-4">Category</th><th className="pr-4">Updated</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{posts.map((p) => <tr key={p.id} className="border-b border-rule"><td className="py-4 pr-4 font-serif text-lg">{p.title}</td><td className="pr-4"><StatusLabel status={p.status} /></td><td className="pr-4 text-muted">{p.category}</td><td className="pr-4 text-muted">{formatDate(p.updatedAt, undefined, '—')}</td><td className="text-right text-xs"><Link href={`/admin/new?id=${p.id}`} className="editorial-link mr-4">Edit</Link>{p.status !== 'published' && <button onClick={() => publish(p.id)} className="editorial-link mr-4">Publish</button>}<button onClick={() => remove(p.id)} className="text-red-700 underline underline-offset-2">Delete</button></td></tr>)}
          {posts.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-muted">No posts yet — create your first one.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-0 sm:hidden">
        {posts.map((p) => <article key={p.id} className="border-b border-rule py-5"><div className="flex items-start gap-3"><h2 className="min-w-0 flex-1 break-words font-serif text-xl leading-tight">{p.title}</h2><StatusLabel status={p.status} /></div><p className="mt-2 text-xs text-muted">{p.category} · {formatDate(p.updatedAt, undefined, '—')}</p><div className="mt-4 flex gap-4 text-xs"><Link href={`/admin/new?id=${p.id}`} className="editorial-link">Edit</Link>{p.status !== 'published' && <button onClick={() => publish(p.id)} className="editorial-link">Publish</button>}<button onClick={() => remove(p.id)} className="text-red-700 underline underline-offset-2">Delete</button></div></article>)}
        {posts.length === 0 && <p className="py-10 text-center text-sm text-muted">No posts yet — create your first one.</p>}
      </div>
    </div>
  );
}

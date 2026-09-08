'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllPostsForAdmin, deletePost, setPostStatus } from '@/lib/posts';
import { formatDate } from '@/lib/date';
import type { Post } from '@/lib/types';

function StatusPill({ status }: { status: Post['status'] }) {
  const styles = {
    published: 'bg-[#E3EEE1] text-[#2F6B3A]',
    scheduled: 'bg-[#E9EEF4] text-navy',
    draft: 'bg-[#EFEEE9] text-muted',
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setPosts(await getAllPostsForAdmin());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading posts…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Posts</h1>
        <Link href="/admin/new" className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white">
          New Post
        </Link>
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {posts.map((p) => (
          <div key={p.id} className="rounded-md border border-rule bg-white p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-sm font-medium leading-snug">{p.title}</span>
              <StatusPill status={p.status} />
            </div>
            <div className="mb-3 text-xs text-muted">
              {p.category} · {formatDate(p.updatedAt, undefined, '—')}
            </div>
            <div className="flex gap-4 text-xs">
              <Link href={`/admin/new?id=${p.id}`} className="text-navy underline">Edit</Link>
              {p.status !== 'published' && (
                <button onClick={() => setPostStatus(p.id, 'published').then(load)} className="text-navy underline">
                  Publish
                </button>
              )}
              <button onClick={() => deletePost(p.id).then(load)} className="text-red-700 underline">Delete</button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No posts yet — create your first one.</p>
        )}
      </div>

      {/* Desktop / tablet: table */}
      <table className="hidden w-full text-left text-sm sm:table">
        <thead>
          <tr className="border-b border-rule text-xs text-muted">
            <th className="py-2 font-medium">Title</th>
            <th className="font-medium">Status</th>
            <th className="font-medium">Category</th>
            <th className="font-medium">Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-b border-rule">
              <td className="py-3">{p.title}</td>
              <td><StatusPill status={p.status} /></td>
              <td>{p.category}</td>
              <td>{formatDate(p.updatedAt, undefined, '—')}</td>
              <td className="space-x-3 text-right text-xs">
                <Link href={`/admin/new?id=${p.id}`} className="text-navy underline">
                  Edit
                </Link>
                {p.status !== 'published' && (
                  <button onClick={() => setPostStatus(p.id, 'published').then(load)} className="text-navy underline">
                    Publish
                  </button>
                )}
                <button onClick={() => deletePost(p.id).then(load)} className="text-red-700 underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr><td colSpan={5} className="py-8 text-center text-muted">No posts yet — create your first one.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { getPublishedPosts } from '@/lib/posts';
import { getAllDailyViews, type DailyView } from '@/lib/analytics';

export default function AnalyticsPage() {
  const [rows, setRows] = useState<DailyView[]>([]);
  const [posts, setPosts] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAllDailyViews(), getPublishedPosts()]).then(([views, published]) => {
      setRows(views); setPosts(published.map((p) => ({ id: p.id, title: p.title, slug: p.slug })));
    }).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const total = rows.reduce((sum, row) => sum + Number(row.views || 0), 0);
  const recent = rows.filter((row) => row.date >= new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)).reduce((sum, row) => sum + Number(row.views || 0), 0);
  const byPost = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row) => map.set(row.postId, (map.get(row.postId) || 0) + Number(row.views || 0)));
    return [...map.entries()].map(([postId, views]) => ({ postId, views, post: posts.find((p) => p.id === postId) })).sort((a, b) => b.views - a.views);
  }, [rows, posts]);

  return (
    <div>
      <div className="border-b border-ink pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">Audience</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Analytics</h1>
        <p className="mt-2 text-sm text-muted">A simple view of readership recorded by the site.</p>
      </div>

      {error && (
        <p className="mt-5 border border-[#d9c8c8] bg-[#f7eeee] px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-7 grid border-y border-rule sm:grid-cols-2">
        <div className="border-b border-rule px-1 py-5 sm:border-b-0 sm:border-r">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">All recorded views</p>
          <p className="mt-1 font-serif text-3xl sm:text-4xl">{total}</p>
        </div>
        <div className="px-1 py-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Last 7 days</p>
          <p className="mt-1 font-serif text-3xl sm:text-4xl">{recent}</p>
        </div>
      </div>

      <section className="mt-9">
        <div className="mb-4 border-b border-rule pb-2">
          <h2 className="font-serif text-2xl">Views by post</h2>
        </div>

        {/* Mobile: each post gets its own row so the title and number are visible together. */}
        <div className="divide-y divide-rule border-y border-rule md:hidden">
          {byPost.map(({ postId, views, post }) => (
            <div key={postId} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4">
              <div className="min-w-0">
                <p className="font-serif text-lg leading-snug break-words">
                  {post?.title ?? postId}
                </p>
                {post?.slug && (
                  <a href={`/posts/${post.slug}`} className="editorial-link mt-2 inline-block text-xs">
                    View post
                  </a>
                )}
              </div>
              <div className="self-start text-right">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Views</p>
                <p className="mt-0.5 font-serif text-2xl leading-none">{views}</p>
              </div>
            </div>
          ))}
          {byPost.length === 0 && (
            <p className="py-8 text-sm text-muted">No view data yet.</p>
          )}
        </div>

        {/* Desktop: keep the clean table layout. */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink text-[10px] uppercase tracking-[0.12em] text-muted">
                <th className="py-3 pr-4">Post</th>
                <th className="pr-4">Views</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {byPost.map(({ postId, views, post }) => (
                <tr key={postId} className="border-b border-rule">
                  <td className="py-4 pr-4 font-serif text-lg">{post?.title ?? postId}</td>
                  <td className="pr-4">{views}</td>
                  <td>
                    {post?.slug ? (
                      <a href={`/posts/${post.slug}`} className="editorial-link text-xs">View</a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              {byPost.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-muted">No view data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

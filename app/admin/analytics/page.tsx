'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore/lite';

import { getAllDailyViews, type DailyView } from '@/lib/analytics';
import { db } from '@/lib/firebase';

type PostInfo = {
  id: string;
  title: string;
  slug: string;
};

type PostViewRow = {
  postId: string;
  title: string;
  slug: string;
  views: number;
};

export default function AnalyticsPage() {
  const [rows, setRows] = useState<DailyView[]>([]);
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError('');

        // Get all view records
        const dailyViews = await getAllDailyViews();

        // Get published posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('status', '==', 'published')
        );

        const postsSnapshot = await getDocs(postsQuery);

        const postList: PostInfo[] = postsSnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            title:
              typeof data.title === 'string'
                ? data.title
                : 'Untitled post',
            slug:
              typeof data.slug === 'string'
                ? data.slug
                : '',
          };
        });

        setRows(dailyViews);
        setPosts(postList);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : String(e)
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  /*
   * Total views across all daily view records.
   */
  const total = rows.reduce(
    (sum, row) => sum + Number(row.views || 0),
    0
  );

  /*
   * Views from the last 7 days.
   */
  const recent = rows
    .filter(
      (row) =>
        row.date >=
        new Date(
          Date.now() - 6 * 86400000
        )
          .toISOString()
          .slice(0, 10)
    )
    .reduce(
      (sum, row) =>
        sum + Number(row.views || 0),
      0
    );

  /*
   * Match each post ID with its actual post title.
   */
  const byPost = useMemo<PostViewRow[]>(() => {
    const map = new Map<string, number>();

    rows.forEach((row) => {
      map.set(
        row.postId,
        (map.get(row.postId) || 0) +
          Number(row.views || 0)
      );
    });

    return [...map.entries()]
      .map(([postId, views]) => {
        const post = posts.find(
          (item) => item.id === postId
        );

        return {
          postId,
          title: post?.title || 'Post no longer available',
          slug: post?.slug || '',
          views,
        };
      })
      .sort((a, b) => b.views - a.views);
  }, [rows, posts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Analytics
        </h1>

        <a
          href="/admin"
          className="text-sm text-navy underline"
        >
          Back to posts
        </a>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">
            Unable to load analytics.
          </p>

          <p className="mt-1">
            {error}
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-rule bg-white p-4">
          <div className="text-sm text-muted">
            Total views
          </div>

          <div className="mt-1 text-2xl font-semibold">
            {loading ? '—' : total}
          </div>
        </div>

        <div className="rounded-md border border-rule bg-white p-4">
          <div className="text-sm text-muted">
            Last 7 days
          </div>

          <div className="mt-1 text-2xl font-semibold">
            {loading ? '—' : recent}
          </div>
        </div>
      </div>

      {/* Views by post */}
      <section>
        <h2 className="mb-3 font-semibold">
          Views by post
        </h2>

        <div className="overflow-x-auto rounded-md border border-rule bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-rule text-muted">
                <th className="p-3">
                  Post
                </th>

                <th className="p-3">
                  Views
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={2}
                    className="p-6 text-center text-muted"
                  >
                    Loading analytics...
                  </td>
                </tr>
              ) : byPost.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="p-6 text-center text-muted"
                  >
                    No views recorded yet.
                  </td>
                </tr>
              ) : (
                byPost.map((post) => (
                  <tr
                    key={post.postId}
                    className="border-b border-rule last:border-b-0"
                  >
                    <td className="p-3">
                      {post.slug ? (
                        <a
                          href={`/posts/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-navy hover:underline"
                        >
                          {post.title}
                        </a>
                      ) : (
                        <span className="font-medium">
                          {post.title}
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      {post.views}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
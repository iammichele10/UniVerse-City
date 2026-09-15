'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  getAllPostsForAdmin,
  deletePost,
  setPostStatus,
} from '@/lib/posts';
import { auth } from '@/lib/firebaseAuth';
import { formatDate } from '@/lib/date';
import type { Post } from '@/lib/types';

const ADMIN_EMAILS = [
  'francismichele90@gmail.com',
  'gwendolynansong490@gmail.com',
  'kwesicodes@gmail.com',
  'ohemaamercy416@gmail.com',
  'selbybenardo@gmail.com',
];

function StatusPill({ status }: { status: Post['status'] }) {
  const styles = {
    published: 'bg-[#E3EEE1] text-[#2F6B3A]',
    scheduled: 'bg-[#E9EEF4] text-navy',
    draft: 'bg-[#EFEEE9] text-muted',
  } as const;

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPosts() {
    setLoading(true);
    setError('');

    try {
      const data = await getAllPostsForAdmin();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load admin posts:', err);

      const message =
        err instanceof Error
          ? err.message
          : String(err);

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);

        if (!currentUser) {
          setLoading(false);
          setError(
            'You must be signed in as an administrator.'
          );
          return;
        }

        const email = currentUser.email?.toLowerCase().trim();

        if (!email) {
          setLoading(false);
          setError(
            'Your Firebase account does not have an email address.'
          );
          return;
        }

        if (!ADMIN_EMAILS.includes(email)) {
          setLoading(false);
          setError(
            `This account (${email}) is not registered as an administrator.`
          );
          return;
        }

        await loadPosts();
      }
    );

    return unsubscribe;
  }, []);

  async function handlePublish(id: string) {
    try {
      setError('');
      await setPostStatus(id, 'published');
      await loadPosts();
    } catch (err) {
      console.error('Failed to publish post:', err);

      const message =
        err instanceof Error
          ? err.message
          : String(err);

      setError(message);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post?'
    );

    if (!confirmed) return;

    try {
      setError('');
      await deletePost(id);
      await loadPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);

      const message =
        err instanceof Error
          ? err.message
          : String(err);

      setError(message);
    }
  }

  if (!authReady || loading) {
    return (
      <p className="text-sm text-muted">
        Loading posts…
      </p>
    );
  }

  if (!user) {
    return (
      <div className="rounded-md border border-rule bg-white p-5">
        <p className="text-sm text-muted">
          You must be signed in as an administrator to view posts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Posts
        </h1>

        <Link
          href="/admin/new"
          className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white"
        >
          New Post
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-[#D9C8C8] bg-[#F7EEEE] px-4 py-3 text-sm text-red-800"
        >
          <p className="font-medium">
            Unable to load posts.
          </p>

          <p className="mt-1 break-words">
            {error}
          </p>
        </div>
      )}

      {/* Mobile */}
      <div className="space-y-3 sm:hidden">
        {posts.map((p) => (
          <div
            key={p.id}
            className="rounded-md border border-rule bg-white p-3"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-sm font-medium leading-snug">
                {p.title}
              </span>

              <StatusPill status={p.status} />
            </div>

            <div className="mb-3 text-xs text-muted">
              {p.category} ·{' '}
              {formatDate(p.updatedAt, undefined, '—')}
            </div>

            <div className="flex gap-4 text-xs">
              <Link
                href={`/admin/new?id=${p.id}`}
                className="text-navy underline"
              >
                Edit
              </Link>

              {p.status !== 'published' && (
                <button
                  type="button"
                  onClick={() => handlePublish(p.id)}
                  className="text-navy underline"
                >
                  Publish
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="text-red-700 underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && !error && (
          <p className="py-8 text-center text-sm text-muted">
            No posts yet — create your first one.
          </p>
        )}
      </div>

      {/* Desktop / tablet */}
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
            <tr
              key={p.id}
              className="border-b border-rule"
            >
              <td className="py-3">
                {p.title}
              </td>

              <td>
                <StatusPill status={p.status} />
              </td>

              <td>{p.category}</td>

              <td>
                {formatDate(
                  p.updatedAt,
                  undefined,
                  '—'
                )}
              </td>

              <td className="space-x-3 text-right text-xs">
                <Link
                  href={`/admin/new?id=${p.id}`}
                  className="text-navy underline"
                >
                  Edit
                </Link>

                {p.status !== 'published' && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePublish(p.id)
                    }
                    className="text-navy underline"
                  >
                    Publish
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(p.id)
                  }
                  className="text-red-700 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {posts.length === 0 && !error && (
            <tr>
              <td
                colSpan={5}
                className="py-8 text-center text-muted"
              >
                No posts yet — create your first one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
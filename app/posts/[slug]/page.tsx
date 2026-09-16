import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/posts';
import { Comments } from '@/lib/CommentsSection';
import { LikeButton } from '@/lib/LikeButton';
import { formatDate } from '@/lib/date';
import { ViewTracker } from '@/lib/ViewTracker';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post not found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `/posts/${post.slug}`,
      images: post.coverImageUrl
        ? [{ url: post.coverImageUrl }]
        : undefined,
    },
  };
}

// Same slugging rule used by Masthead.tsx and
// app/category/[slug]/page.tsx.
function toSlug(cat: string) {
  return cat
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and');
}

/**
 * Makes hashtags from older posts blue without changing
 * the actual saved Firestore content.
 *
 * New posts already contain .hashtag-blue, so those are
 * left alone.
 */
function formatOldHashtags(html: string): string {
  if (!html) return html;

  // Protect hashtags that are already formatted.
  const protectedHashtags: string[] = [];

  let processed = html.replace(
    /<span[^>]*class=["'][^"']*hashtag-blue[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,
    (match) => {
      protectedHashtags.push(match);
      return `___HASHTAG_BLUE_${protectedHashtags.length - 1}___`;
    }
  );

  // Only process visible text outside HTML tags.
  processed = processed.replace(
    /(^|[\s>])(#(?:[A-Za-z0-9_]+(?:[-'][A-Za-z0-9_]+)*))/g,
    '$1<span class="hashtag-blue">$2</span>'
  );

  // Restore hashtags that were already formatted.
  processed = processed.replace(
    /___HASHTAG_BLUE_(\d+)___/g,
    (_, index) => protectedHashtags[Number(index)]
  );

  return processed;
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  // Supports both old and new post content.
  const formattedBody = formatOldHashtags(post.body);

  return (
    <main className="mx-auto max-w-3xl">
      <ViewTracker postId={post.id} />
      <article className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Back to category */}
        <a
          href={`/category/${toSlug(post.category)}`}
          className="mb-5 inline-block text-sm text-navy"
        >
          ← Back to {post.category}
        </a>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="mb-6 flex h-52 w-full items-center justify-center overflow-hidden rounded-sm bg-[#F5F4F0] sm:h-80">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        {/* Category */}
        <div className="mb-2 text-xs font-semibold tracking-wide text-brass">
          {post.category.toUpperCase()}
        </div>

        {/* Title */}
        <h1 className="mb-2 font-serif text-2xl leading-tight text-ink sm:text-3xl">
          {post.title}
        </h1>

        {/* Author and date */}
        <div className="mb-6 text-xs text-muted">
          By {post.authorName} ·{' '}
          {formatDate(
            post.publishAt,
            {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            },
            '—'
          )}
        </div>

        {/* Post body */}
        <div
          className="
            prose
            prose-sm
            max-w-none
            text-[15px]
            leading-relaxed
            text-[#2b2f2c]
            [&_p]:mb-4
            [&_.hashtag-blue]:!text-blue-600
            [&_.hashtag-blue]:!no-underline
          "
          dangerouslySetInnerHTML={{ __html: formattedBody }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-rule bg-paper-raised px-2.5 py-1 text-xs text-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Likes and comments */}
        <div className="mt-5 flex items-center gap-6 border-t border-rule pt-3">
          <LikeButton postId={post.id} />
          <div className="text-sm text-muted">
            Comments below
          </div>
        </div>

        {/* Comments */}
        <Comments
          postId={post.id}
          postSlug={post.slug}
          postTitle={post.title}
        />

      </article>
    </main>
  );
}
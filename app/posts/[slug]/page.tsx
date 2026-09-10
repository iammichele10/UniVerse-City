import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/posts';
import { Comments } from '@/lib/CommentsSection';
import { formatDate } from '@/lib/date';

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
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

// Same slugging rule used by Masthead.tsx and app/category/[slug]/page.tsx,
// so "Back to <category>" lands on the matching category tab.
function toSlug(cat: string) {
  return cat.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== 'published') notFound();

  return (
    <main className="mx-auto max-w-3xl">
      <article className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
        <a href={`/category/${toSlug(post.category)}`} className="mb-5 inline-block text-sm text-navy">
          ← Back to {post.category}
        </a>
        {post.coverImageUrl && (
          <div className="mb-6 flex h-52 w-full items-center justify-center overflow-hidden rounded-sm bg-[#F5F4F0] sm:h-80">
            <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-contain" />
          </div>
        )}
        <div className="mb-2 text-xs font-semibold tracking-wide text-brass">
          {post.category.toUpperCase()}
        </div>
        <h1 className="mb-2 font-serif text-2xl leading-tight text-ink sm:text-3xl">{post.title}</h1>
        <div className="mb-6 text-xs text-muted">
          By {post.authorName} · {formatDate(post.publishAt, { month: 'long', day: 'numeric', year: 'numeric' }, '—')}
        </div>
        <div
          className="prose prose-sm max-w-none text-[15px] leading-relaxed text-[#2b2f2c] [&_p]:mb-4"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
        {post.tags.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full border border-rule bg-paper-raised px-2.5 py-1 text-xs text-muted">
                #{t}
              </span>
            ))}
          </div>
        )}
        <Comments postId={post.id} postSlug={post.slug} postTitle={post.title} />
      </article>
    </main>
  );
}

import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { Masthead } from '@/lib/Masthead';
import { formatDate } from '@/lib/date';

export const revalidate = 60;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()]);
  if (!post || post.status !== 'published') notFound();

  return (
    <main className="mx-auto max-w-3xl">
      <Masthead settings={settings} currentCategory={post.category} />
      <article className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
        <a href="/" className="mb-5 inline-block text-sm text-navy">← Back to all posts</a>
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
      </article>
    </main>
  );
}

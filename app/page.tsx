import Link from 'next/link';
import { getPublishedPosts } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { Masthead } from '@/lib/Masthead';
import { formatDate } from '@/lib/date';

// Backstop cache; actual freshness comes from on-demand revalidation
// triggered the moment a post is published (see app/api/revalidate/route.ts).
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSettings()]);
  const [lead, ...rest] = posts;

  return (
    <main className="mx-auto max-w-3xl">
      <Masthead settings={settings} />

      <div className="px-4 py-7 sm:px-6 sm:py-9">
        {!lead && <p className="text-muted">No posts yet.</p>}

        {lead && (
          <Link href={`/posts/${lead.slug}`} className="mb-8 grid gap-5 border-b border-rule pb-8 sm:grid-cols-2 sm:gap-8">
            <div>
              <div className="mb-2 text-xs font-semibold tracking-wide text-brass">
                {lead.category.toUpperCase()}
              </div>
              <h2 className="mb-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">{lead.title}</h2>
              <p className="mb-3 text-[15px] leading-relaxed text-[#484c46]">{lead.excerpt}</p>
              <div className="text-xs text-muted">
                {lead.authorName} · {formatDate(lead.publishAt, { month: 'long', day: 'numeric', year: 'numeric' }, '—')}
              </div>
            </div>
            {lead.coverImageUrl && (
              <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-sm bg-[#F5F4F0] sm:h-full">
                <img src={lead.coverImageUrl} alt="" className="h-full w-full object-contain" />
              </div>
            )}
          </Link>
        )}

        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 sm:gap-y-6">
          {rest.map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="flex gap-3 border-b border-rule pb-5 sm:gap-4">
              {post.coverImageUrl && (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[#F5F4F0] sm:h-24 sm:w-24">
                  <img src={post.coverImageUrl} alt="" className="h-full w-full object-contain" />
                </div>
              )}
              <div className="min-w-0">
                <div className="mb-1.5 text-xs font-semibold tracking-wide text-brass">
                  {post.category.toUpperCase()}
                </div>
                <h3 className="mb-1.5 font-serif text-base leading-tight text-ink sm:text-lg">{post.title}</h3>
                <div className="text-xs text-muted">
                  {post.authorName} · {formatDate(post.publishAt, { month: 'short', day: 'numeric', year: 'numeric' }, '—')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

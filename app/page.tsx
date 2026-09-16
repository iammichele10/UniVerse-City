import Link from 'next/link';
import { getPublishedPosts } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { Masthead } from '@/lib/Masthead';
import { formatDate } from '@/lib/date';
import CopyrightNotice from '@/components/CopyrightNotice';
import { TrendingNow } from '@/lib/TrendingNow';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://universecityhub.com';

export default async function HomePage() {
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSettings()]);
  const [lead, ...rest] = posts;

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'UniVerse-City',
    url: SITE_URL,
  };

  const secondary = rest.slice(0, 6);
  const more = rest.slice(6);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      <main>
        <Masthead settings={settings} />

        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <section className="py-7 sm:py-9">
            <TrendingNow />

            {!lead && (
              <div className="border-y border-rule py-16 text-center">
                <p className="font-serif text-2xl">No stories yet.</p>
                <p className="mt-2 text-sm text-muted">New stories will appear here when they are published.</p>
              </div>
            )}

            {lead && (
              <Link href={`/posts/${lead.slug}`} className="group grid gap-6 border-b border-ink pb-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-10">
                <div className="order-2 lg:order-1 lg:py-3">
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">
                    {lead.category}
                  </div>
                  <h2 className="max-w-3xl font-serif text-4xl leading-[1.03] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                    {lead.title}
                  </h2>
                  <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#484c46] sm:text-base">
                    {lead.excerpt}
                  </p>
                  <div className="mt-5 text-xs text-muted">
                    {lead.authorName} · {formatDate(lead.publishAt, { month: 'long', day: 'numeric', year: 'numeric' }, '—')}
                  </div>
                  <div className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy underline decoration-brass underline-offset-4">
                    Read story →
                  </div>
                </div>

                {lead.coverImageUrl && (
                  <div className="order-1 overflow-hidden bg-[#e8e5dc] lg:order-2">
                    <img src={lead.coverImageUrl} alt="" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]" />
                  </div>
                )}
              </Link>
            )}
          </section>

          {secondary.length > 0 && (
            <section className="border-b border-rule pb-10">
              <div className="mb-5 flex items-end justify-between border-b border-rule pb-2">
                <h2 className="font-serif text-2xl">Latest stories</h2>
                <span className="text-[10px] uppercase tracking-[0.15em] text-muted">New</span>
              </div>

              <div className="grid gap-x-8 md:grid-cols-2">
                {secondary.map((post) => (
                  <Link key={post.id} href={`/posts/${post.slug}`} className="group flex gap-4 border-b border-rule py-5">
                    {post.coverImageUrl && (
                      <div className="h-24 w-28 shrink-0 overflow-hidden bg-[#e8e5dc] sm:h-28 sm:w-36">
                        <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brass">{post.category}</div>
                      <h3 className="font-serif text-xl leading-tight tracking-[-0.015em]">{post.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{post.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {more.length > 0 && (
            <section className="py-10">
              <div className="mb-5 border-b border-rule pb-2">
                <h2 className="font-serif text-2xl">More from UniVerse-City</h2>
              </div>
              <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {more.map((post) => (
                  <Link key={post.id} href={`/posts/${post.slug}`} className="group border-b border-rule py-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brass">{post.category}</div>
                    <h3 className="mt-2 font-serif text-xl leading-tight">{post.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{post.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <CopyrightNotice />
      </main>
    </>
  );
}

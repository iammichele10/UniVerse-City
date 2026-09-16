import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPostsByCategory } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { Masthead } from '@/lib/Masthead';
import { formatDate } from '@/lib/date';

export const dynamic = 'force-dynamic';

function slugToCategory(slug: string, categories: string[]) {
  return categories.find((c) => c.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getSettings();
  const category = slugToCategory(slug, settings.categories) ?? slug;
  return {
    title: category,
    description: `Latest ${category} stories from UniVerse-City.`,
    robots: { index: false, follow: true },
  };
}

export async function generateStaticParams() {
  const settings = await getSettings();
  return settings.categories.map((cat) => ({ slug: cat.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const settings = await getSettings();
  const category = slugToCategory(slug, settings.categories) ?? slug;
  const posts = await getPublishedPostsByCategory(category);

  return (
    <main>
      <Masthead settings={settings} currentCategory={category} />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-7 border-b border-ink pb-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">Section</p>
          <h1 className="font-serif text-4xl tracking-[-0.025em] sm:text-5xl">{category}</h1>
        </div>

        <div className="grid gap-x-10 md:grid-cols-2">
          {posts.map((post, index) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group grid grid-cols-[1fr_auto] gap-4 border-b border-rule py-5 sm:gap-6">
              <div className="min-w-0">
                <h2 className="font-serif text-xl leading-tight group-hover:underline sm:text-2xl">{post.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{post.excerpt}</p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-muted">{post.authorName} · {formatDate(post.publishAt, { month: 'short', day: 'numeric', year: 'numeric' }, '—')}</p>
              </div>
              {post.coverImageUrl && (
                <div className="h-24 w-24 overflow-hidden bg-[#e8e5dc] sm:h-28 sm:w-32">
                  <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
              )}
            </Link>
          ))}
        </div>

        {posts.length === 0 && <p className="py-12 text-center text-sm text-muted">No posts in this section yet.</p>}
      </div>
    </main>
  );
}

import Link from 'next/link';
import { getPublishedPostsByCategory } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { Masthead } from '@/lib/Masthead';

export const revalidate = 60; // backstop; publish also triggers on-demand revalidation

export async function generateStaticParams() {
  const settings = await getSettings();
  return settings.categories.map((cat) => ({
    slug: cat.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
  }));
}

function slugToCategory(slug: string, categories: string[]) {
  return categories.find(
    (c) => c.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === slug
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const settings = await getSettings();
  const category = slugToCategory(slug, settings.categories) ?? slug;
  const posts = await getPublishedPostsByCategory(category);

  return (
    <main className="mx-auto max-w-3xl">
      <Masthead settings={settings} currentCategory={category} />
      <div className="px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="mb-1 font-serif text-xl text-ink sm:text-2xl">{category}</h1>
      <div className="mb-8 h-px bg-rule" />
      <div className="space-y-5">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="flex items-center justify-between gap-4 border-b border-rule pb-5"
          >
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 font-serif text-base text-ink sm:text-lg">{post.title}</h2>
              <p className="text-sm text-muted">{post.excerpt}</p>
            </div>
            {post.coverImageUrl && (
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-[#F5F4F0] sm:h-24 sm:w-24">
                <img src={post.coverImageUrl} alt="" className="h-full w-full object-contain" />
              </div>
            )}
          </Link>
        ))}
        {posts.length === 0 && <p className="text-muted">No posts in this section yet.</p>}
      </div>
      </div>
    </main>
  );
}

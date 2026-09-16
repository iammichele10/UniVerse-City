import Link from 'next/link';
import { getPublishedPosts } from './posts';
import { getRecentDailyViews } from './analytics';

export async function TrendingNow() {
  const [posts, daily] = await Promise.all([getPublishedPosts(), getRecentDailyViews(7)]);
  const totals = new Map<string, number>();
  for (const item of daily) totals.set(item.postId, (totals.get(item.postId) || 0) + Number(item.views || 0));

  const ranked = [...posts]
    .sort((a, b) => (totals.get(b.id) || 0) - (totals.get(a.id) || 0))
    .filter((post) => (totals.get(post.id) || 0) > 0)
    .slice(0, 5);

  if (!ranked.length) return null;

  return (
    <section className="mb-8 border-y border-rule py-4 sm:py-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-xl">Popular right now</h2>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Last 7 days</span>
      </div>
      <div className="grid gap-x-8 sm:grid-cols-2">
        {ranked.map((post, index) => (
          <Link key={post.id} href={`/posts/${post.slug}`} className="group flex gap-3 border-b border-rule py-3 last:border-0">
            <span className="font-serif text-lg text-[#a8a49a]">{String(index + 1).padStart(2, '0')}</span>
            <span className="min-w-0 flex-1 text-sm leading-5 text-ink group-hover:underline">{post.title}</span>
            <span className="shrink-0 text-[10px] text-muted">{totals.get(post.id)} views</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

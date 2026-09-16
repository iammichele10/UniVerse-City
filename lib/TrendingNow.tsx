import Link from 'next/link';
import { getPublishedPosts } from './posts';
import { getRecentDailyViews } from './analytics';

export async function TrendingNow() {
  const [posts, daily] = await Promise.all([getPublishedPosts(), getRecentDailyViews(7)]);
  const totals = new Map<string, number>();
  for (const item of daily) totals.set(item.postId, (totals.get(item.postId) || 0) + Number(item.views || 0));
  const ranked = [...posts].sort((a, b) => (totals.get(b.id) || 0) - (totals.get(a.id) || 0)).filter((p) => (totals.get(p.id) || 0) > 0).slice(0, 5);
  if (!ranked.length) return null;
  return (
    <section className="mb-8 border-y border-rule py-5">
      <h2 className="mb-3 font-serif text-xl text-ink">Trending Now</h2>
      <div className="space-y-3">
        {ranked.map((post, index) => (
          <Link key={post.id} href={`/posts/${post.slug}`} className="flex items-start gap-3">
            <span className="text-sm text-muted">{index + 1}.</span>
            <span className="min-w-0 flex-1 text-sm font-medium text-ink">{post.title}</span>
            <span className="text-xs text-muted">{totals.get(post.id)} views</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

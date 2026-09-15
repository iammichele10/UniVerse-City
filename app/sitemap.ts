import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/posts';
import { getSettings } from '@/lib/settings';

const SITE_URL = 'https://universecityhub.com';

function categorySlug(category: string) {
  return category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
}

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, settings] = await Promise.all([
    getPublishedPosts(),
    getSettings(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...settings.categories.map((category) => ({
      url: `${SITE_URL}/category/${categorySlug(category)}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}
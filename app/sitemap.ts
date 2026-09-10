import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/posts';
import { getSettings } from '@/lib/settings';

const SITE_URL = 'https://universecityhub.com';

function categorySlug(category: string) {
  return category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, settings] = await Promise.all([
    getPublishedPosts(),
    getSettings(),
  ]);

  // Do not pass Firestore Timestamp objects through Next's sitemap metadata.
  // The post dates in Firestore are Timestamp values, and malformed/undefined
  // date values can make Next fail while prerendering /sitemap.xml.
  // lastModified is optional in a sitemap, so the safest approach here is to
  // omit it and let Google use the page itself to determine freshness.
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

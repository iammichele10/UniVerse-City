import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Called right after a post is created/updated/published from the admin
// panel, so the public site reflects the change within a second or two
// instead of waiting for the 60s backstop cache to expire.
export async function POST(req: NextRequest) {
  const { category, postSlug } = await req.json().catch(() => ({ category: null, postSlug: null }));

  revalidatePath('/');
  if (category) {
    const slug = category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    revalidatePath(`/category/${slug}`);
  }
  if (postSlug) {
    revalidatePath(`/posts/${postSlug}`);
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}

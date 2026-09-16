'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  async function handleSignIn() { setError(null); try { await signInWithGoogle(); router.push('/admin'); } catch (err: any) { setError(err.message ?? 'Sign-in failed.'); } }
  return <main className="flex min-h-screen items-center justify-center bg-white px-5"><div className="w-full max-w-md border-y border-ink py-8 sm:py-10 text-center"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">UniVerse-City</div><h1 className="mt-2 font-serif text-3xl sm:text-4xl">Publication desk</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">Sign in with an approved Google account to manage posts, comments, analytics and settings.</p><button onClick={handleSignIn} className="mt-7 w-full border border-ink bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-[#343934]">Sign in with Google</button>{error && <p className="mt-4 text-xs text-red-700">{error}</p>}</div></main>;
}

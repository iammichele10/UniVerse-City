'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSignIn() {
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/admin');
    } catch (err: any) {
      setError(err.message ?? 'Sign-in failed.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper font-sans">
      <div className="w-full max-w-sm rounded-lg border border-rule bg-paper-raised p-9 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-navy font-serif text-lg text-white">
          YV
        </div>
        <h2 className="mb-1 text-lg font-semibold">Admin Sign In</h2>
        <p className="mb-5 text-sm text-muted">
          Sign in with your Google account to manage The Young Voice.
        </p>
        <button
          onClick={handleSignIn}
          className="w-full rounded-md border border-rule bg-white py-2.5 text-sm font-medium text-ink"
        >
          Sign in with Google
        </button>
        {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}

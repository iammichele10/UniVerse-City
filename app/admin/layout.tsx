'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from 'firebase/auth';
import { watchAdminAuth, isEmailAdmin, signOutAdmin } from '@/lib/adminAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = watchAdminAuth(async (u) => {
      if (pathname === '/admin/login') {
        setChecked(true);
        return;
      }
      if (!u || !u.email || !(await isEmailAdmin(u.email))) {
        router.push('/admin/login');
        return;
      }
      setUser(u);
      setChecked(true);
    });
    return () => unsub();
  }, [pathname, router]);

  if (!checked) return <div className="p-8 font-sans text-sm text-muted">Checking access…</div>;

  if (pathname === '/admin/login') return <>{children}</>;

  const initials = (user?.displayName || user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-paper font-sans">
      <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-rule bg-paper-raised px-4 py-3 sm:px-6 sm:py-3.5">
        <span className="text-sm font-semibold">The Young Voice — Admin</span>
        <div className="flex items-center gap-2.5 text-sm text-muted sm:gap-3">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white">
            {initials}
          </div>
          <span className="hidden sm:inline">{user?.email}</span>
          <a href="/admin/comments" className="whitespace-nowrap text-navy underline">Comments</a>
          <a href="/admin/settings" className="whitespace-nowrap text-navy underline">Settings</a>
          <button
            onClick={() => signOutAdmin().then(() => router.push('/admin/login'))}
            className="whitespace-nowrap text-muted underline"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4 sm:p-6">{children}</main>
    </div>
  );
}

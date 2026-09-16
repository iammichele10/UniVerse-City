'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { watchAdminAuth, isEmailAdmin, signOutAdmin } from '@/lib/adminAuth';

const nav = [
  { href: '/admin', label: 'Posts' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/comments', label: 'Comments' },
  { href: '/admin/settings', label: 'Settings' },
];

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
      if (!u?.email || !(await isEmailAdmin(u.email))) {
        router.replace('/admin/login');
        return;
      }
      setUser(u);
      setChecked(true);
    });
    return () => unsub();
  }, [pathname, router]);

  if (!checked) return <div className="min-h-screen bg-white p-6 text-sm text-muted">Checking access…</div>;
  if (pathname === '/admin/login') return <>{children}</>;

  const initials = (user?.displayName || user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-ink">
      <header className="border-b border-ink bg-white-raised">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3 sm:flex-nowrap sm:py-0">
            <div>
              <a href="/admin" className="font-serif text-xl font-semibold tracking-[-0.02em]">UniVerse-City</a>
              <span className="ml-1 text-[10px] uppercase tracking-[0.16em] text-muted sm:ml-2">Admin</span>
            </div>
            <div className="flex max-w-full items-center gap-2 text-xs text-muted sm:gap-3">
              <span className="hidden max-w-[260px] truncate sm:block">{user?.email}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-rule bg-white font-semibold text-navy">{initials}</span>
              <button onClick={() => signOutAdmin().then(() => router.push('/admin/login'))} className="editorial-link shrink-0 text-xs">Sign out</button>
            </div>
          </div>
          <nav className="flex gap-0 overflow-x-auto border-t border-rule scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0" aria-label="Admin navigation">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className={`nav-link ${pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)) ? 'nav-link-active' : ''}`}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-9">{children}</main>
    </div>
  );
}

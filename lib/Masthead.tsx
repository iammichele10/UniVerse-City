import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';

function toSlug(cat: string) {
  return cat.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
}

export function Masthead({
  settings,
  currentCategory,
  currentPage,
  showNav = true,
}: {
  settings: SiteSettings;
  currentCategory?: string;
  currentPage?: 'about';
  showNav?: boolean;
}) {
  return (
    <header className="border-b-[3px] border-double border-ink px-4 pb-4 pt-6 text-center sm:px-6 sm:pt-8">
      <Link href="/" className="mx-auto mb-3 flex h-16 w-fit justify-center sm:h-20">
        <img src="/logo.png" alt={settings.siteName} className="h-full w-auto object-contain" />
      </Link>
      <div className="mb-2 text-xs tracking-wide text-muted">
        Est. {settings.estYear} · Vol. 1
      </div>
      <Link href="/">
        <h1 className="mb-1 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {settings.siteName}
        </h1>
      </Link>
      <div className="text-sm italic text-muted">{settings.tagline}</div>
      {showNav && (
        <nav className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-rule pt-3 text-sm">
          <Link
            href="/"
            className={`pb-0.5 ${!currentCategory && !currentPage ? 'border-b-2 border-brass' : ''}`}
          >
            All Posts
          </Link>
          {settings.categories.map((cat) => (
            <Link
              key={cat}
              href={`/category/${toSlug(cat)}`}
              className={`pb-0.5 ${currentCategory === cat ? 'border-b-2 border-brass' : ''}`}
            >
              {cat}
            </Link>
          ))}
          <Link
            href="/about"
            className={`pb-0.5 ${currentPage === 'about' ? 'border-b-2 border-brass' : ''}`}
          >
            About
          </Link>
        </nav>
      )}
    </header>
  );
}

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
    <header className="site-masthead">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center justify-between border-b border-rule py-3 text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="hidden sm:block">Student publication</span>
          <span className="sm:hidden">UniVerse-City</span>
          <span>Est. {settings.estYear}</span>
        </div>

        <div className="py-6 text-center sm:py-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <img
              src="/logo.png"
              alt={settings.siteName}
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>
          <Link href="/" className="block">
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
              {settings.siteName}
            </h1>
          </Link>
          <p className="mt-1 text-sm italic text-muted">{settings.tagline}</p>
        </div>

        {showNav && (
          <nav className="border-t border-rule" aria-label="Main navigation">
            <div className="flex gap-0 overflow-x-auto scrollbar-none">
              <Link
                href="/"
                className={`nav-link ${!currentCategory && !currentPage ? 'nav-link-active' : ''}`}
              >
                All Posts
              </Link>
              {settings.categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${toSlug(cat)}`}
                  className={`nav-link ${currentCategory === cat ? 'nav-link-active' : ''}`}
                >
                  {cat}
                </Link>
              ))}
              <Link
                href="/about"
                className={`nav-link ${currentPage === 'about' ? 'nav-link-active' : ''}`}
              >
                About
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

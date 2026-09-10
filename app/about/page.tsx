import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import { Masthead } from '@/lib/Masthead';

export const metadata: Metadata = {
  title: 'About',
  description: 'Meet the students and people behind UniVerse-City.',
};

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <main className="mx-auto max-w-3xl">
      <Masthead settings={settings} currentPage="about" />
      <section className="px-4 pb-14 pt-10 sm:px-6 sm:pt-12">
        <h2 className="mb-3 font-serif text-2xl text-ink sm:text-3xl">About {settings.siteName}</h2>
        <p className="mb-9 max-w-2xl text-sm leading-6 text-muted">{settings.aboutIntro}</p>

        <h3 className="mb-2 font-serif text-xl text-ink">The Team</h3>
        <div className="border-t border-rule">
          {settings.team.map((member) => (
            <div key={member.id} className="flex items-start gap-4 border-b border-rule py-5">
              <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border border-rule bg-paper-raised font-serif text-lg text-navy">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brass">{member.role}</div>
                <div className="font-serif text-lg leading-tight text-ink">{member.name}</div>
              </div>
            </div>
          ))}
          {settings.team.length === 0 && <p className="py-6 text-sm text-muted">Team information coming soon.</p>}
        </div>
      </section>
    </main>
  );
}

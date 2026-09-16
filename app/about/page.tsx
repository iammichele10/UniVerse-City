import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import { Masthead } from '@/lib/Masthead';
import CopyrightNotice from '@/components/CopyrightNotice';

export const metadata: Metadata = {
  title: 'About',
  description: 'Meet the students and people behind UniVerse-City.',
};

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <main>
      <Masthead settings={settings} currentPage="about" />
      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
        <section className="max-w-3xl border-b border-ink pb-10">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">About the publication</p>
          <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">About {settings.siteName}</h2>
          <p className="mt-5 text-base leading-7 text-[#484c46]">{settings.aboutIntro}</p>
        </section>

        <section className="pt-10">
          <div className="mb-5 flex items-end justify-between border-b border-rule pb-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">The people</p>
              <h3 className="mt-1 font-serif text-3xl">The Team</h3>
            </div>
          </div>

          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {settings.team.map((member) => (
              <div key={member.id} className="border-b border-rule py-5">
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#e8e5dc]">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-serif text-3xl text-navy">
                      {member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '—'}
                    </div>
                  )}
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-brass">{member.role}</p>
                <p className="mt-1 font-serif text-2xl">{member.name}</p>
              </div>
            ))}
          </div>
          {settings.team.length === 0 && <p className="py-8 text-sm text-muted">Team information coming soon.</p>}
        </section>
      </div>
      <CopyrightNotice />
    </main>
  );
}

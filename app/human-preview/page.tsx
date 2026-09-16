'use client';

import Link from 'next/link';

const latestStories = [
  { category: 'ACADEMICS', title: 'The students finding new ways to learn, lead and create', excerpt: 'A look at the ideas and everyday choices shaping student life.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85' },
  { category: 'SPORTS', title: 'More than the final score', excerpt: 'What competition, teamwork and school spirit mean beyond the pitch.', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=85' },
  { category: 'ARTS & CULTURE', title: 'When young voices become the culture', excerpt: 'Music, writing and creativity finding their place in student communities.', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85' },
];

const popularStories = [
  'What nobody tells you about your first year',
  'The students changing how we think about school',
  '5 things everyone is talking about this week',
  'Inside the school competition everyone watched',
  'Why students are returning to handwritten notes',
];

const campusBuzz = [
  { category: 'CAMPUS', title: 'What is happening around campus this week?', image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=800&q=85' },
  { category: 'EVENTS', title: 'The events students should know about', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=85' },
  { category: 'COMMUNITY', title: 'Small things making a difference', image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=85' },
];

const people = [
  { name: 'The Student Leader', role: 'PEOPLE', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85' },
  { name: 'The Young Creative', role: 'PEOPLE', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=85' },
  { name: 'The Athlete', role: 'PEOPLE', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85' },
];

export default function HumanDesignPreview() {
  return (
    <main className="min-h-screen bg-[#f8f7f2] text-[#20221f]">
      <header className="border-b border-[#d8d5cc]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center justify-between py-5">
            <button type="button" className="text-[10px] font-medium tracking-[0.18em] text-[#66675f]">MENU</button>
            <Link href="/" className="font-serif text-2xl font-bold tracking-[-0.04em] sm:text-3xl">UniVerse-City</Link>
            <button type="button" className="text-[10px] font-medium tracking-[0.18em] text-[#66675f]">SEARCH</button>
          </div>
          <nav className="hidden border-t border-[#e1ded6] py-3 md:block">
            <div className="flex justify-center gap-9 text-[10px] font-medium tracking-[0.18em] text-[#555750]">
              <Link href="/">HOME</Link><Link href="/category/academics">ACADEMICS</Link><Link href="/category/sports">SPORTS</Link><Link href="/category/arts-and-culture">ARTS &amp; CULTURE</Link><Link href="/about">ABOUT</Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-8"><div className="flex justify-between border-b border-[#20221f] pb-3 text-[10px] tracking-[0.18em] text-[#777870]"><span>STUDENT JOURNALISM</span><span>16 SEPTEMBER 2026</span></div></div>

      <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div className="overflow-hidden bg-[#dedbd2]"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=90" alt="Students talking together" className="aspect-[16/10] h-full w-full object-cover" /></div>
          <article className="max-w-xl lg:pl-5">
            <div className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-[#9b7a32]">FEATURED · CAMPUS LIFE</div>
            <h1 className="font-serif text-4xl leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-[4.2rem]">The stories behind student life</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#62635d]">Real people, real conversations and the small moments that make campus life worth remembering.</p>
            <div className="mt-6 flex gap-3 text-xs text-[#6b6c66]"><span>By UniVerse-City</span><span>·</span><span>Today</span></div>
            <Link href="/" className="mt-7 inline-block border-b border-[#20221f] pb-1 text-[10px] font-semibold tracking-[0.15em]">READ STORY →</Link>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div className="mb-7 flex items-end justify-between border-b border-[#20221f] pb-3"><h2 className="font-serif text-2xl">Latest stories</h2><span className="text-[10px] tracking-[0.15em] text-[#777870]">THE LATEST</span></div>
        <div className="grid gap-9 md:grid-cols-3">
          {latestStories.map((story) => <article key={story.title} className="group"><div className="overflow-hidden bg-[#dedbd2]"><img src={story.image} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" /></div><div className="pt-4"><div className="text-[10px] font-semibold tracking-[0.16em] text-[#9b7a32]">{story.category}</div><h3 className="mt-2 font-serif text-2xl leading-tight tracking-[-0.02em]">{story.title}</h3><p className="mt-2 text-sm leading-6 text-[#686963]">{story.excerpt}</p><div className="mt-4 text-[10px] tracking-[0.12em] text-[#777870]">4 MIN READ</div></div></article>)}
        </div>
      </section>

      <section className="border-y border-[#d8d5cc] bg-[#eeece5]"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><div className="mb-7 flex items-end justify-between border-b border-[#20221f] pb-3"><div><div className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-[#9b7a32]">PEOPLE ARE READING</div><h2 className="font-serif text-3xl">Popular right now</h2></div><span className="hidden text-[10px] tracking-[0.15em] text-[#777870] sm:block">THIS WEEK</span></div><div className="grid md:grid-cols-2">{popularStories.map((story, index) => <Link href="/" key={story} className="group flex gap-5 border-b border-[#d2cfc7] py-5 md:odd:pr-8 md:even:border-l md:even:pl-8"><span className="font-serif text-4xl leading-none text-[#aaa79e]">{String(index + 1).padStart(2, '0')}</span><div><h3 className="font-serif text-xl leading-tight group-hover:underline">{story}</h3><p className="mt-2 text-[10px] tracking-[0.12em] text-[#777870]">3 MIN READ · POPULAR</p></div></Link>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8"><div className="mb-7 flex items-end justify-between border-b border-[#20221f] pb-3"><div><div className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-[#9b7a32]">AROUND US</div><h2 className="font-serif text-3xl">Campus Buzz</h2></div><span className="text-[10px] tracking-[0.15em] text-[#777870]">WHAT&apos;S HAPPENING</span></div><div className="grid gap-8 md:grid-cols-3">{campusBuzz.map((item) => <article key={item.title} className="group"><div className="overflow-hidden"><img src={item.image} alt="" className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" /></div><div className="pt-4"><div className="text-[10px] font-semibold tracking-[0.16em] text-[#9b7a32]">{item.category}</div><h3 className="mt-2 font-serif text-2xl leading-tight">{item.title}</h3><Link href="/" className="mt-4 inline-block border-b border-[#20221f] pb-1 text-[10px] tracking-[0.12em]">FIND OUT MORE →</Link></div></article>)}</div></section>

      <section className="border-y border-[#d8d5cc]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_1.5fr] md:items-center"><div><div className="text-[10px] font-semibold tracking-[0.18em] text-[#9b7a32]">YOUR VOICE</div><h2 className="mt-2 font-serif text-4xl leading-tight">Student Voices</h2><p className="mt-4 max-w-md text-sm leading-7 text-[#686963]">Opinions, experiences and stories written from the student point of view.</p><Link href="/" className="mt-6 inline-block border-b border-[#20221f] pb-1 text-[10px] font-semibold tracking-[0.14em]">EXPLORE STUDENT VOICES →</Link></div><div className="border-l border-[#d8d5cc] pl-6 sm:pl-10"><div className="text-5xl text-[#aaa79e]">“</div><blockquote className="mt-[-10px] font-serif text-3xl leading-tight sm:text-4xl">Sometimes you don&apos;t realise how important a moment is until you look back at it.</blockquote><p className="mt-5 text-xs tracking-[0.08em] text-[#777870]">— STUDENT CONTRIBUTOR</p></div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8"><div className="mb-7 flex items-end justify-between border-b border-[#20221f] pb-3"><div><div className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-[#9b7a32]">THE PEOPLE</div><h2 className="font-serif text-3xl">People worth knowing</h2></div><span className="hidden text-[10px] tracking-[0.15em] text-[#777870] sm:block">PROFILES &amp; STORIES</span></div><div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">{people.map((person) => <article key={person.name}><div className="overflow-hidden"><img src={person.image} alt="" className="aspect-[4/5] w-full object-cover" /></div><div className="pt-4"><div className="text-[10px] font-semibold tracking-[0.16em] text-[#9b7a32]">{person.role}</div><h3 className="mt-1 font-serif text-xl sm:text-2xl">{person.name}</h3></div></article>)}</div></section>

      <section className="bg-[#20221f] text-[#f8f7f2]"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-center"><div><div className="text-[10px] font-semibold tracking-[0.18em] text-[#c4a55d]">MUSIC · BOOKS · FILM · ART</div><h2 className="mt-2 font-serif text-4xl leading-tight">The Culture Corner</h2><p className="mt-4 max-w-md text-sm leading-7 text-[#b9b8b1]">Things students are listening to, watching, reading and creating.</p><Link href="/category/arts-and-culture" className="mt-6 inline-block border-b border-[#f8f7f2] pb-1 text-[10px] tracking-[0.14em]">EXPLORE CULTURE →</Link></div><div className="grid gap-4 sm:grid-cols-2">{[['LISTEN','What is on the playlist?'],['READ','Books worth picking up'],['WATCH','What students are watching'],['CREATE','Student creativity']].map(([label,title]) => <div key={label} className="border-t border-[#55564f] pt-4"><span className="text-[10px] tracking-[0.14em] text-[#aaa79e]">{label}</span><h3 className="mt-2 font-serif text-2xl">{title}</h3></div>)}</div></div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8"><div className="grid gap-8 md:grid-cols-3"><div className="border-t-2 border-[#20221f] pt-4"><div className="text-[10px] font-semibold tracking-[0.16em] text-[#9b7a32]">WORTH KNOWING</div><h2 className="mt-2 font-serif text-2xl">Things that make you think</h2><p className="mt-3 text-sm leading-6 text-[#686963]">Short explainers and useful information without all the unnecessary noise.</p></div><div className="border-t border-[#d8d5cc] pt-4"><div className="text-[10px] tracking-[0.16em] text-[#777870]">THIS WEEK</div><h3 className="mt-2 font-serif text-xl">5 things worth knowing today</h3><Link href="/" className="mt-4 inline-block text-[10px] tracking-[0.12em]">READ →</Link></div><div className="border-t border-[#d8d5cc] pt-4"><div className="text-[10px] tracking-[0.16em] text-[#777870]">JUST CURIOUS</div><h3 className="mt-2 font-serif text-xl">Ever wondered why?</h3><Link href="/" className="mt-4 inline-block text-[10px] tracking-[0.12em]">FIND OUT →</Link></div></div></section>

      <footer className="bg-[#eeece5]"><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><div className="flex flex-col justify-between gap-6 border-t border-[#20221f] pt-5 sm:flex-row"><div><div className="font-serif text-xl font-semibold">UniVerse-City</div><p className="mt-1 text-xs text-[#686963]">Stories by students, for students.</p></div><div className="flex gap-5 text-[10px] tracking-[0.12em] text-[#686963]"><Link href="/about">ABOUT</Link><Link href="/">CONTACT</Link><Link href="/">PRIVACY</Link></div></div></div></footer>
    </main>
  );
}

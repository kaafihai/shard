import { useNavigate } from '@tanstack/react-router';
import { CaretLeft } from 'phosphor-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-amber-100 px-4 py-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-amber-900 hover:text-amber-700"
        >
          <CaretLeft size={24} />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">Why I Built Baajit</h1>
        <p className="text-amber-700 text-lg mb-8">And why it's for neurodivergent minds</p>

        {/* Origin Story */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">The Origin</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            My eldest child used to say "Baajit" instead of "rabbit" when they were small. It stuck with me — that word, that voice, the way a kid's pronunciation becomes its own thing entirely. Years later, I learned they have ADHD. And I was diagnosed with AUDHD as an adult.
          </p>
          <p className="text-gray-700 leading-relaxed">
            That's where the name comes from. And that's why this app exists.
          </p>
        </section>

        {/* Thank You */}
        <section className="mb-10 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-l-4 border-emerald-400">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Thank You to Kaafihai</h2>
          <p className="text-emerald-900 leading-relaxed mb-3">
            This app would not exist without the vision and patience of <strong>Sahiti, Azan, and Kaustubh</strong> at Kaafihai.
          </p>
          <p className="text-emerald-900 leading-relaxed">
            They listened to my neurodivergent rants, encouraged me to learn to code, and helped shape this idea from clay into a first cut. Without the hard work of all of us, Baajit could not have happened. Thank you for creating space for this, believing in the mission, and building something that matters for neurodivergent minds. 💚
          </p>
        </section>

        {/* The Problem */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">The Problem Nobody Was Solving</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            I have ADHD. I'm also autistic. If you're reading this, there's a good chance you're neurodivergent too — or you love someone who is.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            For years I tried every productivity app I could find. The pretty ones with their clean task lists and their "just organize your day!" energy. The gamified ones that turned everything into a competition. The minimalist ones that assumed if they just got out of the way, I'd naturally become the kind of person who checks things off in order.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            None of them worked. Not because they were bad apps — they were built for brains that work differently from mine.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            When you're neurodivergent, knowing what to do was never the problem. The problem is the space between knowing and doing. It's the task that feels so enormous you can't start it. It's finishing one thing and getting stuck instead of moving to the next. It's the racing thoughts that won't quiet down. It's sensory overwhelm, executive dysfunction, rejection sensitivity, time blindness, and a hundred other things that neurotypical systems just don't account for.
          </p>
          <p className="text-gray-700 leading-relaxed">
            I didn't need another app that told me what to do. I needed one that understood why I couldn't.
          </p>
        </section>

        {/* Why Each Feature */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">So I Built Baajit</h2>

          <div className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
              <h3 className="font-bold text-amber-900 mb-2">Energy Tracking</h3>
              <p className="text-gray-700">
                My capacity changes dramatically from day to day — sometimes hour to hour. On a depleted morning, showing me my full task list isn't helpful. It's paralyzing. Baajit asks how I'm feeling and adjusts accordingly.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
              <h3 className="font-bold text-amber-900 mb-2">Task Breakdown</h3>
              <p className="text-gray-700">
                "Write the report" isn't a task when you have ADHD. It's a wall. Baajit lets me crack it into tiny pieces — "open the document," "write the first sentence," "find that one statistic" — and suddenly the wall has handholds.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
              <h3 className="font-bold text-amber-900 mb-2">Transition Prompts</h3>
              <p className="text-gray-700">
                One of the hardest parts of neurodivergence that nobody talks about is the space between tasks. I finish something and instead of moving on, I freeze. Or I spiral into my phone for forty minutes. Baajit's rabbit gives me a gentle nudge — just enough to bridge the gap.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
              <h3 className="font-bold text-amber-900 mb-2">Grounding Exercises</h3>
              <p className="text-gray-700">
                Sometimes my brain isn't in a state where productivity is even possible. Before I can do the work, I need to come back to my body. Box breathing, the 5-4-3-2-1 technique, a quick body scan — they're always one tap away.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
              <h3 className="font-bold text-amber-900 mb-2">Brain Dump</h3>
              <p className="text-gray-700">
                My head is loud. Thoughts pile up and crowd each other out. Getting them into a safe place — without the pressure of turning them into tasks right away — is sometimes the most productive thing I can do all day.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
              <h3 className="font-bold text-amber-900 mb-2">The Rabbit</h3>
              <p className="text-gray-700">
                Shame doesn't motivate neurodivergent brains. Guilt doesn't either. But a small companion that's happy to see you, that grows with you, that celebrates when you show up — that works. The rabbit never judges you for missing a day. It just waits for you to come back.
              </p>
            </div>
          </div>
        </section>

        {/* Why Open Source */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Why Open Source</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            I'm not a developer by trade. I'm a writer. I built Baajit because I needed it, and I learned to code along the way because nobody else was building what I needed.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Making it open source was a deliberate choice. Apps for neurodivergent people shouldn't be locked behind subscriptions. The people who need them most — the ones whose ADHD or autism makes it hard to hold a steady job, manage money, maintain routines — are often the ones who can't afford another $9.99 per month. Baajit is free. No premium tier, no trial period, no "upgrade to unlock."
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your data should stay yours. Baajit stores everything on your device. No accounts, no cloud sync, no analytics. Your mood logs, your energy patterns, your brain dumps — that's intimate information. It shouldn't live on someone else's server.
          </p>
          <p className="text-gray-700 leading-relaxed">
            And honestly, I know Baajit isn't perfect. It's the app I needed, but neurodivergence looks different for everyone. By making the code open, I'm inviting people who understand this problem — people who live it — to make Baajit better in ways I haven't thought of. If you have an idea for a feature that would help you, you can build it. Or tell someone who can.
          </p>
        </section>

        {/* Closing */}
        <section className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-lg border border-amber-300 mb-10">
          <p className="text-amber-900 italic text-lg">
            We deserve tools that work with our brains, not against them.
          </p>
          <p className="text-amber-800 font-semibold mt-4">— Sharada</p>
        </section>

        {/* Links */}
        <section className="text-center text-sm text-gray-600 pb-8">
          <p className="mb-3">Want to contribute or learn more?</p>
          <p>Find Baajit on GitHub: kaafihai/shard</p>
        </section>
      </div>
    </div>
  );
}

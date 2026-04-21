import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📡</span>
            <span className="font-bold text-lg">PromoRadar</span>
          </div>
          <Link
            href="/tool"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
          >
            Try it free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🤖 Powered by Claude AI
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            Find Reddit threads where{" "}
            <span className="text-orange-500">your tool belongs</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed mb-8">
            PromoRadar scans Reddit for questions your tool can answer, scores each post
            by relevance, and writes replies you can post in seconds — without being spammy.
          </p>
          <Link
            href="/tool"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors shadow-lg hover:shadow-xl"
          >
            Start finding opportunities →
          </Link>
          <p className="text-sm text-gray-400 mt-3">No account needed · Free to use</p>
        </div>

        {/* Mock result card */}
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
            Example output
          </p>
          <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-green-400 shadow-lg p-5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  r/SaaS
                </span>
                <span className="text-xs text-gray-400">3h ago</span>
                <span className="text-xs text-gray-400">↑ 47</span>
                <span className="text-xs text-gray-400">💬 12</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-green-100 text-green-700 border-green-200">
                9/10
              </span>
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-2">
              What&apos;s the best tool for building an email list as an indie hacker? ↗
            </p>
            <p className="text-xs text-gray-500 italic mb-3">
              User is explicitly asking for email list tools — perfect fit for a direct recommendation.
            </p>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                I&apos;ve been in this exact spot. For indie hackers, ConvertKit is hard to beat —
                it&apos;s built specifically for creators, the free tier goes up to 1,000 subscribers,
                and the automations are intuitive without being overwhelming. The tagging system is
                great once your list grows. Beehiiv is worth a look too if you want a built-in
                newsletter feed, but ConvertKit has a bigger ecosystem of integrations.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs bg-orange-500 text-white px-4 py-1.5 rounded-full font-medium">
                  Copy reply
                </span>
                <span className="text-xs text-gray-400">Ready to post</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { value: "25+", label: "Posts scanned per search" },
            { value: "0–10", label: "AI relevance score per post" },
            { value: "<20s", label: "Average scan time" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-orange-500 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-500">Three steps from setup to ready-to-post reply</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: "🛠️",
              title: "Describe your tool",
              desc: "Enter your tool name, what it does, and the keywords people search when they need it.",
            },
            {
              step: "02",
              icon: "📡",
              title: "We scan Reddit",
              desc: "PromoRadar searches Reddit in real-time for recent posts matching your keywords — no stale data.",
            },
            {
              step: "03",
              icon: "🎯",
              title: "Get scored opportunities",
              desc: "Claude scores each post 0–10 for relevance and drafts a genuine, non-spammy reply you can copy.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-black text-orange-200">{item.step}</span>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Built for genuine promotion
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Reddit hates obvious spam. PromoRadar drafts replies that lead with real value so
              you build trust while getting visibility.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "⚡", title: "Real-time Reddit data", desc: "Always fresh — no cached or outdated results" },
              { icon: "🧠", title: "AI relevance scoring", desc: "Only see posts where your tool actually fits" },
              { icon: "✍️", title: "Draft replies included", desc: "Claude writes a natural reply for every opportunity" },
              { icon: "🚫", title: "Filters low-fit posts", desc: "Posts scoring below 4/10 are automatically hidden" },
              { icon: "📋", title: "One-click copy", desc: "Copy the reply and post it directly on Reddit" },
              { icon: "🔑", title: "No account needed", desc: "Just bring your Anthropic API key and go" },
            ].map((feat) => (
              <div
                key={feat.title}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
              >
                <div className="text-2xl mb-2">{feat.icon}</div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{feat.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Start finding opportunities today
        </h2>
        <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
          Paste your tool description, hit scan, and get a list of Reddit posts where your tool
          is the perfect answer — ready in under 20 seconds.
        </p>
        <Link
          href="/tool"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-colors shadow-lg hover:shadow-xl"
        >
          Try PromoRadar free →
        </Link>
        <p className="text-sm text-gray-400 mt-3">No account · No credit card</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>📡</span>
            <span className="font-semibold text-gray-600">PromoRadar</span>
          </div>
          <p>Built with Next.js & Claude AI</p>
        </div>
      </footer>
    </main>
  );
}

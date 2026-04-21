"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AnalyzedPost {
  id: string;
  title: string;
  subreddit: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
  relevanceScore: number;
  relevanceReason: string;
  suggestedReply: string;
}

type Step = "form" | "loading" | "results";

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState<AnalyzedPost[]>([]);
  const [totalScanned, setTotalScanned] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchRedditPosts = async (keywords: string) => {
    const keywordList = keywords.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 4);
    const allPosts: object[] = [];
    const seenIds = new Set<string>();
    for (const keyword of keywordList) {
      try {
        const res = await fetch(
          `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=relevance&t=month&limit=20`,
          { headers: { "Accept": "application/json" } }
        );
        if (!res.ok) continue;
        const data = await res.json();
        const posts = data.data?.children?.map((c: { data: object & { id: string } }) => c.data) ?? [];
        for (const post of posts) {
          if (!seenIds.has(post.id)) {
            seenIds.add(post.id);
            allPosts.push(post);
          }
        }
      } catch { continue; }
    }
    return allPosts;
  };

  const handleSearch = async () => {
    if (!toolName || !toolDescription || !keywords) return;
    setError(null);
    setStep("loading");
    try {
      const posts = await fetchRedditPosts(keywords);
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName, toolDescription, keywords, posts }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results ?? []);
      setTotalScanned(data.total ?? 0);
      setStep("results");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const reset = () => {
    setStep("form");
    setResults([]);
    setTotalScanned(0);
    setError(null);
    setExpandedId(null);
  };

  const copyReply = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const timeAgo = (utc: number) => {
    const diff = Date.now() / 1000 - utc;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const scoreBadge = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 6) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const scoreBar = (score: number) => {
    if (score >= 8) return "border-l-green-400";
    if (score >= 6) return "border-l-emerald-400";
    return "border-l-yellow-400";
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-2.5">
            <span className="text-2xl">📡</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">PromoRadar</h1>
              <p className="text-xs text-orange-500 font-medium">Reddit opportunities for your tool</p>
            </div>
          </button>
          <div className="flex items-center gap-3">
            {step === "results" && (
              <button
                onClick={reset}
                className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ← New search
              </button>
            )}
            {userEmail && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* FORM */}
        {step === "form" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Find Reddit posts to promote your tool
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Enter your tool and keywords — we scan Reddit for relevant questions and draft
                natural replies that mention your tool
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tool name
                </label>
                <input
                  type="text"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="e.g. ConvertKit"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  What does it do?
                </label>
                <textarea
                  value={toolDescription}
                  onChange={(e) => setToolDescription(e.target.value)}
                  placeholder="e.g. Email marketing platform for creators — helps build and monetize a newsletter audience"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Keywords{" "}
                  <span className="text-gray-400 font-normal">(comma-separated, max 4)</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. grow newsletter, email list tool, best email marketing"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Use phrases people type when they have the problem your tool solves
                </p>
              </div>

              <button
                onClick={handleSearch}
                disabled={!toolName || !toolDescription || !keywords}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
              >
                🔍 Scan Reddit
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { icon: "🔎", title: "Scans Reddit", desc: "Finds recent posts matching your keywords" },
                { icon: "🧠", title: "Scores relevance", desc: "Claude rates each post 0–10 for fit" },
                { icon: "✍️", title: "Drafts replies", desc: "Natural replies that mention your tool" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
                >
                  <div className="text-2xl mb-1.5">{item.icon}</div>
                  <p className="font-semibold text-gray-800 text-sm mb-0.5">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOADING */}
        {step === "loading" && (
          <div className="text-center py-24">
            <div className="text-5xl mb-5 animate-pulse">📡</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Scanning Reddit...</h2>
            <p className="text-gray-500 mb-8">This takes about 15–20 seconds</p>
            <div className="space-y-2.5 text-sm text-gray-400 max-w-xs mx-auto text-left">
              <p className="flex items-center gap-2"><span>🔎</span> Searching across Reddit...</p>
              <p className="flex items-center gap-2"><span>🧠</span> Claude is scoring relevance...</p>
              <p className="flex items-center gap-2"><span>✍️</span> Drafting reply suggestions...</p>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step === "results" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {results.length} {results.length === 1 ? "opportunity" : "opportunities"} found
                </h2>
                <p className="text-sm text-gray-500">
                  Scanned {totalScanned} posts · sorted by relevance score
                </p>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-semibold text-gray-700 mb-1">No relevant posts found</p>
                <p className="text-sm text-gray-500">
                  Try different keywords or a broader tool description
                </p>
                <button
                  onClick={reset}
                  className="mt-4 text-sm text-orange-500 hover:text-orange-700 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((post) => (
                  <div
                    key={post.id}
                    className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${scoreBar(post.relevanceScore)} shadow-sm`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                            r/{post.subreddit}
                          </span>
                          <span className="text-xs text-gray-400">{timeAgo(post.created_utc)}</span>
                          <span className="text-xs text-gray-400">↑ {post.score}</span>
                          <span className="text-xs text-gray-400">💬 {post.num_comments}</span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${scoreBadge(post.relevanceScore)}`}
                        >
                          {post.relevanceScore}/10
                        </span>
                      </div>

                      <a
                        href={`https://reddit.com${post.permalink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-900 hover:text-orange-600 transition-colors text-sm leading-snug block mb-2"
                      >
                        {post.title} ↗
                      </a>

                      <p className="text-xs text-gray-500 italic leading-relaxed">
                        {post.relevanceReason}
                      </p>

                      {post.suggestedReply && post.suggestedReply !== "N/A" && (
                        <div className="mt-3">
                          <button
                            onClick={() =>
                              setExpandedId(expandedId === post.id ? null : post.id)
                            }
                            className="text-xs font-semibold text-orange-500 hover:text-orange-700 transition-colors"
                          >
                            {expandedId === post.id ? "▼ Hide reply" : "▶ View suggested reply"}
                          </button>

                          {expandedId === post.id && (
                            <div className="mt-3 bg-orange-50 rounded-xl p-4 border border-orange-100">
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {post.suggestedReply}
                              </p>
                              <button
                                onClick={() => copyReply(post.id, post.suggestedReply)}
                                className="mt-3 text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full transition-colors font-medium"
                              >
                                {copied === post.id ? "✓ Copied!" : "Copy reply"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
}

export interface AnalyzedPost extends RedditPost {
  relevanceScore: number;
  relevanceReason: string;
  suggestedReply: string;
}

async function searchReddit(keyword: string): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=new&t=month&limit=20`;
    const res = await fetch(url, {
      headers: { "User-Agent": "PromoRadar/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.children?.map((child: { data: RedditPost }) => child.data) ?? [];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const { toolName, toolDescription, keywords } = await req.json();

    if (!toolName || !toolDescription || !keywords) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const keywordList = (keywords as string)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 4);

    const allPosts: RedditPost[] = [];
    const seenIds = new Set<string>();

    for (const keyword of keywordList) {
      const posts = await searchReddit(keyword);
      for (const post of posts) {
        if (!seenIds.has(post.id)) {
          seenIds.add(post.id);
          allPosts.push(post);
        }
      }
    }

    if (allPosts.length === 0) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const postsToAnalyze = allPosts.slice(0, 25);

    const postsText = postsToAnalyze
      .map(
        (post, i) =>
          `[${i}] r/${post.subreddit} | "${post.title}"\n${
            post.selftext ? post.selftext.slice(0, 400) : "(link post)"
          }`
      )
      .join("\n\n---\n\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [
        {
          role: "user",
          content: `You help marketers find Reddit posts where they can naturally mention their tool.

Tool: "${toolName}"
Description: ${toolDescription}

Analyze these ${postsToAnalyze.length} Reddit posts. For each:
1. Score relevance 0-10 (how naturally could someone mention "${toolName}" here?)
2. One-sentence reason
3. If score >= 5: write a genuine helpful Reddit reply mentioning "${toolName}" naturally (lead with real value, mention tool as recommendation, max 150 words). If score < 5, write "N/A".

Posts:
${postsText}

Reply ONLY with a valid JSON array, no markdown fences:
[{"index":0,"relevanceScore":8,"relevanceReason":"...","suggestedReply":"..."},...]`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") return NextResponse.json({ results: [], total: allPosts.length });

    let analysis: { index: number; relevanceScore: number; relevanceReason: string; suggestedReply: string }[] = [];
    try {
      const text = content.text.trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return NextResponse.json({ results: [], total: allPosts.length, error: "Parse error" });
    }

    const results: AnalyzedPost[] = analysis
      .filter((item) => item.relevanceScore >= 4)
      .map((item) => ({
        ...postsToAnalyze[item.index],
        relevanceScore: item.relevanceScore,
        relevanceReason: item.relevanceReason,
        suggestedReply: item.suggestedReply,
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({ results, total: allPosts.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

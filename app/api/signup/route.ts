import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const MAX_SIGNUPS_PER_IP = 10;
const WINDOW_HOURS = 24;

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const supabase = await createClient();

  const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("signup_attempts")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= MAX_SIGNUPS_PER_IP) {
    return NextResponse.json(
      { error: "Too many accounts created from your IP. Try again in 24 hours." },
      { status: 429 }
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${new URL(req.url).origin}/auth/callback` },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("signup_attempts").insert({ ip });

  return NextResponse.json({ success: true });
}

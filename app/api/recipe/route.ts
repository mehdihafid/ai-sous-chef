import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { meal, ingredients, missing } = await req.json();

  const stream = await client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 1500,
    system: `You are an expert chef. Write clear, engaging recipes with exact measurements and helpful tips. Use emojis sparingly for section headers. Format using markdown with ## for section headers and numbered lists for steps.`,
    messages: [
      {
        role: "user",
        content: `Write a complete recipe for **${meal}**.

Available ingredients: ${ingredients.join(", ")}
${missing.length > 0 ? `Missing ingredients needed: ${missing.join(", ")}` : "All ingredients are available!"}

Include:
## Ingredients
(mark missing ones with ⚠️)

## Instructions
(numbered steps, clear and concise)

## Chef's Tips
(1-2 practical tips)

Keep the total recipe under 400 words.`,
      },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

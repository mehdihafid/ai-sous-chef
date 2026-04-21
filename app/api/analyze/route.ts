import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { image, mimeType } = await req.json();

  if (!image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    system: `You are an expert chef and kitchen assistant. When shown a fridge or pantry photo, you identify ingredients and suggest achievable meals. Always respond with valid JSON only — no markdown, no explanation outside the JSON.`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/webp",
              data: image,
            },
          },
          {
            type: "text",
            text: `Analyze this fridge/pantry image and respond with JSON in exactly this format:
{
  "ingredients": ["ingredient1", "ingredient2"],
  "meals": [
    {
      "name": "Meal Name",
      "emoji": "🍳",
      "description": "One sentence description",
      "cookTime": "20 min",
      "difficulty": "Easy",
      "missing": ["ingredient that's needed but not visible"]
    }
  ]
}

Identify all visible food items. Suggest exactly 4 meals. Keep missing list short (1-3 items max).`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Strip any accidental markdown code fences
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  const data = JSON.parse(cleaned);
  return NextResponse.json(data);
}

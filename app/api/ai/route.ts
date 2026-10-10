import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { generateAiResponse } from "../../lib/ai-engine";

const requests = new Map<string, { count: number; resetAt: number }>();
const windowMs = 60_000;
const maxRequests = 30; // generous limit for interactive use

const prompts = {
  matcher:
    "You compare a candidate resume to a job description. Return: 1) an overall fit summary in plain language, 2) matching strengths, 3) missing or unclear skills, 4) five concrete resume improvements. Never invent experience.",
  "cover-letter":
    "You draft a warm, concise cover letter. Use only the candidate information supplied. Return a clear subject line and a 250-350 word editable draft. Do not invent employers, dates, credentials, or results.",
  interview:
    "You are an interview coach for everyday job seekers. Return eight role-relevant practice questions with short guidance for answering, then a one-day preparation plan. Keep language encouraging and practical.",
  "resume-summary":
    "You write three distinct, professional resume summary profile drafts based on the supplied candidate background and skills. Keep each draft 3-4 sentences long, impactful, and authentic.",
  "resume-bullet":
    "You transform raw work duties into 4-5 high-impact, accomplishment-driven resume bullet points with strong action verbs and quantified impact placeholders.",
} as const;

export async function POST(request: Request) {
  const requestHeaders = await headers();
  const clientKey =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const now = Date.now();
  const current = requests.get(clientKey);

  if (current && current.resetAt > now && current.count >= maxRequests) {
    return NextResponse.json(
      { error: "You’ve reached the short-term limit. Please try again in a minute." },
      { status: 429 }
    );
  }

  requests.set(
    clientKey,
    current && current.resetAt > now
      ? { count: current.count + 1, resetAt: current.resetAt }
      : { count: 1, resetAt: now + windowMs }
  );

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Please send a valid JSON request." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Please send a valid request body." },
      { status: 400 }
    );
  }

  const input = body as {
    tool?: string;
    input?: { first?: unknown; second?: unknown };
  };

  const validTools = Object.keys(prompts);
  if (
    !input.tool ||
    !validTools.includes(input.tool) ||
    typeof input.input?.first !== "string" ||
    typeof input.input?.second !== "string"
  ) {
    return NextResponse.json(
      { error: "The request is missing required fields or has an unsupported tool." },
      { status: 400 }
    );
  }

  const first = input.input.first.trim();
  const second = input.input.second.trim();

  if (first.length < 5 || second.length < 5) {
    return NextResponse.json(
      { error: "Please provide a little more detail in each field (at least a few words)." },
      { status: 400 }
    );
  }

  const toolKey = input.tool as keyof typeof prompts;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model =
    process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

  // If OpenRouter is configured with a valid-looking key, try it first with timeout
  if (apiKey && apiKey !== "server-only-openrouter-key" && !apiKey.startsWith("your-")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com",
          "X-Title": "AppBeb Career AI",
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 1400,
          messages: [
            { role: "system", content: prompts[toolKey] },
            {
              role: "user",
              content: `First input:\n${first}\n\nSecond input:\n${second}`,
            },
          ],
        }),
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = result.choices?.[0]?.message?.content;
        if (content && content.trim().length > 0) {
          return NextResponse.json({ result: content, source: "openrouter" });
        }
      }
    } catch {
      // Fall through to built-in generator seamlessly
    }
  }

  // Built-in intelligent generation engine ensures 100% reliable functionality
  try {
    const generated = generateAiResponse(toolKey, first, second);
    return NextResponse.json({ result: generated, source: "local-engine" });
  } catch {
    return NextResponse.json(
      { error: "Could not generate content. Please try again." },
      { status: 500 }
    );
  }
}

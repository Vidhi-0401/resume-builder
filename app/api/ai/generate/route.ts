// app/api/ai/generate/route.ts
import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"; // Official Chat Completions endpoint

type ReqBody = {
  action?: string;
  section?: string;
  context?: any;
};

function safeStr(v: unknown, max = 1500): string {
  return String(v ?? "").slice(0, max);
}

function toSafeContext(raw: any) {
  const pages = Array.isArray(raw?.pages) ? raw.pages : [];
  const firstPage = pages[0] || {};
  const firstThree = Array.isArray(firstPage.elements)
    ? firstPage.elements.slice(0, 3)
    : [];
  const sampleText = firstThree
    .map((e: any) => (typeof e?.text === "string" ? e.text : ""))
    .filter(Boolean)
    .join("\n");

  return {
    selectedText: safeStr(raw?.selectedText),
    jobRole: safeStr(raw?.jobRole, 160),
    pageCount: Array.isArray(raw?.pages) ? raw.pages.length : 0,
    sampleText: safeStr(sampleText),
  };
}

function buildPrompt(action: string, section: string, ctx: ReturnType<typeof toSafeContext>) {
  const header =
    `You are a concise resume-writing assistant. ` +
    `Write clear, ATS-friendly, easy-to-skim content. Use crisp language.`;

  const baseContext =
    `Context:\n` +
    `- Target role: ${ctx.jobRole || "—"}\n` +
    `- Selected text (if any):\n${ctx.selectedText || "—"}\n` +
    `- Page count: ${ctx.pageCount}\n` +
    `- Sample page text:\n${ctx.sampleText || "—"}\n`;

  switch (action) {
    case "generate_section":
      return `${header}\n\n${baseContext}\n` +
        `Task: Generate a strong "${section}" section.\n` +
        `Constraints: 3–5 bullet points or 3–5 crisp sentences. Avoid fluff.`;

    case "suggest_skills":
      return `${header}\n\n${baseContext}\n` +
        `Task: Suggest a focused skills list tailored to "${ctx.jobRole}". Group by category.`;

    case "proofread":
      return `${header}\n\n${baseContext}\n` +
        `Task: Proofread and improve the selected text without changing meaning. Return only the corrected text.`;

    case "layout_optimize":
      return `${header}\n\n${baseContext}\n` +
        `Task: Suggest layout improvements (ordering, section titles, density) in short bullets.`;

    case "resume_summary":
      return `${header}\n\n${baseContext}\n` +
        `Task: Write a 3–4 sentence professional summary aligned to the target role.`;

    case "job_match":
      return `${header}\n\n${baseContext}\n` +
        `Task: List how this profile matches "${ctx.jobRole}". Use 5–7 bullets, each starting with a strong verb.`;

    default:
      return `${header}\n\n${baseContext}\nTask: Improve the provided resume content.`;
  }
}

export async function POST(req: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { text: "No API key configured" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as ReqBody;
    const action = String(body?.action ?? "").trim();
    const section = String(body?.section ?? "objective").trim().slice(0, 64);

    const ctx = toSafeContext(body?.context || {});
    const prompt = buildPrompt(action, section, ctx);

    // Optional short preview to make logs safe
    if (process.env.NODE_ENV !== "production") {
      console.log("[/api/ai/generate] prompt preview:", prompt.slice(0, 500));
    }

    // Always pass a STRING content (no complex objects)
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 700,
    };

    const r = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      // Surface OpenAI error message (commonly invalid_request_error → 400)
      const msg =
        data?.error?.message ||
        (typeof data === "string" ? data : "OpenAI request failed");
      return NextResponse.json({ text: msg }, { status: r.status });
    }

    const text =
      data?.choices?.[0]?.message?.content?.trim() ??
      data?.choices?.[0]?.text?.trim() ??
      "";

    return NextResponse.json({ text });
  } catch (err: any) {
    const msg =
      typeof err?.message === "string" ? err.message : "Unexpected error";
    return NextResponse.json({ text: msg }, { status: 500 });
  }
}

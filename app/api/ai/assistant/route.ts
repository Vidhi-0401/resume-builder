import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // set this in .env.local
});

export async function POST(req: Request) {
  try {
    const { section, context } = await req.json();
    const prompt =
      context?.selectedText ||
      `Create a professional resume summary for ${section || "a job role"}`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer. Respond in short, clean text only.",
        },
        { role: "user", content: prompt },
      ],
    });

    const text = aiResponse.choices[0]?.message?.content?.trim() || "No output";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json({ text: "AI generation failed." }, { status: 500 });
  }
}

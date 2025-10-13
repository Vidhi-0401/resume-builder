// app/api/ai/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Generate a polished, concise resume summary and key skills section based on the user's input.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const output = completion.choices[0]?.message?.content?.trim();
    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("AI Generation Error:", error);

    // Helps you see actual problem in console
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}

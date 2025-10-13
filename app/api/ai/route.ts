import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // your OpenAI key
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use OpenAI to generate resume text
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI resume writer. Generate professional resume content based on user details clearly formatted.",
        },
        { role: "user", content: prompt },
      ],
    });

    const aiText = completion.choices[0].message?.content?.trim();

    return NextResponse.json({ text: aiText || "No content generated." });
  } catch (error: any) {
    console.error("AI error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume." },
      { status: 500 }
    );
  }
}

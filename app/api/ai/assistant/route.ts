import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { action, section, context, userId } = await req.json();

    let prompt = "";
    switch (action) {
      case "generate_section":
        prompt = `Write a polished resume section for "${section}" based on this resume context:\n${JSON.stringify(context.pages, null, 2)}`;
        break;
      case "suggest_skills":
        prompt = `Suggest 10 relevant technical and soft skills based on this resume:\n${JSON.stringify(context.pages, null, 2)}`;
        break;
      case "proofread":
        prompt = `Proofread and rewrite this professionally (resume style):\n${context.selectedText}`;
        break;
      case "layout_optimize":
        prompt = `Suggest layout improvements for this resume content:\n${JSON.stringify(context.pages, null, 2)}`;
        break;
      case "resume_summary":
        prompt = `Write a concise 3-sentence professional summary for this resume:\n${JSON.stringify(context.pages, null, 2)}`;
        break;
      case "job_match":
        prompt = `Compare this resume with the job role "${context.jobRole}" and list missing skills or areas to improve:\n${JSON.stringify(context.pages, null, 2)}`;
        break;
      default:
        return NextResponse.json({ text: "❌ Invalid action" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional resume writing assistant." },
        { role: "user", content: prompt },
      ],
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "No AI response found.";
    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
  }
}

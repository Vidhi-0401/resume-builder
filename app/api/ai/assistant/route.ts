import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { action, section, context } = await req.json();

    // Build a smart prompt based on user action
    let prompt = "";

    switch (action) {
      case "suggest_skills":
        prompt = `Suggest relevant and professional skills for this resume section based on the context:\n\n${JSON.stringify(
          context,
          null,
          2
        )}`;
        break;

      case "generate_section":
        prompt = `Generate a professional resume section for "${section}". Use this context:\n\n${JSON.stringify(
          context,
          null,
          2
        )}`;
        break;

      case "proofread":
        prompt = `Proofread and improve this resume text professionally:\n\n${context.selectedText}`;
        break;

      case "resume_summary":
        prompt = `Write a concise and impactful resume summary based on this candidate's context:\n\n${JSON.stringify(
          context,
          null,
          2
        )}`;
        break;

      case "job_match":
        prompt = `Match this resume content to the given job role: ${
          context.jobRole
        }.\nContext:\n${JSON.stringify(context, null, 2)}`;
        break;

      default:
        prompt = `Act as a helpful AI resume assistant. Context:\n${JSON.stringify(
          context,
          null,
          2
        )}`;
    }

    // Call OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // uses the smaller fast GPT-4 model
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      completion.choices[0].message?.content?.trim() || "No AI response.";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request." },
      { status: 500 }
    );
  }
}

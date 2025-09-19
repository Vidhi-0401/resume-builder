import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Resume from "@/models/Resume";
import { verifyUser } from "@/lib/authMiddleware";

// 🟢 GET all resumes for the logged-in user
export async function GET() {
  try {
    const user = await verifyUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const resumes = await Resume.find({ userId: user.id });

    return NextResponse.json(resumes);
  } catch (err) {
    console.error("GET resumes error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🟢 POST create a new resume
export async function POST(req: Request) {
  try {
    const user = await verifyUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectToDB();

    const resume = await Resume.create({
      ...body,
      userId: user.id,
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (err) {
    console.error("POST resume error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

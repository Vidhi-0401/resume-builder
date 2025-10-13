import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Resume from "@/models/Resume";
import { verifyUser } from "@/lib/authMiddleware";

// 🟢 GET single resume
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const user = await verifyUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  const { id } = await context.params; // await params per Next.js dynamic API handlers
    await connectToDB();

    const resume = await Resume.findOne({ _id: id, userId: user.id });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json(resume);
  } catch (err) {
    console.error("GET /resume/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🟢 PUT update resume
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const user = await verifyUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  const { id } = await context.params;
    const body = await req.json();

    await connectToDB();

    const updated = await Resume.findOneAndUpdate(
      { _id: id, userId: user.id },
      body,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /resume/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🟢 DELETE resume
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const user = await verifyUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  const { id } = await context.params;
    await connectToDB();

    const deleted = await Resume.findOneAndDelete({ _id: id, userId: user.id });

    if (!deleted) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Resume deleted successfully" });
  } catch (err) {
    console.error("DELETE /resume/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Template from "@/models/Template";
import { verifyAdmin } from "@/lib/authMiddleware";

// 🟢 GET all templates
export async function GET() {
  try {
    await connectToDB();
    const templates = await Template.find();
    return NextResponse.json(templates);
  } catch (err) {
    console.error("GET templates error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🟢 POST create a new template (ADMIN only)
export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    await connectToDB();

    const template = await Template.create(body);
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error("POST template error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

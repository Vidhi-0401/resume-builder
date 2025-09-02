// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose"; // adjust to "../../../lib/mongoose" if you don't use the "@" alias
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const runtime = "nodejs"; // ensure Node.js runtime for Mongoose. Default is nodejs. :contentReference[oaicite:0]{index=0}

export async function POST(req: Request) {
  try {
    const { name, company, email, password } = await req.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 10) {
      return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });
    }

    await connectToDB();

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, company, email, passwordHash });

    return NextResponse.json(
      { id: user._id, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

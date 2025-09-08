// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "../../../../lib/mongoose";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET as string;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string; // set this in .env

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await connectToDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // ✅ Promote admin automatically if email matches ADMIN_EMAIL
    if (email === ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // ✅ JWT includes role
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Cookie
    const setCookie = cookie.serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    const res = NextResponse.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });

    res.headers.set("Set-Cookie", setCookie);
    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

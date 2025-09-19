import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function getSession() {
  const cookieStore = await cookies(); // ✅ await here
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };
  } catch {
    return null;
  }
}

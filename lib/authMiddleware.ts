import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface DecodedUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin"; // ✅ include role
}

// ✅ Verify normal user
export async function verifyUser(): Promise<DecodedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

// ✅ Verify *only* admin
export async function verifyAdmin(): Promise<DecodedUser | null> {
  const user = await verifyUser();
  if (user && user.role === "admin") {
    return user;
  }
  return null;
}

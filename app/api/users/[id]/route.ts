import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; 
import { ObjectId } from "mongodb";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params; 
    const client = await clientPromise;
    const db = client.db("project"); 

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

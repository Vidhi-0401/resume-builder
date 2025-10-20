// import { NextResponse } from "next/server";
// import { connectToDB } from "@/lib/mongoose";
// import Template from "@/models/Template";
// import { verifyAdmin } from "@/lib/authMiddleware";

// export async function GET(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { id } = await params;
//     await connectToDB();
//     const t = await Template.findById(id);
//     if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
//     return NextResponse.json(t);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const admin = await verifyAdmin();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { id } = await params;
//     const body = await req.json();
//     await connectToDB();
//     const updated = await Template.findByIdAndUpdate(id, body, { new: true });
//     if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
//     return NextResponse.json(updated);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// export async function DELETE(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const admin = await verifyAdmin();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { id } = await params;
//     await connectToDB();
//     await Template.findByIdAndDelete(id);
//     return NextResponse.json({ message: "Deleted" });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Template from "@/models/Template";

// GET: Fetch a template by ID
export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    // ✅ Await params (Next.js App Router requirement)
    const params = await context.params;
    const { id } = params;

    await connectToDB();

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("GET error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("Unknown GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: Update a template by ID
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const { id } = params;

    const body = await req.json();
    await connectToDB();

    // 🩹 Normalize `style` if sent as string
    if (typeof body.style === "string") {
      body.style = { layoutType: body.style };
    }

    // 🩹 Normalize `layout.style` if frontend sends it as string
    if (body.layout && typeof body.layout.style === "string") {
      body.layout.style = { layoutType: body.layout.style };
    }

    const updated = await Template.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("PUT error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("Unknown PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Delete a template by ID
export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const { id } = params;

    await connectToDB();

    const deleted = await Template.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("DELETE error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("Unknown DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



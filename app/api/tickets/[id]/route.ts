import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { Ticket } from "@/lib/types";
import { auth } from "@/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ticket ID." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("support-os");

    const ticket = await db.collection<Ticket>("tickets").findOne({
      _id: new ObjectId(id),
      tenantId: session.user.tenantId,
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Failed to fetch ticket:", error);

    return NextResponse.json(
      { error: "Unable to fetch ticket." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { createDraft } from "@/lib/drafts";
import { DraftResponse } from "@/lib/types";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await request.json();

    const { ticketId, aiGeneratedText } = body;

    if (!ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: "Invalid ticketId." }, { status: 400 });
    }

    if (typeof ticketId !== "string" || !ticketId.trim()) {
      return NextResponse.json(
        { error: "A ticketId is required." },
        { status: 400 },
      );
    }

    if (typeof aiGeneratedText !== "string" || !aiGeneratedText.trim()) {
      return NextResponse.json(
        { error: "aiGeneratedText is required." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("support-os");

    const ticket = await db.collection("tickets").findOne({
      _id: new ObjectId(ticketId),
      tenantId: session.user.tenantId,
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const draft: DraftResponse = {
      tenantId: session.user.tenantId,
      ticketId: new ObjectId(ticketId),
      aiGeneratedText: aiGeneratedText.trim(),
      status: "pending_review",
    };

    const createdDraft = await createDraft(draft);

    return NextResponse.json(
      {
        success: true,
        draft: createdDraft,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Draft creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create draft." },
      { status: 500 },
    );
  }
}

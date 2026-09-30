import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { createDraft } from "@/lib/drafts";
import { DraftResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
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

    const draft: DraftResponse = {
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

import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getDraftForTicket } from "@/lib/drafts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await params;

    if (!ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: "Invalid ticketId." }, { status: 400 });
    }

    const draft = await getDraftForTicket(new ObjectId(ticketId));

    if (!draft) {
      return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    }

    return NextResponse.json({
      draft,
    });
  } catch (error) {
    console.error("Draft retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve draft." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await params;

    if (!ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: "Invalid ticketId." }, { status: 400 });
    }

    const body = await request.json();
    const { editedText } = body;

    if (typeof editedText !== "string" || !editedText.trim()) {
      return NextResponse.json(
        { error: "A non-empty editedText is required." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("support-os");

    const updatedDraft = await db.collection("draftResponses").findOneAndUpdate(
      {
        ticketId: new ObjectId(ticketId),
        status: "pending_review",
      },
      {
        $set: {
          editedText: editedText.trim(),
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!updatedDraft) {
      return NextResponse.json(
        {
          error: "No pending-review draft exists for this ticket.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      draft: updatedDraft,
    });
  } catch (error) {
    console.error("Draft update failed:", error);

    return NextResponse.json(
      { error: "Unable to update draft." },
      { status: 500 },
    );
  }
}

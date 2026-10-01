import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getDraftForTicket, createDraft } from "@/lib/drafts";
import { searchKnowledgeBase } from "@/lib/retrieval";
import { generateSupportDraftStream } from "@/lib/ai";
import type { DraftResponse, Ticket } from "@/lib/types";
import { auth } from "@/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const ticketId = new ObjectId(id);

    const client = await clientPromise;
    const db = client.db("support-os");

    const ticket = await db.collection<Ticket>("tickets").findOne({
      _id: ticketId,
      tenantId: session.user.tenantId,
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const existingDraft = await getDraftForTicket(
      ticketId,
      session.user.tenantId,
    );

    if (existingDraft?.status === "pending_review") {
      return NextResponse.json({
        success: true,
        existing: true,
        draft: existingDraft,
      });
    }

    const retrieval = await searchKnowledgeBase(
      ticket.message,
      session.user.tenantId,
    );

    if (!retrieval.relevant) {
      const aiGeneratedText =
        "The available company information does not provide enough information to answer this question.";

      const draft: DraftResponse = {
        tenantId: session.user.tenantId,
        ticketId,
        aiGeneratedText,
        status: "pending_review",
      };

      const createdDraft = await createDraft(draft);

      return NextResponse.json({
        success: true,
        existing: false,
        draft: createdDraft,
      });
    }

    const geminiStream = await generateSupportDraftStream(
      ticket.message,
      retrieval.results,
    );

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let completeText = "";

        try {
          for await (const chunk of geminiStream) {
            const text = chunk.text ?? "";

            if (!text) {
              continue;
            }

            completeText += text;

            controller.enqueue(encoder.encode(text));
          }

          if (!completeText.trim()) {
            throw new Error("Gemini returned an empty response.");
          }

          const draft: DraftResponse = {
            tenantId: session.user.tenantId,
            ticketId,
            aiGeneratedText: completeText.trim(),
            status: "pending_review",
          };

          await createDraft(draft);

          controller.close();
        } catch (error) {
          console.error("Streaming draft generation failed:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Ticket draft generation failed:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 503
    ) {
      return NextResponse.json(
        {
          error:
            "The AI service is temporarily unavailable. Please try again later.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Unable to generate ticket draft." },
      { status: 500 },
    );
  }
}

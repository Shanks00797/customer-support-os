import { NextResponse } from "next/server";

import { generateSupportDraft } from "@/lib/ai";
import { searchKnowledgeBase } from "@/lib/retrieval";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerMessage } = body;

    if (typeof customerMessage !== "string" || !customerMessage.trim()) {
      return NextResponse.json(
        { error: "A non-empty customerMessage is required." },
        { status: 400 },
      );
    }

    const message = customerMessage.trim();

    const retrieval = await searchKnowledgeBase(message);

    if (!retrieval.relevant) {
      return NextResponse.json({
        customerMessage: message,
        relevant: false,
        draft:
          "The available company information does not provide enough information to answer this question.",
      });
    }

    const draft = await generateSupportDraft(message, retrieval.results);

    return NextResponse.json({
      customerMessage: message,
      relevant: true,
      sources: retrieval.results,
      draft,
    });
  } catch (error) {
    console.error("Draft generation failed:", error);

    return NextResponse.json(
      { error: "Unable to generate support draft." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

import { createEmbedding } from "@/lib/gemini";

export async function GET() {
  try {
    const embedding = await createEmbedding(
      "How long does shipping normally take?",
    );

    return NextResponse.json({
      success: true,
      dimensions: embedding.length,
      firstFiveValues: embedding.slice(0, 5),
    });
  } catch (error) {
    console.error("Embedding request failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Embedding request failed.",
      },
      { status: 500 },
    );
  }
}



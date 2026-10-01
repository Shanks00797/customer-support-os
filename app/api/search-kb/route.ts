import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchKnowledgeBase } from "@/lib/retrieval";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await request.json();
    const { question } = body;

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "A non-empty question is required." },
        { status: 400 },
      );
    }

    const retrieval = await searchKnowledgeBase(
      question.trim(),
      session.user.tenantId,
    );

    return NextResponse.json({
      question: question.trim(),
      ...retrieval,
    });
  } catch (error) {
    console.error("KB vector search failed:", error);

    return NextResponse.json(
      { error: "Unable to search the knowledge base." },
      { status: 500 },
    );
  }
}

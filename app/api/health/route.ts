import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });

    const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

    return NextResponse.json({
      status: "ok",
      database: "connected",
      gemini: geminiConfigured ? "configured" : "missing",
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}

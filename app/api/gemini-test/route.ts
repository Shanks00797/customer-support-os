import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: "Reply with exactly: Gemini connection successful.",
    });

    return NextResponse.json({
      success: true,
      response: response.output_text,
    });
  } catch (error) {
    console.error("Gemini API request failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gemini API request failed.",
      },
      { status: 500 },
    );
  }
}

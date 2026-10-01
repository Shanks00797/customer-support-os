import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import type { Ticket } from "@/lib/types";
import { auth } from "@/auth";

// ---------- POST HANDLER ----------
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();

    const { customerName, customerEmail, subject, message } = body;

    if (
      typeof customerName !== "string" ||
      typeof customerEmail !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "customerName, customerEmail, subject, and message are required.",
        },
        { status: 400 },
      );
    }

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      return NextResponse.json(
        {
          error: "All ticket fields are required.",
        },
        { status: 400 },
      );
    }

    const ticket: Ticket = {
      tenantId: session.user.tenantId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: "open",
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db("support-os");

    const result = await db.collection("tickets").insertOne(ticket);

    return NextResponse.json(
      {
        message: "Ticket created successfully.",
        ticketId: result.insertedId.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create ticket:", error);

    return NextResponse.json(
      {
        error: "Unable to create ticket.",
      },
      { status: 500 },
    );
  }
}

// ---------- GET HANDLER ----------
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const client = await clientPromise;
    const db = client.db("support-os");

    const tickets = await db
      .collection("tickets")
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      tickets,
    });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);

    return NextResponse.json(
      {
        error: "Unable to fetch tickets.",
      },
      { status: 500 },
    );
  }
}

import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";

import clientPromise from "@/lib/mongodb";
import type { Ticket } from "@/lib/types";

interface TicketPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function TicketPage({
    params,
}: TicketPageProps) {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
        notFound();
    }

    const client = await clientPromise;
    const db = client.db("support-os");

    const ticket = await db
        .collection<Ticket>("tickets")
        .findOne({
            _id: new ObjectId(id),
        });

    if (!ticket) {
        notFound();
    }

    return (
        <main>
            <h1>{ticket.subject}</h1>

            <p>
                <strong>Customer:</strong> {ticket.customerName}
            </p>

            <p>
                <strong>Email:</strong> {ticket.customerEmail}
            </p>

            <p>
                <strong>Status:</strong> {ticket.status}
            </p>

            <hr />

            <h2>Customer message</h2>
            <p>{ticket.message}</p>
        </main>
    );
}
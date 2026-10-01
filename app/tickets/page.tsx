import Link from "next/link";

import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import type { Ticket } from "@/lib/types";
import TicketForm from "./TicketsForm";

export default async function TicketsPage() {
    const session = await auth();

    if (!session?.user?.tenantId) {
        return <p>Unauthorized.</p>;
    }

    const client = await clientPromise;
    const db = client.db("support-os");

    const tickets = await db
        .collection<Ticket>("tickets")
        .find({
            tenantId: session.user.tenantId,
        })
        .sort({ createdAt: -1 })
        .toArray();

    return (
        <main>
            <h1>Support Tickets</h1>

            <TicketForm />

            {tickets.length === 0 ? (
                <p>No tickets yet.</p>
            ) : (
                <ul>
                    {tickets.map((ticket) => (
                        <li key={ticket._id?.toString()}>
                            <h2>
                                <Link href={`/tickets/${ticket._id?.toString()}`}>
                                    {ticket.subject}
                                </Link>
                            </h2>

                            <p>
                                <strong>Customer:</strong> {ticket.customerName}
                            </p>

                            <p>
                                <strong>Email:</strong> {ticket.customerEmail}
                            </p>

                            <p>
                                <strong>Status:</strong> {ticket.status}
                            </p>

                            <p>{ticket.message}</p>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
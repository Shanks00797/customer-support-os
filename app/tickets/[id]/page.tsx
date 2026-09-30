import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import GenerateDraftButton from "./GenerateDraftButton";
import clientPromise from "@/lib/mongodb";
import type { Ticket } from "@/lib/types";
import { getDraftForTicket } from "@/lib/drafts";
import DraftEditor from "./DraftEditor";

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

    const draft = await getDraftForTicket(new ObjectId(id));

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

            <hr />

            {draft?.status !== "pending_review" && (
                <GenerateDraftButton ticketId={id} />
            )}

            <hr />

            {draft && (
                <section>
                    <h2>AI Draft</h2>
                    <p>Status: {draft.status}</p>

                    {draft.status === "pending_review" ? (
                        <DraftEditor
                            ticketId={ticket._id!.toString()}
                            initialText={draft.editedText ?? draft.aiGeneratedText}
                        />
                    ) : (
                        <p>{draft.editedText ?? draft.aiGeneratedText}</p>
                    )}
                </section>
            )}
        </main>
    );
}
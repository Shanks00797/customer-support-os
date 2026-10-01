import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";
import { DraftResponse } from "./types";

const DB_NAME = "support-os";
const COLLECTION_NAME = "draftResponses";

export async function createDraft(
  draft: Omit<DraftResponse, "tenantId">,
): Promise<DraftResponse> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const ticket = await db.collection("tickets").findOne({
    _id: draft.ticketId,
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  if (typeof ticket.tenantId !== "string") {
    throw new Error("Ticket tenantId is missing.");
  }

  const tenantAwareDraft: DraftResponse = {
    ...draft,
    tenantId: ticket.tenantId,
  };

  const result = await db
    .collection<DraftResponse>(COLLECTION_NAME)
    .insertOne(tenantAwareDraft);

  await db.collection("tickets").updateOne(
    {
      _id: draft.ticketId,
      tenantId: ticket.tenantId,
    },
    {
      $set: { status: "drafted" },
    },
  );

  return {
    ...tenantAwareDraft,
    _id: result.insertedId,
  };
}

export async function getDraftForTicket(
  ticketId: ObjectId,
  tenantId: string,
): Promise<DraftResponse | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const draft = await db.collection<DraftResponse>(COLLECTION_NAME).findOne({
    ticketId,
    tenantId,
  });

  return draft;
}

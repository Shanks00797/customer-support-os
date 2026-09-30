import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";
import { DraftResponse } from "./types";

const DB_NAME = "support-os";
const COLLECTION_NAME = "draftResponses";

export async function createDraft(
  draft: DraftResponse,
): Promise<DraftResponse> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const ticket = await db.collection("tickets").findOne({
    _id: draft.ticketId,
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  const result = await db
    .collection<DraftResponse>(COLLECTION_NAME)
    .insertOne(draft);

  await db
    .collection("tickets")
    .updateOne({ _id: draft.ticketId }, { $set: { status: "drafted" } });

  return {
    ...draft,
    _id: result.insertedId,
  };
}

export async function getDraftForTicket(
  ticketId: ObjectId,
): Promise<DraftResponse | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const draft = await db
    .collection<DraftResponse>(COLLECTION_NAME)
    .findOne({ ticketId });

  return draft;
}

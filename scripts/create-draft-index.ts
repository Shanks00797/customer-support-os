import clientPromise from "../lib/mongodb";

async function createDraftIndex() {
  const client = await clientPromise;
  const db = client.db("support-os");

  await db.collection("draftResponses").createIndex(
    { ticketId: 1 },
    {
      name: "unique_pending_draft_per_ticket",
      unique: true,
      partialFilterExpression: {
        status: "pending_review",
      },
    },
  );

  console.log("Draft index created successfully.");

  await client.close();
}

createDraftIndex().catch((error) => {
  console.error("Failed to create draft index:", error);
  process.exit(1);
});

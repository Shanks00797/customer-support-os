import clientPromise from "../lib/mongodb";

async function findDuplicateDrafts() {
  const client = await clientPromise;
  const db = client.db("support-os");

  const duplicates = await db
    .collection("draftResponses")
    .aggregate([
      {
        $match: {
          status: "pending_review",
        },
      },
      {
        $group: {
          _id: "$ticketId",
          count: { $sum: 1 },
          drafts: {
            $push: {
              _id: "$_id",
              aiGeneratedText: "$aiGeneratedText",
            },
          },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ])
    .toArray();

  console.log(JSON.stringify(duplicates, null, 2));

  await client.close();
}

findDuplicateDrafts().catch((error) => {
  console.error("Failed to find duplicate drafts:", error);
  process.exit(1);
});

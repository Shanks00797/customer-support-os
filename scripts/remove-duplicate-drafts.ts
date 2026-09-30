import { ObjectId } from "mongodb";

import clientPromise from "../lib/mongodb";

async function removeDuplicateDraft() {
  const client = await clientPromise;
  const db = client.db("support-os");

  const result = await db.collection("draftResponses").deleteOne({
    _id: new ObjectId("6abcba5a7bb6240f257b698d"),
  });

  console.log(`Deleted documents: ${result.deletedCount}`);

  await client.close();
}

removeDuplicateDraft().catch((error) => {
  console.error("Failed to remove duplicate draft:", error);
  process.exit(1);
});

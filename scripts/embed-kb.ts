import clientPromise from "../lib/mongodb";
import { createEmbedding } from "../lib/gemini";
import type { KBDocument } from "../lib/types";

async function embedKnowledgeBase() {
  try {
    const client = await clientPromise;
    const db = client.db("support-os");

    const collection = db.collection<KBDocument>("kbDocuments");

    const documents = await collection.find({}).toArray();

    console.log(`Found ${documents.length} KB documents.`);

    for (const document of documents) {
      const embedding = await createEmbedding(document.content);

      if (embedding.length === 0) {
        throw new Error(
          `No embedding returned for document: ${document.title}`,
        );
      }

      await collection.updateOne(
        { _id: document._id },
        {
          $set: {
            embedding,
          },
        },
      );

      console.log(`Embedded: ${document.title}`);
    }

    console.log("Knowledge-base embedding completed successfully.");
  } catch (error) {
    console.error("Failed to embed knowledge base:", error);
    process.exit(1);
  }
}

embedKnowledgeBase();

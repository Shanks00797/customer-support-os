import clientPromise from "./mongodb";
import { createEmbedding } from "./gemini";
import { performance } from "perf_hooks";

const RELEVANCE_THRESHOLD = 0.8;

export interface RetrievedKnowledge {
  title: string;
  content: string;
  score: number;
}

export async function searchKnowledgeBase(question: string): Promise<{
  relevant: boolean;
  results: RetrievedKnowledge[];
}> {
  const embeddingStart = performance.now();

  const questionEmbedding = await createEmbedding(question.trim());

  const embeddingTimeMs = performance.now() - embeddingStart;

  console.log(`Embedding generation took ${embeddingTimeMs.toFixed(0)} ms`);

  if (questionEmbedding.length === 0) {
    throw new Error("Unable to create question embedding.");
  }

  const client = await clientPromise;
  const db = client.db("support-os");
  const searchStart = performance.now();
  const results = await db
    .collection("kbDocuments")
    .aggregate<RetrievedKnowledge>([
      {
        $vectorSearch: {
          index: "kb_vector_index",
          path: "embedding",
          queryVector: questionEmbedding,
          numCandidates: 50,
          limit: 3,
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          content: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ])
    .toArray();
  const searchTimeMs = performance.now() - searchStart;

  console.log(`MongoDB vector search took ${searchTimeMs.toFixed(0)} ms`);

  const bestScore = results[0]?.score ?? 0;
  const relevant = bestScore >= RELEVANCE_THRESHOLD;

  return {
    relevant,
    results: relevant ? results : [],
  };
}

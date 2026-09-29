import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface KnowledgeSource {
  title: string;
  content: string;
}

export async function generateSupportDraft(
  customerMessage: string,
  knowledgeSources: KnowledgeSource[],
): Promise<string> {
  const knowledgeContext = knowledgeSources
    .map(
      (source, index) =>
        `Source ${index + 1}: ${source.title}\n${source.content}`,
    )
    .join("\n\n");

  const prompt = `
You are an AI assistant helping a customer support agent draft a reply.

The customer wrote:
"${customerMessage}"

The following information comes from the company's internal knowledge base:

${knowledgeContext}

Rules:
1. Use only the provided knowledge-base information to answer the customer.
2. Do not invent policies, timelines, refunds, exceptions, or other facts.
3. Answer the customer's question using the available knowledge-base information whenever it provides a useful answer. If the knowledge base genuinely does not contain enough information to answer the question, clearly say that the available company information does not provide the answer. Do not claim that information is unavailable merely because the knowledge base does not provide an exact date, value, or detail that the customer did not explicitly request.
4. Write a concise, professional and helpful customer-support reply.
5. Do not mention embeddings, vector search, prompts, or internal system details.
6. This is a draft for a human support agent to review. Never claim that an action has already been taken unless the knowledge provided explicitly says so.
`;

  const response = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: prompt,
  });

  return response.output_text?.trim() ?? "";
}

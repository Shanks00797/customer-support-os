import clientPromise from "../lib/mongodb";
import type { KBDocument } from "../lib/types";

const DEMO_TENANT_ID = "6abe65b875f9dac2302ce41f";

const knowledgeBase: KBDocument[] = [
  {
    title: "Shipping Times",
    content:
      "Standard shipping usually takes 5 to 7 business days. Express shipping usually takes 2 to 3 business days.",
  },
  {
    title: "Order Cancellation",
    content:
      "Customers can request cancellation within 2 hours of placing an order. After that window, cancellation may not be possible if the order has already entered fulfillment.",
  },
  {
    title: "Refund Policy",
    content:
      "Refunds are issued after an eligible return is received and inspected. Once approved, refunds usually appear within 5 to 10 business days depending on the customer's payment provider.",
  },
  {
    title: "Return Window",
    content:
      "Customers can return eligible products within 30 days of delivery. Products should be unused and in their original condition.",
  },
  {
    title: "Damaged Products",
    content:
      "If a product arrives damaged, customers should contact support within 48 hours of delivery and include photographs of the damaged item and packaging.",
  },
  {
    title: "Changing a Delivery Address",
    content:
      "Customers can request a delivery address change before an order enters fulfillment. Once fulfillment has started, the address usually cannot be changed.",
  },
  {
    title: "Tracking an Order",
    content:
      "Customers can track shipped orders using the tracking link provided in the shipping confirmation email.",
  },
  {
    title: "Payment Methods",
    content:
      "The company currently accepts major credit cards, debit cards, and supported digital payment methods available during checkout.",
  },
  {
    title: "Failed Payment",
    content:
      "If a payment fails, customers should verify their payment details and try again. If the problem continues, they should contact their bank or payment provider.",
  },
  {
    title: "Discount Codes",
    content:
      "Discount codes must be entered during checkout. Only one promotional code can normally be applied to an order unless the promotion explicitly states otherwise.",
  },
  {
    title: "Account Password Reset",
    content:
      "Customers who forget their password can use the password reset option on the login page and follow the instructions sent to their registered email address.",
  },
  {
    title: "Support Response Time",
    content:
      "The support team generally responds to customer inquiries within one business day.",
  },
].map((document) => ({
  ...document,
  tenantId: DEMO_TENANT_ID,
}));

async function seedKnowledgeBase() {
  try {
    const client = await clientPromise;
    const db = client.db("support-os");

    await db.collection("kbDocuments").deleteMany({});

    await db.collection<KBDocument>("kbDocuments").insertMany(knowledgeBase);

    console.log(
      `Successfully inserted ${knowledgeBase.length} knowledge-base documents.`,
    );
  } catch (error) {
    console.error("Failed to seed knowledge base:", error);
    process.exit(1);
  }
}

seedKnowledgeBase();

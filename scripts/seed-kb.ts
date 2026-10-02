import { loadEnvConfig } from "@next/env";
import type { KBDocument } from "../lib/types";

loadEnvConfig(process.cwd());
const HARBOR_PINE_TENANT_ID = "6abfe52cc4b566aafddf2aa8";

const knowledgeBase: KBDocument[] = [
  {
    title: "Standard Delivery",
    content:
      "Harbor & Pine Home offers standard delivery across India. Most in-stock orders arrive within 4 to 7 business days after dispatch. Delivery to remote service areas may take longer. The estimated delivery date shown at checkout is the best available estimate for the customer's address.",
  },
  {
    title: "Express Delivery",
    content:
      "Express delivery is available for selected products and eligible pin codes. Orders placed with express delivery generally arrive within 2 to 3 business days after dispatch. Availability and the estimated delivery date are shown during checkout.",
  },
  {
    title: "Order Tracking",
    content:
      "Customers can track dispatched orders using the tracking link included in their shipping confirmation email. Tracking information may take up to 24 hours to appear after dispatch. If there has been no tracking update for more than 48 hours, customers should contact Harbor & Pine Home support.",
  },
  {
    title: "Order Cancellation",
    content:
      "Customers can request cancellation before an order enters the packing or dispatch process. Once an order has been packed for dispatch, cancellation may no longer be possible. Customers should contact support as soon as possible if they need to cancel an order.",
  },
  {
    title: "Changing a Delivery Address",
    content:
      "A delivery address can usually be changed before an order enters the packing process. Once an order has been packed or dispatched, Harbor & Pine Home cannot guarantee that the address can be changed. Customers should contact support immediately with the order number and corrected address.",
  },
  {
    title: "Returns and Eligibility",
    content:
      "Most eligible Harbor & Pine Home products can be returned within 30 days of delivery. Items should be unused, undamaged, and returned with their original packaging and included accessories. Clearance items, personalized products, and products marked as final sale may not be eligible for return.",
  },
  {
    title: "Refund Processing",
    content:
      "After an approved return is received and passes inspection, Harbor & Pine Home initiates the refund to the original payment method. Customers should generally allow 5 to 10 business days for the refund to appear, depending on their bank or payment provider.",
  },
  {
    title: "Damaged or Incorrect Items",
    content:
      "If an order arrives damaged or contains the wrong item, customers should contact Harbor & Pine Home within 48 hours of delivery. Customers should provide photographs of the product, packaging, shipping label, and visible damage so the support team can review the issue and arrange the appropriate resolution.",
  },
  {
    title: "Furniture Warranty",
    content:
      "Harbor & Pine Home provides a limited warranty against manufacturing defects for eligible furniture products. The warranty does not normally cover damage caused by incorrect assembly, misuse, accidents, normal wear and tear, or unauthorized modifications. Warranty coverage varies by product and is described in the product documentation.",
  },
  {
    title: "Furniture Assembly",
    content:
      "Assembly instructions are included with eligible furniture products. Customers should follow the supplied instructions and use the recommended hardware. If a required component is missing or damaged, customers should contact support with the order number and component information so the support team can arrange assistance.",
  },
  {
    title: "Accepted Payment Methods",
    content:
      "Harbor & Pine Home accepts major credit cards, debit cards, and supported digital payment methods displayed during checkout. Available payment methods may vary depending on the order value, product, and customer's location.",
  },
  {
    title: "Promotional Discounts",
    content:
      "Promotional codes must be entered during checkout before the order is placed. Unless a promotion specifically states otherwise, only one promotional code can be applied to an order. Promotional discounts generally cannot be added after an order has been submitted.",
  },
  {
    title: "Customer Support Response Time",
    content:
      "Harbor & Pine Home support generally responds to customer enquiries within one business day. Response times may be longer during major promotions, public holidays, or periods of unusually high support volume.",
  },
].map((document) => ({
  ...document,
  tenantId: HARBOR_PINE_TENANT_ID,
}));

async function seedKnowledgeBase() {
  try {
    const { default: clientPromise } = await import("../lib/mongodb");
    const client = await clientPromise;
    const db = client.db("support-os");

    await db.collection("kbDocuments").deleteMany({});

    await db.collection<KBDocument>("kbDocuments").insertMany(knowledgeBase);

    console.log(
      `Successfully inserted ${knowledgeBase.length} knowledge-base documents for Harbor & Pine Home.`,
    );
  } catch (error) {
    console.error("Failed to seed knowledge base:", error);
    process.exit(1);
  }
}

seedKnowledgeBase();

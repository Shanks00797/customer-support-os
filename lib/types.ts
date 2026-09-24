import { ObjectId } from "mongodb";
export type TicketStatus = "open" | "drafted" | "sent" | "escalated";

export interface Ticket {
  _id?: ObjectId;
  tenantId?: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: TicketStatus;
  assignedAgentId?: string;
  createdAt: Date;
}

export interface KBDocument {
  _id?: ObjectId;
  tenantId?: string;
  title: string;
  content: string;
  embedding?: number[];
}

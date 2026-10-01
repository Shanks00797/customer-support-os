import { ObjectId } from "mongodb";

export type UserRole = "admin" | "agent";

export interface Tenant {
  _id?: ObjectId;
  name: string;
  subscriptionTier: string;
  createdAt: Date;
}

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tenantId: string;
}

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

export type DraftStatus = "pending_review" | "approved_sent" | "rejected";

export interface DraftResponse {
  _id?: ObjectId;
  ticketId: ObjectId;
  aiGeneratedText: string;
  editedText?: string;
  status: DraftStatus;
  reviewedByUserId?: ObjectId;
}

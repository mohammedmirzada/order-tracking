/**
 * Domain types matching backend Prisma schema
 * Keep in sync with API responses
 */

export type OrderStatus =
  | "DRAFT"
  | "PLACED"
  | "DISPATCHED"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELED";

export interface Supplier {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Forwarder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDocument {
  id: string;
  invoiceId: string;
  filename: string;
  originalName: string;
  filepath: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  invoiceDate: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: InvoiceDocument[];
}

export interface Order {
  id: string;
  refNumber: string;
  supplierId: string;
  forwarderId: string;
  status: OrderStatus;
  orderDate: string | null;
  dispatchDate: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  shipmentName: string | null;
  comments: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  supplier?: Supplier;
  forwarder?: Forwarder;
  invoices?: Invoice[];
}

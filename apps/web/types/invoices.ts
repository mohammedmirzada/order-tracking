export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  invoiceDate: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    refNumber: string;
  };
}

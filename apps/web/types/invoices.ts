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
  order?: {
    refNumber: string;
  };
  documents?: InvoiceDocument[];
}

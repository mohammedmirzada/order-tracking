import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices | Order Tracking System",
  description: "Manage order invoices and documents",
};

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suppliers | Order Tracking System",
  description: "Manage suppliers",
};

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

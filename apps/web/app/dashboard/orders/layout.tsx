import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders | Order Tracking System",
  description: "Manage and track your orders",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

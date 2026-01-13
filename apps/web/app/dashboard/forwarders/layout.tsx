import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forwarders | Order Tracking System",
  description: "Manage forwarders",
};

export default function ForwardersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

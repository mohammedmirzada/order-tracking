"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const OrdersPageContent = dynamic(() => import('./orders-content'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-96 w-full" />
    </div>
  ),
});

export default function OrdersPage() {
  return <OrdersPageContent />;
}


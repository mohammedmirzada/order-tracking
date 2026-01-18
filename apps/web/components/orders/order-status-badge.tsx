import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types/orders";

/**
 * Visual status indicator for orders
 * Filament-style colored badges
 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variants: Record<
    OrderStatus,
    { label: string; className: string }
  > = {
    DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    PLACED: { label: "Placed", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
    DISPATCHED: { label: "Dispatched", className: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
    SHIPPED: { label: "Shipped", className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" },
    IN_TRANSIT: { label: "In Transit", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
    DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-800 hover:bg-green-200" },
    CANCELED: { label: "Canceled", className: "bg-red-100 text-red-800 hover:bg-red-200" },
  };

  const config = variants[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}

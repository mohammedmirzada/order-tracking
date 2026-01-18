import dynamic from "next/dynamic";

const OrdersClientPage = dynamic(() => import("./orders-client"), {
  ssr: false,
});

export default function OrdersPage() {
  return <OrdersClientPage />;
}

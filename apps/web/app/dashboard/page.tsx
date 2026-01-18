"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

interface Order {
  id: string;
  refNumber: string;
  status: string;
  orderDate: string;
  supplier: { name: string };
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    draft: 0,
    placed: 0,
    dispatched: 0,
    shipped: 0,
    inTransit: 0,
    delivered: 0,
    canceled: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/orders?limit=1000", { cache: "no-store" });
      if (!res.ok) {
        const message = await res.text().catch(() => "Failed to load orders");
        throw new Error(message || "Failed to load orders");
      }

      const data = await res.json();
      const orders = Array.isArray(data?.data)
        ? data.data.map((order: any) => ({
            ...order,
            items: Array.isArray(order?.items) ? order.items : [],
            supplier: order?.supplier || { name: "—" },
          }))
        : [];
      
      setStats({
        totalOrders: orders.length,
        draft: orders.filter((o: any) => o.status === "DRAFT").length,
        placed: orders.filter((o: any) => o.status === "PLACED").length,
        dispatched: orders.filter((o: any) => o.status === "DISPATCHED").length,
        shipped: orders.filter((o: any) => o.status === "SHIPPED").length,
        inTransit: orders.filter((o: any) => o.status === "IN_TRANSIT").length,
        delivered: orders.filter((o: any) => o.status === "DELIVERED").length,
        canceled: orders.filter((o: any) => o.status === "CANCELED").length,
      });
      
      // Get 5 most recent orders
      setRecentOrders(
        orders.slice(0, 5).map((order: any) => ({
          ...order,
          refNumber: order?.refNumber || "—",
          status: order?.status || "DRAFT",
          supplier: order?.supplier || { name: "—" },
        }))
      );
      setStatsError(null);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStatsError(error instanceof Error ? error.message : "Failed to fetch stats");
      setStats({
        totalOrders: 0,
        draft: 0,
        placed: 0,
        dispatched: 0,
        shipped: 0,
        inTransit: 0,
        delivered: 0,
        canceled: 0,
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <span className="text-xs text-muted-foreground">BUILD: 2026-01-18-01</span>
        <Link 
          href="/dashboard/orders" 
          className="text-sm text-blue-600 hover:underline"
        >
          View all orders →
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.inTransit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              On the way
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.delivered}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats.placed + stats.dispatched + stats.shipped}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting shipment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2" id="dashboard-secondary">
        <Card id="order-status-breakdown" data-section="order-status-breakdown">
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsError && (
              <p className="text-sm text-destructive">{statsError}</p>
            )}
            {loading ? (
              <>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Draft</span>
                  <span className="text-sm font-semibold">{stats.draft}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Placed</span>
                  <span className="text-sm font-semibold">{stats.placed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dispatched</span>
                  <span className="text-sm font-semibold">{stats.dispatched}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Shipped</span>
                  <span className="text-sm font-semibold">{stats.shipped}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">In Transit</span>
                  <span className="text-sm font-semibold">{stats.inTransit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Delivered</span>
                  <span className="text-sm font-semibold">{stats.delivered}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Canceled</span>
                  <span className="text-sm font-semibold text-red-600">{stats.canceled}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card id="recent-orders" data-section="recent-orders">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No orders yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link 
                    key={order.id}
                    href="/dashboard/orders"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{order.refNumber || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.supplier?.name || "—"}
                        </p>
                      </div>
                    </div>
                    <OrderStatusBadge status={(order.status || "DRAFT") as any} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
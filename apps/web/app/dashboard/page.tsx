"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    inTransit: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/orders?limit=1000");
      if (res.ok) {
        const data = await res.json();
        const orders = data.data || [];
        
        setStats({
          totalOrders: orders.length,
          inTransit: orders.filter((o: any) => o.status === "IN_TRANSIT").length,
          delivered: orders.filter((o: any) => o.status === "DELIVERED").length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? <Skeleton className="h-9 w-16" /> : stats.totalOrders}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>In Transit</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? <Skeleton className="h-9 w-16" /> : stats.inTransit}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Delivered</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? <Skeleton className="h-9 w-16" /> : stats.delivered}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
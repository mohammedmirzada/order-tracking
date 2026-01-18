"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Order } from "@/types/orders";
import { OrdersTable } from "@/components/orders/orders-table";
import { OrderDialog } from "@/components/orders/order-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PaginatedResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const isInitialLoad = useRef(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    try {
      if (isInitialLoad.current) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      
      const res = await fetch(`/api/orders?${params}`, {
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Orders] API error:', res.status, errorText);
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }

      const responseText = await res.text();
      let response: PaginatedResponse;
      
      try {
        response = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Orders] JSON parse error:', parseError, responseText.substring(0, 200));
        throw new Error("Invalid JSON response from server");
      }
      
      // Detailed validation and logging
      console.log('[Orders] Raw response:', responseText.substring(0, 500));
      
      if (!response || typeof response !== 'object') {
        console.error('[Orders] Invalid response type:', typeof response);
        throw new Error("Invalid response from server");
      }
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('[Orders] Invalid data format:', response);
        throw new Error("Invalid response format from server");
      }
      
      // Sanitize orders data with deep cloning
      const sanitizedOrders = response.data.map((order: any, index: number) => {
        try {
          return {
            ...order,
            supplier: order.supplier && typeof order.supplier === 'object' ? order.supplier : { name: 'Unknown Supplier' },
            forwarder: order.forwarder && typeof order.forwarder === 'object' ? order.forwarder : { name: 'Unknown Forwarder' },
            invoices: Array.isArray(order.invoices) ? order.invoices : []
          };
        } catch (err) {
          console.error(`[Orders] Error sanitizing order ${index}:`, err, order);
          return null;
        }
      }).filter(Boolean);
      
      console.log('[Orders] Sanitized orders count:', sanitizedOrders.length);
      
      setOrders(sanitizedOrders);
      setMeta(response.meta || { total: 0, page: 1, limit: 10, totalPages: 0 });
      setError(null);
      isInitialLoad.current = false;
    } catch (err) {
      console.error('[Orders] Fetch error:', err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedOrder(undefined);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-8 text-center">
        <p className="text-destructive font-medium">Failed to load orders</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage your order shipments and tracking
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      <div className={searching ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <OrdersTable orders={orders} onUpdate={fetchOrders} onEdit={handleEdit} />
      </div>
      
      {meta.total > 0 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          itemsPerPage={meta.limit}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
        />
      )}

      <OrderDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        order={selectedOrder}
        onSuccess={fetchOrders}
      />
    </div>
  );
}

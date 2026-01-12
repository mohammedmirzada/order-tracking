"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Forwarder } from "@/types/forwarders";
import { ForwardersTable } from "@/components/forwarders/forwarders-table";
import { ForwarderDialog } from "@/components/forwarders/forwarder-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PaginatedResponse {
  data: Forwarder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ForwardersPage() {
  const [forwarders, setForwarders] = useState<Forwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  const fetchForwarders = useCallback(async () => {
    try {
      // Only show skeleton on initial load, use subtle indicator for search
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
      const res = await fetch(`/api/forwarders?${params}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch forwarders");
      }

      const response: PaginatedResponse = await res.json();
      setForwarders(response.data);
      setMeta(response.meta);
      setError(null);
      isInitialLoad.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchForwarders();
  }, [fetchForwarders]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-8 text-center">
        <p className="text-destructive font-medium">Failed to load forwarders</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Forwarders</h1>
          <p className="text-sm text-muted-foreground">
            Manage your freight forwarders
          </p>
        </div>
        <ForwarderDialog onSuccess={fetchForwarders} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search forwarders..."
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
        <ForwardersTable forwarders={forwarders} onUpdate={fetchForwarders} />
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
    </div>
  );
}

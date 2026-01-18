"use client";

import { useState } from "react";
import { Order } from "@/types/orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "./order-status-badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2, FileText, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrdersTableProps {
  orders: Order[];
  onUpdate: () => void;
  onEdit?: (order: Order) => void;
}

export function OrdersTable({ orders, onUpdate, onEdit }: OrdersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<string>("");
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete order");
      }

      onUpdate();
      setDeleteId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No orders found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first order to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ref #</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Forwarder</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Delivery (Est.)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            try {
              return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.refNumber}</TableCell>
              <TableCell>{order.supplier?.name || "—"}</TableCell>
              <TableCell>{order.forwarder?.name || "—"}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>{formatDate(order.orderDate)}</TableCell>
              <TableCell>{formatDate(order.estimatedDeliveryDate)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setSelectedComment(order.comments || "No comment");
                      setCommentDialogOpen(true);
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Comment
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedOrder(order);
                        setInvoiceDialogOpen(true);
                      }}
                      disabled={!order.invoices || !Array.isArray(order.invoices) || order.invoices.length === 0}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(order)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteId(order.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            );
            } catch (error) {
              console.error('[OrdersTable] Error rendering order:', order.id, error);
              return (
                <TableRow key={order.id}>
                  <TableCell colSpan={7} className="text-destructive">
                    Error displaying order {order.refNumber || order.id}
                  </TableCell>
                </TableRow>
              );
            }
          })}
        </TableBody>
      </Table>

      {/* Comment Dialog */}
      <AlertDialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Comment</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">
              {selectedComment}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setCommentDialogOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Dialog */}
      <AlertDialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invoice Details</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                {selectedOrder?.invoices && Array.isArray(selectedOrder.invoices) && selectedOrder.invoices.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Invoice Number:</div>
                      <div>{selectedOrder.invoices[0]?.invoiceNumber || "—"}</div>
                      
                      <div className="font-medium">Invoice Date:</div>
                      <div>{formatDate(selectedOrder.invoices[0]?.invoiceDate)}</div>
                      
                      <div className="font-medium">Order Ref:</div>
                      <div>{selectedOrder.refNumber}</div>
                      
                      <div className="font-medium">Created:</div>
                      <div>{formatDate(selectedOrder.invoices[0]?.createdAt)}</div>
                    </div>
                    
                    {selectedOrder.invoices?.[0]?.documents && Array.isArray(selectedOrder.invoices[0].documents) && selectedOrder.invoices[0].documents.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="font-medium text-sm mb-2">Documents ({selectedOrder.invoices[0].documents.length}):</div>
                        <div className="space-y-1">
                          {(selectedOrder.invoices[0].documents || []).map((doc: any) => (
                            <button
                              key={doc.id}
                              onClick={() => {
                                const invoiceId = selectedOrder?.invoices?.[0]?.id;
                                if (invoiceId) {
                                  window.open(`/api/invoices/${invoiceId}/documents/${doc.id}`, '_blank');
                                }
                              }}
                              className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded w-full text-left"
                            >
                              <Download className="h-4 w-4 text-muted-foreground" />
                              <span>{doc.originalName}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                ({(doc.size / 1024).toFixed(1)} KB)
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p>No invoice found for this order.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setInvoiceDialogOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => {
        setDeleteId(null);
        setError(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this order. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/types/orders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
}

interface Forwarder {
  id: string;
  name: string;
}

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order;
  onSuccess: () => void;
}

export function OrderDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: OrderDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [forwarders, setForwarders] = useState<Forwarder[]>([]);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [showNewForwarder, setShowNewForwarder] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newForwarderName, setNewForwarderName] = useState("");
  const [creating, setCreating] = useState(false);

  const [createInvoice, setCreateInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    refNumber: "",
    supplierId: "",
    forwarderId: "",
    status: "DRAFT" as OrderStatus,
    orderDate: new Date().toISOString().split("T")[0],
    dispatchDate: "",
    estimatedDeliveryDate: "",
    actualDeliveryDate: "",
    shipmentName: "",
    comments: "",
  });

  useEffect(() => {
    if (order) {
      setFormData({
        refNumber: order.refNumber,
        supplierId: order.supplierId,
        forwarderId: order.forwarderId,
        status: order.status,
        orderDate: order.orderDate?.split("T")[0] || "",
        dispatchDate: order.dispatchDate?.split("T")[0] || "",
        estimatedDeliveryDate: order.estimatedDeliveryDate?.split("T")[0] || "",
        actualDeliveryDate: order.actualDeliveryDate?.split("T")[0] || "",
        shipmentName: order.shipmentName || "",
        comments: order.comments || "",
      });
    } else {
      setFormData({
        refNumber: "",
        supplierId: "",
        forwarderId: "",
        status: "DRAFT",
        orderDate: new Date().toISOString().split("T")[0],
        dispatchDate: "",
        estimatedDeliveryDate: "",
        actualDeliveryDate: "",
        shipmentName: "",
        comments: "",
      });
    }
  }, [order, open]);

  useEffect(() => {
    if (open) {
      fetchSuppliers();
      fetchForwarders();
    }
  }, [open]);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers?limit=1000");
      if (res.ok) {
        const response = await res.json();
        setSuppliers(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  const fetchForwarders = async () => {
    try {
      const res = await fetch("/api/forwarders?limit=1000");
      if (res.ok) {
        const response = await res.json();
        setForwarders(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch forwarders:", error);
    }
  };
  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) return;
    
    setCreating(true);
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSupplierName.trim() }),
      });

      if (res.ok) {
        const newSupplier = await res.json();
        setSuppliers([...suppliers, newSupplier]);
        setFormData({ ...formData, supplierId: newSupplier.id });
        setNewSupplierName("");
        setShowNewSupplier(false);
      }
    } catch (error) {
      console.error("Failed to create supplier:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateForwarder = async () => {
    if (!newForwarderName.trim()) return;
    
    setCreating(true);
    try {
      const res = await fetch("/api/forwarders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newForwarderName.trim() }),
      });

      if (res.ok) {
        const newForwarder = await res.json();
        setForwarders([...forwarders, newForwarder]);
        setFormData({ ...formData, forwarderId: newForwarder.id });
        setNewForwarderName("");
        setShowNewForwarder(false);
      }
    } catch (error) {
      console.error("Failed to create forwarder:", error);
    } finally {
      setCreating(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = order ? `/api/orders/${order.id}` : "/api/orders";
      const method = order ? "PATCH" : "POST";

      const payload: any = {
        supplierId: formData.supplierId,
        forwarderId: formData.forwarderId,
        status: formData.status,
        orderDate: formData.orderDate || null,
        dispatchDate: formData.dispatchDate || null,
        estimatedDeliveryDate: formData.estimatedDeliveryDate || null,
        actualDeliveryDate: formData.actualDeliveryDate || null,
        shipmentName: formData.shipmentName || null,
        comments: formData.comments || null,
      };

      // Only include refNumber when creating
      if (!order) {
        payload.refNumber = formData.refNumber;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save order");
      }

      const savedOrder = await res.json();

      // If creating order and createInvoice is checked, create invoice
      if (!order && createInvoice && invoiceNumber.trim()) {
        try {
          const invoiceRes = await fetch("/api/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: savedOrder.id,
              invoiceNumber: invoiceNumber.trim(),
              invoiceDate: invoiceDate || null,
            }),
          });

          if (!invoiceRes.ok) {
            throw new Error("Failed to create invoice");
          }

          const createdInvoice = await invoiceRes.json();

          // Upload documents if any
          if (invoiceFiles.length > 0) {
            for (const file of invoiceFiles) {
              const formData = new FormData();
              formData.append("file", file);

              const uploadRes = await fetch(
                `/api/invoices/${createdInvoice.id}/documents`,
                {
                  method: "POST",
                  body: formData,
                }
              );

              if (!uploadRes.ok) {
                console.error("Failed to upload document:", file.name);
              }
            }
          }
        } catch (invoiceError) {
          console.error("Invoice creation error:", invoiceError);
          // Don't fail the whole operation if invoice fails
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? "Edit Order" : "Create Order"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="refNumber">Reference Number *</Label>
              <Input
                id="refNumber"
                value={formData.refNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, refNumber: value });
                  if (!order && createInvoice) {
                    setInvoiceNumber(value);
                  }
                }}
                required
                disabled={!!order}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as OrderStatus })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="PLACED">Placed</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="SHIPPED">Shipped</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <div className="flex gap-2">
                <select
                  value={formData.supplierId}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierId: e.target.value })
                  }
                  className="h-10 w-full flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Select supplier
                  </option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewSupplier(!showNewSupplier)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewSupplier && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="New supplier name"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateSupplier()}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateSupplier}
                    disabled={creating || !newSupplierName.trim()}
                  >
                    {creating ? "..." : "Add"}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="forwarder">Forwarder *</Label>
              <div className="flex gap-2">
                <select
                  value={formData.forwarderId}
                  onChange={(e) =>
                    setFormData({ ...formData, forwarderId: e.target.value })
                  }
                  className="h-10 w-full flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Select forwarder
                  </option>
                  {forwarders.map((forwarder) => (
                    <option key={forwarder.id} value={forwarder.id}>
                      {forwarder.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewForwarder(!showNewForwarder)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewForwarder && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="New forwarder name"
                    value={newForwarderName}
                    onChange={(e) => setNewForwarderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateForwarder()}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateForwarder}
                    disabled={creating || !newForwarderName.trim()}
                  >
                    {creating ? "..." : "Add"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipmentName">Shipment Name</Label>
            <Input
              id="shipmentName"
              value={formData.shipmentName}
              onChange={(e) =>
                setFormData({ ...formData, shipmentName: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={(e) =>
                  setFormData({ ...formData, orderDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dispatchDate">Dispatch Date</Label>
              <Input
                id="dispatchDate"
                type="date"
                value={formData.dispatchDate}
                onChange={(e) =>
                  setFormData({ ...formData, dispatchDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedDeliveryDate">Estimated Delivery</Label>
              <Input
                id="estimatedDeliveryDate"
                type="date"
                value={formData.estimatedDeliveryDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDeliveryDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualDeliveryDate">Actual Delivery</Label>
              <Input
                id="actualDeliveryDate"
                type="date"
                value={formData.actualDeliveryDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    actualDeliveryDate: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              rows={3}
            />
          </div>

          {!order && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="createInvoice"
                  checked={createInvoice}
                  onChange={(e) => setCreateInvoice(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="createInvoice" className="cursor-pointer font-normal">
                  Create invoice for this order
                </Label>
              </div>

              {createInvoice && (
                <div className="space-y-4 pl-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                      <Input
                        id="invoiceNumber"
                        placeholder="e.g., INV-2024-001"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        required={createInvoice}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate">Invoice Date *</Label>
                      <Input
                        id="invoiceDate"
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        required={createInvoice}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceFiles">Invoice Documents (Optional)</Label>
                    <Input
                      id="invoiceFiles"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files) {
                          setInvoiceFiles(Array.from(e.target.files));
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {invoiceFiles.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {invoiceFiles.length} file(s) selected
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : order ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

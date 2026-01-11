Below is a **clean API routes documentation** (career-style). It focuses on **routes + parameters + request body**, and how to call them.

Assumptions:

* API base URL: `http://localhost:3001`
* Protected routes require `Authorization: Bearer <token>`

---

# Auth

## POST `/auth/register`

Create user.

**Body**

```json
{
  "email": "admin@example.com",
  "password": "123456",
  "name": "Admin"
}
```

**Response (example)**

```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "name": "Admin",
  "role": "ADMIN",
  "createdAt": "2026-01-11T..."
}
```

---

## POST `/auth/login`

Login and get JWT.

**Body**

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

**Response**

```json
{ "accessToken": "JWT_TOKEN_HERE" }
```

---

## GET `/auth/me` 🔒

Get current user.

**Headers**

* `Authorization: Bearer <token>`

**Response**

```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "name": "Admin",
  "role": "ADMIN"
}
```

---

# Suppliers 🔒

## GET `/suppliers`

List suppliers.

## GET `/suppliers/:id`

Get one supplier.

**Path params**

* `id` (uuid)

## POST `/suppliers`

Create supplier.

**Body**

```json
{ "name": "Supplier A" }
```

## PATCH `/suppliers/:id`

Update supplier.

**Path params**

* `id` (uuid)

**Body**

```json
{ "name": "Supplier Updated" }
```

## DELETE `/suppliers/:id`

Delete supplier.

**Path params**

* `id` (uuid)

---

# Forwarders 🔒

## GET `/forwarders`

List forwarders.

## GET `/forwarders/:id`

Get one forwarder.

**Path params**

* `id` (uuid)

## POST `/forwarders`

Create forwarder.

**Body**

```json
{ "name": "DHL" }
```

## PATCH `/forwarders/:id`

Update forwarder.

**Body**

```json
{ "name": "DHL Express" }
```

## DELETE `/forwarders/:id`

Delete forwarder.

---

# Orders 🔒

## GET `/orders`

List orders (basic).

> If you later add filtering/search, common query params are:

* `status=DRAFT|PLACED|DISPATCHED|IN_TRANSIT|DELIVERED|CANCELED`
* `q=REF-1001` (search)
* `supplierId=<uuid>`
* `forwarderId=<uuid>`

Example:
`/orders?status=IN_TRANSIT&supplierId=<uuid>`

---

## GET `/orders/:id`

Get order details (includes supplier, forwarder, items, invoices).

**Path params**

* `id` (uuid)

---

## POST `/orders`

Create an order (optionally with items in the same request).

**Body (minimum)**

```json
{
  "refNumber": "REF-1001",
  "supplierId": "uuid",
  "forwarderId": "uuid"
}
```

**Body (full example)**

```json
{
  "refNumber": "REF-1001",
  "supplierId": "uuid",
  "forwarderId": "uuid",
  "status": "PLACED",
  "orderDate": "2026-01-11",
  "dispatchDate": "2026-01-12",
  "estimatedDeliveryDate": "2026-01-20",
  "actualDeliveryDate": "2026-01-21",
  "shipmentName": "Shipment #1",
  "comments": "Handle with care",
  "items": [
    {
      "sku": "SKU-1",
      "itemName": "iPhone Case",
      "quantity": 2,
      "price": 10.5,
      "total": 21
    }
  ]
}
```

---

## PATCH `/orders/:id`

Update order fields (status, dates, supplier, forwarder, etc.)

**Path params**

* `id` (uuid)

**Body (example)**

```json
{
  "status": "DISPATCHED",
  "dispatchDate": "2026-01-12",
  "comments": "Left warehouse"
}
```

---

## DELETE `/orders/:id`

Delete an order (items/invoices delete depends on your Prisma `onDelete` rules).

---

# Invoices 🔒

## GET `/invoices`

List invoices.

## POST `/invoices`

Create invoice.

**Body**

```json
{
  "orderId": "uuid",
  "invoiceNumber": "INV-0001",
  "invoiceDate": "2026-01-11"
}
```

## DELETE `/invoices/:id`

Delete invoice.

**Path params**

* `id` (uuid)

---

# How to call protected routes (example)

1. Login → get token
2. Use it:

**Headers**

* `Authorization: Bearer <token>`
* `Content-Type: application/json`

Example request:

```bash
curl http://localhost:3001/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```
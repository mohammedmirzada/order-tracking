-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PLACED', 'DISPATCHED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

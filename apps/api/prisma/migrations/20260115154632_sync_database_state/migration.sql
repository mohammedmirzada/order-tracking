-- This migration syncs the schema with the current database state

-- Add DISPATCHED to OrderStatus enum (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'DISPATCHED' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
  ) THEN
    ALTER TYPE "OrderStatus" ADD VALUE 'DISPATCHED';
  END IF;
END $$;

-- Add SHIPPED to OrderStatus enum (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'SHIPPED' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
  ) THEN
    ALTER TYPE "OrderStatus" ADD VALUE 'SHIPPED';
  END IF;
END $$;

-- Create invoice_documents table (if not exists)
CREATE TABLE IF NOT EXISTS "invoice_documents" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_documents_pkey" PRIMARY KEY ("id")
);

-- Create index on invoice_id (if not exists)
CREATE INDEX IF NOT EXISTS "invoice_documents_invoice_id_idx" ON "invoice_documents"("invoice_id");

-- Add foreign key constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoice_documents_invoice_id_fkey'
  ) THEN
    ALTER TABLE "invoice_documents" 
    ADD CONSTRAINT "invoice_documents_invoice_id_fkey" 
    FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
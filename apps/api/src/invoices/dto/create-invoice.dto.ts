import { IsDateString, IsString, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  orderId: string;

  @IsString()
  invoiceNumber: string;

  @IsDateString()
  invoiceDate: string;
}
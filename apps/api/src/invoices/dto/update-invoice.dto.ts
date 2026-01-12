import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @IsDateString()
  @IsOptional()
  invoiceDate?: string;
}

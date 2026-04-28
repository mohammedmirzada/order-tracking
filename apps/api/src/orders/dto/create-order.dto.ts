import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export enum OrderStatusDto {
  DRAFT = 'DRAFT',
  PLACED = 'PLACED',
  DISPATCHED = 'DISPATCHED',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export class CreateOrderDto {
  @IsString()
  refNumber: string;

  @IsUUID()
  supplierId: string;

  @IsOptional()
  @IsUUID()
  forwarderId?: string;

  @IsOptional()
  @IsEnum(OrderStatusDto)
  status?: OrderStatusDto;

  @IsOptional() @IsDateString() orderDate?: string;
  @IsOptional() @IsDateString() dispatchDate?: string;
  @IsOptional() @IsDateString() estimatedDeliveryDate?: string;
  @IsOptional() @IsDateString() actualDeliveryDate?: string;

  @IsOptional() @IsString() shipmentName?: string;
  @IsOptional() @IsString() comments?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];
}
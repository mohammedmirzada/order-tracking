import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export enum OrderStatusDto {
  PLACED = 'PLACED',
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
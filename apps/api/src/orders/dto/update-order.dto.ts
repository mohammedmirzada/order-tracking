import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto, OrderStatusDto } from './create-order.dto';

export class UpdateOrderDto {
  @IsOptional() @IsUUID() supplierId?: string;
  @IsOptional() @IsUUID() forwarderId?: string;

  @IsOptional() @IsEnum(OrderStatusDto) status?: OrderStatusDto;

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
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderStatusDto } from './create-order.dto';

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
}
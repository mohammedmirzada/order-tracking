import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class OrderItemDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  @MinLength(1)
  itemName: string;

  @IsInt()
  @Min(1)
  quantity: number;

  // We'll accept numbers and store as Decimal
  @Min(0)
  price: number;

  @Min(0)
  total: number;
}
import { IsOptional, IsString, MinLength } from 'class-validator';
export class UpdateForwarderDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
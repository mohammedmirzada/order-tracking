import { IsString, MinLength } from 'class-validator';
export class CreateForwarderDto {
  @IsString()
  @MinLength(2)
  name: string;
}
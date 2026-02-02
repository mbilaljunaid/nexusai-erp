import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class POLineDto {
  @IsString()
  item!: string;

  @IsString()
  description!: string;

  @IsString()
  quantity!: string;

  @IsString()
  unit!: string;

  @IsString()
  unitPrice!: string;
}

export class CreatePurchaseOrderDto {
  @IsString()
  poNumber!: string;

  @IsString()
  vendor!: string;

  @IsString()
  poDate!: string;

  @IsString()
  dueDate!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POLineDto)
  lines!: POLineDto[];
}

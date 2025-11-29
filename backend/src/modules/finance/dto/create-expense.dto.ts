import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExpenseLineDto {
  @IsString()
  date!: string;

  @IsString()
  category!: string;

  @IsString()
  description!: string;

  @IsString()
  amount!: string;

  @IsOptional()
  @IsString()
  receipt?: string;
}

export class CreateExpenseDto {
  @IsString()
  project!: string;

  @IsString()
  employee!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseLineDto)
  lines!: ExpenseLineDto[];
}

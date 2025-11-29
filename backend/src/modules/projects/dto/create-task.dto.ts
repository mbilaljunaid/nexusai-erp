import { IsString, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsString()
  project!: string;

  @IsString()
  assignee!: string;

  @IsString()
  priority!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  dependencies?: string;

  @IsOptional()
  @IsString()
  estimatedHours?: string;
}

import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TimesheetEntryDto {
  @IsString()
  date!: string;

  @IsString()
  project!: string;

  @IsString()
  task!: string;

  @IsString()
  hours!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTimesheetDto {
  @IsString()
  week!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimesheetEntryDto)
  entries!: TimesheetEntryDto[];

  // Support for flat/single entry creation/update (Legacy/Service compatibility)
  @IsOptional() @IsString() employeeId?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() taskId?: string;
  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsString() hours?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() status?: string; // SUBMITTED, APPROVED, etc
  @IsOptional() @IsString() billableFlag?: string | boolean; // Service uses string, schema uses boolean
}

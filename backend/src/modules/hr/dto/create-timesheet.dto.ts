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
}

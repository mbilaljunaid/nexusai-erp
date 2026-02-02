import { IsString, IsOptional } from 'class-validator';

export class CreateLeaveDto {
  @IsString()
  leaveType!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsString()
  days!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  approver?: string;

  @IsOptional()
  @IsString()
  replacement?: string;
}

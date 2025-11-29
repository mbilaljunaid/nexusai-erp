import { IsString, IsOptional } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  campaignName!: string;

  @IsString()
  campaignType!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  audienceSegment?: string;
}

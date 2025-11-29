export class CreateCampaignDto {
  campaignName: string;
  campaignType: string;
  startDate: string;
  endDate: string;
  description?: string;
  audienceSegment?: string;
}

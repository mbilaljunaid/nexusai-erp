export interface Campaign {
  id: number;
  campaignName: string;
  campaignType: string;
  startDate: string;
  endDate: string;
  description?: string;
  audienceSegment?: string;
  createdAt: Date;
}

import { Injectable } from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign } from './entities/campaign.entity';

@Injectable()
export class CampaignService {
  private campaigns: Campaign[] = [];
  private idCounter = 1;

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign: Campaign = {
      id: this.idCounter++,
      ...createCampaignDto,
      createdAt: new Date(),
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaigns;
  }

  async findOne(id: string): Promise<Campaign | null> {
    return this.campaigns.find(c => c.id === parseInt(id)) || null;
  }

  async update(id: string, updateCampaignDto: Partial<CreateCampaignDto>): Promise<Campaign | null> {
    const campaign = this.campaigns.find(c => c.id === parseInt(id));
    if (!campaign) return null;
    Object.assign(campaign, updateCampaignDto);
    return campaign;
  }

  async remove(id: string): Promise<void> {
    const index = this.campaigns.findIndex(c => c.id === parseInt(id));
    if (index > -1) this.campaigns.splice(index, 1);
  }
}

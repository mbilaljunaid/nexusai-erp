import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign } from './entities/campaign.entity';

@Controller('api/marketing/campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  findAll(): Promise<Campaign[]> {
    return this.campaignService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Campaign | null> {
    return this.campaignService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: Partial<CreateCampaignDto>,
  ): Promise<Campaign | null> {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.campaignService.remove(id);
  }
}

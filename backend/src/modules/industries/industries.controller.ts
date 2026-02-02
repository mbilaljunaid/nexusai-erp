import { Controller, Get, Param } from '@nestjs/common';
import { IndustriesService, IndustryConfig } from './industries.service';

@Controller('api/industries')
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  @Get()
  findAll(): IndustryConfig[] {
    return this.industriesService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): IndustryConfig | { error: string } {
    const industry = this.industriesService.getById(id);
    return industry || { error: 'Industry not found' };
  }

  @Get(':id/modules')
  getModules(@Param('id') id: string): string[] {
    return this.industriesService.getModules(id);
  }

  @Get(':id/capabilities')
  getCapabilities(@Param('id') id: string): string[] {
    return this.industriesService.getCapabilities(id);
  }
}

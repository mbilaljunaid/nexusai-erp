import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead } from './entities/lead.entity';

@Controller('api/crm/leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  create(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.leadService.create(createLeadDto);
  }

  @Get()
  findAll(): Promise<Lead[]> {
    return this.leadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Lead> {
    return this.leadService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateLeadDto>,
  ): Promise<Lead> {
    return this.leadService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.leadService.remove(id);
  }
}

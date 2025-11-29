import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { GLEntryService } from './gl-entry.service';
import { CreateGLEntryDto } from './dto/create-gl-entry.dto';
import { GLEntry } from './entities/gl-entry.entity';

@Controller('api/erp/gl-entries')
export class GLEntryController {
  constructor(private readonly glEntryService: GLEntryService) {}

  @Post()
  create(@Body() createGLEntryDto: CreateGLEntryDto): Promise<GLEntry> {
    return this.glEntryService.create(createGLEntryDto);
  }

  @Get()
  findAll(): Promise<GLEntry[]> {
    return this.glEntryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<GLEntry | null> {
    return this.glEntryService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateGLEntryDto: Partial<CreateGLEntryDto>,
  ): Promise<GLEntry | null> {
    return this.glEntryService.update(id, updateGLEntryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.glEntryService.remove(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GLEntry } from './entities/gl-entry.entity';
import { CreateGLEntryDto } from './dto/create-gl-entry.dto';

@Injectable()
export class GLEntryService {
  constructor(
    @InjectRepository(GLEntry)
    private glEntryRepository: Repository<GLEntry>,
  ) {}

  async create(createGLEntryDto: CreateGLEntryDto): Promise<GLEntry> {
    const glEntry = this.glEntryRepository.create(createGLEntryDto);
    return this.glEntryRepository.save(glEntry);
  }

  async findAll(): Promise<GLEntry[]> {
    return this.glEntryRepository.find();
  }

  async findOne(id: string): Promise<GLEntry | null> {
    return this.glEntryRepository.findOneBy({ id });
  }

  async update(id: string, updateGLEntryDto: Partial<CreateGLEntryDto>): Promise<GLEntry | null> {
    await this.glEntryRepository.update(id, updateGLEntryDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.glEntryRepository.delete(id);
  }
}

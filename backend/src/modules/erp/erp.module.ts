import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GLEntry } from './entities/gl-entry.entity';
import { GLEntryService } from './gl-entry.service';
import { GLEntryController } from './gl-entry.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GLEntry])],
  controllers: [GLEntryController],
  providers: [GLEntryService],
  exports: [GLEntryService],
})
export class ERPModule {}

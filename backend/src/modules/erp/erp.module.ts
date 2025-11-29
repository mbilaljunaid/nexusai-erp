import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GLEntry } from './entities/gl-entry.entity';
import { Invoice } from './entities/invoice.entity';
import { GLEntryService } from './gl-entry.service';
import { GLEntryController } from './gl-entry.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GLEntry, Invoice])],
  controllers: [GLEntryController, InvoiceController],
  providers: [GLEntryService, InvoiceService],
  exports: [GLEntryService, InvoiceService],
})
export class ERPModule {}

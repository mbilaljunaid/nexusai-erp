import { Module } from '@nestjs/common';
import { MarketingAdvancedService } from './marketing-advanced.service';

@Module({
  providers: [MarketingAdvancedService],
  exports: [MarketingAdvancedService],
})
export class MarketingAdvancedModule {}

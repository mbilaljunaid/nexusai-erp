import { Module } from '@nestjs/common';
import { EPMService } from './epm.service';

@Module({
  providers: [EPMService],
  exports: [EPMService],
})
export class EPMModule {}

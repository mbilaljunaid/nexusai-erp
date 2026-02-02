import { Module } from '@nestjs/common';
import { IndustriesService } from './industries.service';
import { IndustriesController } from './industries.controller';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';

@Module({
  controllers: [IndustriesController, ConfigurationController],
  providers: [IndustriesService, ConfigurationService],
  exports: [IndustriesService, ConfigurationService],
})
export class IndustriesModule {} // eslint-disable-line

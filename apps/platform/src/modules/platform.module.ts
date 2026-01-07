import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { TenantEntity, UserEntity, AuditLogEntity } from './platform.entities';

@Module({
    imports: [TypeOrmModule.forFeature([TenantEntity, UserEntity, AuditLogEntity])],
    controllers: [PlatformController],
    providers: [PlatformService],
})
export class PlatformModule { }

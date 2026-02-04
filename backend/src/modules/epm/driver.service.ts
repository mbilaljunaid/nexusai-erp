
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanDriver } from './entities/plan-driver.entity';

@Injectable()
export class DriverService {
    private readonly logger = new Logger(DriverService.name);

    constructor(
        @InjectRepository(PlanDriver)
        private driverRepository: Repository<PlanDriver>
    ) { }

    async createDriver(code: string, name: string, value: number): Promise<PlanDriver> {
        const driver = this.driverRepository.create({ code, name, value });
        return this.driverRepository.save(driver);
    }

    async getDrivers(): Promise<PlanDriver[]> {
        return this.driverRepository.find({ where: { isActive: true } });
    }

    async getDriver(code: string): Promise<PlanDriver | null> {
        return this.driverRepository.findOneBy({ code });
    }
}

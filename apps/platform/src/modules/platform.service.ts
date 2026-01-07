import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity, UserEntity } from './platform.entities';

@Injectable()
export class PlatformService {
    private readonly logger = new Logger(PlatformService.name);

    constructor(
        @InjectRepository(TenantEntity) private tenantRepo: Repository<TenantEntity>,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    ) { }

    async createTenant(name: string, slug: string) {
        const tenant = this.tenantRepo.create({ name, slug });
        return this.tenantRepo.save(tenant);
    }

    async createUser(tenantId: string, email: string, fullName: string, role: string) {
        // Password hashing would happen here
        const user = this.userRepo.create({
            tenantId,
            email,
            fullName,
            role,
            passwordHash: 'hashed-default',
        });
        return this.userRepo.save(user);
    }

    async findUserByEmail(email: string) {
        return this.userRepo.findOne({ where: { email } });
    }

    async findAllTenants() {
        return this.tenantRepo.find();
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userRepo.findOne({
            where: { email },
            select: ['id', 'email', 'passwordHash', 'role', 'fullName', 'tenantId']
        });
        if (user && user.passwordHash === pass) { // Simple check for now
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
}

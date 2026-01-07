import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PlatformService } from './platform.service';

@Controller('platform')
export class PlatformController {
    constructor(private readonly service: PlatformService) { }

    @Post('tenants')
    createTenant(@Body() body: { name: string; slug: string }) {
        return this.service.createTenant(body.name, body.slug);
    }

    @Post('users')
    createUser(@Body() body: { tenantId: string; email: string; fullName: string; role: string }) {
        return this.service.createUser(body.tenantId, body.email, body.fullName, body.role);
    }

    @Get('users/:email')
    findUser(@Param('email') email: string) {
        return this.service.findUserByEmail(email);
    }

    @Get('tenants')
    findAllTenants() {
        return this.service.findAllTenants();
    }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.service.validateUser(body.email, body.password);
        if (!user) {
            return { status: 401, message: 'Invalid credentials' };
        }
        return { status: 200, user };
    }
}

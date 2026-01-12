import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProcurementAiService } from './procurement-ai.service';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Commented out for MVP ease if needed, but best practice includes it

@Controller('procurement/ai')
export class AiController {
    constructor(private readonly aiService: ProcurementAiService) { }

    @Get('insights')
    // @UseGuards(JwtAuthGuard)
    async getInsights() {
        return this.aiService.getInsights();
    }
}

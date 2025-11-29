import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { UATService, UATScript } from './uat.service';

@Controller('api/uat')
export class UATController {
  constructor(private readonly uatService: UATService) {}

  @Post('generate/:industryId/:moduleId')
  async generateScripts(
    @Param('industryId') industryId: string,
    @Param('moduleId') moduleId: string,
    @Body() { count }: { count?: number },
  ): Promise<UATScript[]> {
    return this.uatService.generateScripts(industryId, moduleId, count || 5);
  }

  @Get('scripts/:industryId')
  getScripts(@Param('industryId') industryId: string): UATScript[] {
    return this.uatService.getScripts(industryId);
  }

  @Get('script/:id')
  getScript(@Param('id') id: string): UATScript | { error: string } {
    const script = this.uatService.getScript(id);
    return script || { error: 'Script not found' };
  }

  @Get('coverage/:industryId')
  getCoverageReport(@Param('industryId') industryId: string): { coverage: number; gaps: string[]; recommendations: string[] } {
    return this.uatService.generateCoverageReport(industryId);
  }
}

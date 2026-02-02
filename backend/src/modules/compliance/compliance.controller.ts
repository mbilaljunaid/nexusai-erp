import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ComplianceService, ComplianceRule, ComplianceViolation } from './compliance.service';

@Controller('api/compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('rules')
  getRules(framework?: string): ComplianceRule[] {
    return this.complianceService.getRules(framework);
  }

  @Get('rules/:id')
  getRule(@Param('id') id: string): ComplianceRule | { error: string } {
    const rule = this.complianceService.getRule(id);
    return rule || { error: 'Rule not found' };
  }

  @Post('check/:industryId')
  checkCompliance(
    @Param('industryId') industryId: string,
    @Body() data: Record<string, any>,
  ): ComplianceViolation[] {
    return this.complianceService.checkCompliance(industryId, data);
  }

  @Post('enforce/:ruleId')
  enforceCompliance(@Param('ruleId') ruleId: string): { success: boolean; actions: string[] } {
    return this.complianceService.enforceCompliance(ruleId);
  }

  @Get('violations')
  getViolations(status?: string): ComplianceViolation[] {
    return this.complianceService.getViolations(status);
  }

  @Post('violations/:id/resolve')
  resolveViolation(
    @Param('id') id: string,
    @Body() { actions }: { actions: string[] },
  ): ComplianceViolation | { error: string } {
    const violation = this.complianceService.resolveViolation(id, actions);
    return violation || { error: 'Violation not found' };
  }
}

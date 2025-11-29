import { Injectable } from '@nestjs/common';

export interface ComplianceRule {
  id: string;
  name: string;
  framework: string;
  requirement: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  automationLevel: 'full' | 'partial' | 'manual';
  enforcedAt: string[];
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  severity: string;
  violationDate: Date;
  description: string;
  correctionRequired: string[];
  status: 'open' | 'in_progress' | 'resolved';
}

@Injectable()
export class ComplianceService {
  private rules: Map<string, ComplianceRule> = new Map([
    ['gdpr-001', {
      id: 'gdpr-001',
      name: 'Data Subject Rights',
      framework: 'GDPR',
      requirement: 'Must provide mechanisms for data subject access, deletion, and portability',
      severity: 'critical',
      automationLevel: 'partial',
      enforcedAt: ['eu', 'global'],
    }],
    ['hipaa-001', {
      id: 'hipaa-001',
      name: 'Protected Health Information Encryption',
      framework: 'HIPAA',
      requirement: 'All PHI must be encrypted at rest and in transit',
      severity: 'critical',
      automationLevel: 'full',
      enforcedAt: ['us-healthcare'],
    }],
    ['sox-001', {
      id: 'sox-001',
      name: 'Financial Controls',
      framework: 'SOX',
      requirement: 'Implement and maintain adequate internal controls for financial reporting',
      severity: 'critical',
      automationLevel: 'partial',
      enforcedAt: ['us-public-companies'],
    }],
    ['iso9001-001', {
      id: 'iso9001-001',
      name: 'Quality Management',
      framework: 'ISO9001',
      requirement: 'Maintain quality management system documentation and records',
      severity: 'high',
      automationLevel: 'partial',
      enforcedAt: ['manufacturing', 'global'],
    }],
    ['pci-dss-001', {
      id: 'pci-dss-001',
      name: 'Payment Card Data Security',
      framework: 'PCI-DSS',
      requirement: 'Protect cardholder data through encryption and access controls',
      severity: 'critical',
      automationLevel: 'full',
      enforcedAt: ['retail', 'finance', 'global'],
    }],
  ]);

  private violations: ComplianceViolation[] = [];
  private violationCounter = 1;

  getRules(framework?: string): ComplianceRule[] {
    if (!framework) {
      return Array.from(this.rules.values());
    }
    return Array.from(this.rules.values()).filter(r => r.framework === framework);
  }

  getRule(id: string): ComplianceRule | undefined {
    return this.rules.get(id);
  }

  checkCompliance(industryId: string, data: Record<string, any>): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Example: Check data encryption for healthcare
    if (industryId === 'healthcare' && !data.encrypted) {
      violations.push({
        id: `violation-${this.violationCounter++}`,
        ruleId: 'hipaa-001',
        severity: 'critical',
        violationDate: new Date(),
        description: 'PHI data is not encrypted',
        correctionRequired: ['Enable encryption', 'Update transmission protocol to TLS 1.2+'],
        status: 'open',
      });
    }

    // Example: Check financial controls
    if ((industryId === 'finance' || industryId === 'public-sector') && !data.auditTrail) {
      violations.push({
        id: `violation-${this.violationCounter++}`,
        ruleId: 'sox-001',
        severity: 'critical',
        violationDate: new Date(),
        description: 'Financial transactions lack audit trail',
        correctionRequired: ['Implement transaction logging', 'Implement approval workflows'],
        status: 'open',
      });
    }

    this.violations.push(...violations);
    return violations;
  }

  enforceCompliance(ruleId: string): { success: boolean; actions: string[] } {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return { success: false, actions: [] };
    }

    const actions: string[] = [];

    if (rule.automationLevel === 'full') {
      actions.push(`✓ Automatically enforced: ${rule.requirement}`);
    } else if (rule.automationLevel === 'partial') {
      actions.push(`⚠ Partially enforced: Review required for ${rule.name}`);
    } else {
      actions.push(`⚠ Manual enforcement required: ${rule.name}`);
    }

    return { success: true, actions };
  }

  getViolations(status?: string): ComplianceViolation[] {
    if (!status) {
      return this.violations;
    }
    return this.violations.filter(v => v.status === status);
  }

  resolveViolation(violationId: string, actions: string[]): ComplianceViolation | undefined {
    const violation = this.violations.find(v => v.id === violationId);
    if (violation) {
      violation.status = 'resolved';
    }
    return violation;
  }
}

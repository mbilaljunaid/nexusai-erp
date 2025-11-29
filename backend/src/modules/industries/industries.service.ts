import { Injectable } from '@nestjs/common';

export interface IndustryConfig {
  id: string;
  name: string;
  description: string;
  modules: string[];
  aiCapabilities: string[];
  regulations: string[];
  keyMetrics: string[];
  regions: string[];
}

@Injectable()
export class IndustriesService {
  private industries: Map<string, IndustryConfig> = new Map([
    ['manufacturing', {
      id: 'manufacturing',
      name: 'Manufacturing (Discrete & Process)',
      description: 'AI maps production lines, BOMs, maintenance schedules, quality checks, demand forecasting',
      modules: ['Manufacturing Orders', 'Production Planning', 'Inventory', 'Quality Control', 'Maintenance', 'Procurement', 'EHS Compliance'],
      aiCapabilities: ['Demand Forecasting', 'Quality Prediction', 'Maintenance Optimization', 'Production Scheduling', 'Vendor Integration'],
      regulations: ['ISO9001', 'ISO14001', 'OSHA', 'FDA', 'RoHS'],
      keyMetrics: ['OEE', 'First Pass Yield', 'Inventory Turnover', 'Lead Time', 'Defect Rate'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
    ['retail', {
      id: 'retail',
      name: 'Retail & E-Commerce',
      description: 'AI predicts sales trends, manages inventory, optimizes pricing, personalizes customer experiences',
      modules: ['POS', 'Inventory Management', 'Omni-channel Sales', 'Loyalty Programs', 'Marketing Automation'],
      aiCapabilities: ['Sales Forecasting', 'Dynamic Pricing', 'Inventory Optimization', 'Customer Segmentation', 'Recommendation Engine'],
      regulations: ['PCI-DSS', 'GDPR', 'CCPA'],
      keyMetrics: ['Sales Growth', 'Inventory Turnover', 'Customer Lifetime Value', 'Conversion Rate', 'Average Order Value'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
    ['finance', {
      id: 'finance',
      name: 'Financial Services',
      description: 'AI performs risk analysis, regulatory compliance checks, fraud detection, portfolio optimization',
      modules: ['Accounting', 'Loans/Credit Management', 'Investment Portfolio', 'Risk & Compliance', 'Customer Onboarding'],
      aiCapabilities: ['Risk Scoring', 'Fraud Detection', 'Portfolio Optimization', 'Credit Scoring', 'Compliance Monitoring'],
      regulations: ['SOX', 'Basel III', 'Dodd-Frank', 'MiFID II', 'GDPR'],
      keyMetrics: ['Risk-Adjusted Return', 'Fraud Detection Rate', 'Compliance Score', 'Customer Acquisition Cost', 'Loan Default Rate'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
    ['healthcare', {
      id: 'healthcare',
      name: 'Healthcare & Life Sciences',
      description: 'AI supports patient workflows, clinical data management, regulatory compliance, resource allocation',
      modules: ['Patient Management', 'HR', 'Inventory (Pharma)', 'Billing', 'Laboratory Management', 'Regulatory Reporting'],
      aiCapabilities: ['Patient Risk Prediction', 'Clinical Decision Support', 'Inventory Optimization', 'Billing Automation', 'Compliance Monitoring'],
      regulations: ['HIPAA', 'FDA', 'GDPR', 'SOX', 'HITECH'],
      keyMetrics: ['Patient Satisfaction', 'Clinical Outcome', 'Billing Accuracy', 'Compliance Score', 'Resource Utilization'],
      regions: ['North America', 'Europe'],
    }],
    ['construction', {
      id: 'construction',
      name: 'Construction & Real Estate',
      description: 'AI generates project plans, cost estimates, milestone tracking, resource allocation, risk scoring',
      modules: ['Project Management', 'Budgeting', 'Procurement', 'HR', 'Compliance', 'Lease/Property Management'],
      aiCapabilities: ['Project Scheduling', 'Cost Estimation', 'Risk Prediction', 'Resource Optimization', 'Bid Optimization'],
      regulations: ['OSHA', 'LEED', 'Building Codes', 'Environmental Laws'],
      keyMetrics: ['Project Completion Rate', 'Budget Variance', 'Safety Incidents', 'Labor Productivity', 'Cost per Unit'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
  ]);

  getAll(): IndustryConfig[] {
    return Array.from(this.industries.values());
  }

  getById(id: string): IndustryConfig | undefined {
    return this.industries.get(id);
  }

  getByName(name: string): IndustryConfig | undefined {
    for (const industry of this.industries.values()) {
      if (industry.name.toLowerCase().includes(name.toLowerCase())) {
        return industry;
      }
    }
    return undefined;
  }

  getModules(industryId: string): string[] {
    const industry = this.industries.get(industryId);
    return industry?.modules || [];
  }

  getCapabilities(industryId: string): string[] {
    const industry = this.industries.get(industryId);
    return industry?.aiCapabilities || [];
  }
}

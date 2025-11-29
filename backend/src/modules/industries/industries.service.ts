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
    ['wholesale', {
      id: 'wholesale',
      name: 'Wholesale & Distribution',
      description: 'AI forecasts demand, optimizes warehousing, manages logistics, automates replenishment',
      modules: ['Inventory', 'Order Management', 'Shipping & Logistics', 'Procurement', 'Vendor Management', 'Warehouse Management'],
      aiCapabilities: ['Demand Forecasting', 'Warehouse Optimization', 'Logistics Route Optimization', 'Replenishment Automation', 'Vendor Performance'],
      regulations: ['HAZMAT', 'FIFO', 'DOT', 'GDPR'],
      keyMetrics: ['Order Fill Rate', 'Inventory Accuracy', 'On-Time Delivery', 'Warehouse Utilization', 'Cost per Unit Shipped'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
    ['telecom', {
      id: 'telecom',
      name: 'Telecommunications',
      description: 'AI predicts network load, optimizes service delivery, automates ticketing and field operations',
      modules: ['Network Management', 'Billing', 'Customer Support', 'Service Requests', 'Inventory', 'Sales & Marketing'],
      aiCapabilities: ['Network Load Prediction', 'Service Quality Optimization', 'Churn Prediction', 'Auto-Triage', 'Resource Allocation'],
      regulations: ['FCC', 'GDPR', 'Net Neutrality', 'Accessibility'],
      keyMetrics: ['Network Uptime', 'Customer Churn', 'Average Resolution Time', 'Customer Satisfaction', 'Revenue per User'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
    ['energy', {
      id: 'energy',
      name: 'Energy & Utilities',
      description: 'AI forecasts demand, manages distribution, optimizes resource utilization',
      modules: ['Asset Management', 'Energy Production Planning', 'Metering & Billing', 'Project Management', 'Compliance', 'Demand Response'],
      aiCapabilities: ['Demand Forecasting', 'Grid Optimization', 'Equipment Failure Prediction', 'Energy Efficiency', 'Carbon Tracking'],
      regulations: ['EPA', 'FERC', 'ISO/RTO', 'Carbon Credits', 'GDPR'],
      keyMetrics: ['Power Factor', 'System Loss', 'Peak Demand', 'Reliability Index', 'Emissions'],
      regions: ['North America', 'Europe'],
    }],
    ['hospitality', {
      id: 'hospitality',
      name: 'Hospitality & Travel',
      description: 'AI predicts occupancy, optimizes bookings, personalizes guest experience, resource allocation',
      modules: ['Reservations', 'Property Management', 'Payroll', 'Inventory', 'Marketing', 'CRM', 'Loyalty Programs'],
      aiCapabilities: ['Occupancy Prediction', 'Dynamic Pricing', 'Guest Personalization', 'Revenue Optimization', 'Churn Prediction'],
      regulations: ['GDPR', 'PCI-DSS', 'Data Privacy', 'Accessibility'],
      keyMetrics: ['Occupancy Rate', 'Average Daily Rate', 'Revenue per Available Room', 'Guest Satisfaction', 'Booking Conversion'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
    ['professional', {
      id: 'professional',
      name: 'Professional Services',
      description: 'AI tracks projects, automates billing, resource allocation, knowledge management',
      modules: ['Project Management', 'HR', 'Time Tracking', 'Billing & Invoicing', 'CRM', 'Marketing & Client Management', 'Knowledge Base'],
      aiCapabilities: ['Project Risk Prediction', 'Resource Optimization', 'Billing Automation', 'Lead Scoring', 'Knowledge Search'],
      regulations: ['GDPR', 'SOX', 'Professional Standards'],
      keyMetrics: ['Project Profitability', 'Utilization Rate', 'Billing Accuracy', 'Client Retention', 'Win Rate'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
    ['government', {
      id: 'government',
      name: 'Public Sector / Government',
      description: 'AI manages citizen services, budget allocation, compliance, and reporting',
      modules: ['Finance', 'HR', 'Projects', 'Compliance', 'Citizen Request Management', 'Analytics & Reporting', 'Records Management'],
      aiCapabilities: ['Budget Optimization', 'Citizen Service Optimization', 'Compliance Monitoring', 'Risk Scoring', 'Data Analytics'],
      regulations: ['FOIA', 'ADA', 'GDPR', 'Accessibility', 'Open Government'],
      keyMetrics: ['Citizen Satisfaction', 'Service Response Time', 'Budget Execution', 'Compliance Score', 'Transparency Index'],
      regions: ['North America', 'Europe'],
    }],
    ['technology', {
      id: 'technology',
      name: 'Technology & IT Services',
      description: 'AI manages software development lifecycle, client projects, billing, resource utilization',
      modules: ['Project & Portfolio Management', 'Resource Management', 'CRM', 'Support Desk', 'Analytics', 'Knowledge Management', 'DevOps'],
      aiCapabilities: ['Project Delivery Prediction', 'Resource Optimization', 'Bug Prediction', 'Customer Support Auto-Triage', 'Capacity Planning'],
      regulations: ['SOC2', 'ISO27001', 'GDPR', 'Accessibility'],
      keyMetrics: ['On-Time Delivery', 'Defect Density', 'Customer Satisfaction', 'Resource Utilization', 'Time to Market'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
    ['media', {
      id: 'media',
      name: 'Media & Entertainment',
      description: 'AI optimizes content scheduling, audience engagement, revenue tracking, marketing campaigns',
      modules: ['Project Management', 'Marketing Automation', 'CRM', 'Content Lifecycle', 'Revenue Tracking', 'Analytics', 'Distribution'],
      aiCapabilities: ['Content Performance Prediction', 'Audience Segmentation', 'Ad Optimization', 'Revenue Forecasting', 'Recommendation Engine'],
      regulations: ['FCC', 'Copyright', 'GDPR', 'Content Standards'],
      keyMetrics: ['Audience Engagement', 'Ad Revenue', 'Content ROI', 'Market Share', 'Subscriber Growth'],
      regions: ['North America', 'Europe'],
    }],
    ['agriculture', {
      id: 'agriculture',
      name: 'Agriculture & Food Processing',
      description: 'AI manages supply chains, forecasts yield, quality checks, and inventory',
      modules: ['Farm Management', 'Production Planning', 'Inventory', 'Procurement', 'Sales & Distribution', 'Compliance', 'Supply Chain'],
      aiCapabilities: ['Yield Prediction', 'Weather Analytics', 'Supply Chain Optimization', 'Quality Prediction', 'Pest/Disease Detection'],
      regulations: ['FDA', 'USDA', 'Food Safety', 'Environmental', 'Labor Laws'],
      keyMetrics: ['Yield per Acre', 'Cost per Unit', 'Quality Grade', 'Waste Rate', 'Supply Chain Efficiency'],
      regions: ['North America', 'Europe', 'Asia'],
    }],
    ['education', {
      id: 'education',
      name: 'Education & Training',
      description: 'AI designs curriculum workflows, tracks student performance, recommends learning paths',
      modules: ['Student Management', 'Course Planning', 'Exams & Assessments', 'Payroll', 'Admissions', 'eLearning Platforms', 'Alumni Management'],
      aiCapabilities: ['Student Performance Prediction', 'Personalized Learning Paths', 'Enrollment Prediction', 'Curriculum Optimization', 'Career Matching'],
      regulations: ['FERPA', 'ADA', 'Accreditation', 'GDPR'],
      keyMetrics: ['Student Completion Rate', 'Learning Outcome Score', 'Enrollment Growth', 'Graduation Rate', 'Employment Rate'],
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

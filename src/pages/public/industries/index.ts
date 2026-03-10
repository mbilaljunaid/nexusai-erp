// Industry Pages Index
// Exports all 18 industry pages for easy route configuration

export { default as HealthcarePage } from './HealthcarePage';
export { default as ManufacturingPage } from './ManufacturingPage';
export { default as SaaSPage } from './SaaSPage';
export { default as RetailPage } from './RetailPage';
export { default as BankingPage } from './BankingPage';
export { default as EnergyPage } from './EnergyPage';
export { default as TelecomPage } from './TelecomPage';
export { default as HospitalityPage } from './HospitalityPage';
export { default as AutomotivePage } from './AutomotivePage';
export { default as InsurancePage } from './InsurancePage';
export { default as RealEstatePage } from './RealEstatePage';
export { default as GovernmentPage } from './GovernmentPage';
export { default as EducationPage } from './EducationPage';
export { default as ConstructionPage } from './ConstructionPage';
export { default as LogisticsPage } from './LogisticsPage';
export { default as EcommercePage } from './EcommercePage';
export { default as MediaPage } from './MediaPage';
export { default as FinancialServicesPage } from './FinancialServicesPage';

/**
 * Industry page registry for navigation and routing
 * All 18 industry pages are now complete
 */
export const INDUSTRY_REGISTRY = [
    { name: 'Healthcare', slug: 'healthcare', available: true },
    { name: 'Manufacturing', slug: 'manufacturing', available: true },
    { name: 'SaaS', slug: 'saas', available: true },
    { name: 'Retail', slug: 'retail', available: true },
    { name: 'Banking & Financial Services', slug: 'banking', available: true },
    { name: 'Energy & Utilities', slug: 'energy', available: true },
    { name: 'Telecommunications', slug: 'telecom', available: true },
    { name: 'Hospitality & Hotels', slug: 'hospitality', available: true },
    { name: 'Automotive', slug: 'automotive', available: true },
    { name: 'Insurance', slug: 'insurance', available: true },
    { name: 'Real Estate', slug: 'real-estate', available: true },
    { name: 'Government & Public Sector', slug: 'government', available: true },
    { name: 'Education & Higher Ed', slug: 'education', available: true },
    { name: 'Construction & Engineering', slug: 'construction', available: true },
    { name: 'Logistics & Transportation', slug: 'logistics', available: true },
    { name: 'E-commerce & Online Retail', slug: 'ecommerce', available: true },
    { name: 'Media & Entertainment', slug: 'media', available: true },
    { name: 'Financial Services & Wealth', slug: 'financial-services', available: true },
] as const;

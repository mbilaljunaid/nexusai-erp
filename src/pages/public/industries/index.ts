// Industry Pages Index
// Exports all industry pages for easy route configuration

export { default as HealthcarePage } from './HealthcarePage';
export { default as ManufacturingPage } from './ManufacturingPage';
export { default as SaaSPage } from './SaaSPage';
export { default as RetailPage } from './RetailPage';

// TODO: Create remaining 14 industry pages:
// - BankingPage
// - EnergyPage
// - GovernmentPage
// - EducationPage
// - AutomotivePage
// - InsurancePage
// - RealEstatePage
// - TelecomPage
// - ConstructionPage
// - LogisticsPage
// - EcommercePage
// - HospitalityPage
// - MediaPage
// - FinancialServicesPage

/**
 * Industry page registry for navigation and routing
 */
export const INDUSTRY_REGISTRY = [
    { name: 'Healthcare', slug: 'healthcare', available: true },
    { name: 'Manufacturing', slug: 'manufacturing', available: true },
    { name: 'SaaS', slug: 'saas', available: true },
    { name: 'Retail', slug: 'retail', available: true },
    { name: 'Banking', slug: 'banking', available: false },
    { name: 'Energy & Utilities', slug: 'energy', available: false },
    { name: 'Government', slug: 'government', available: false },
    { name: 'Education', slug: 'education', available: false },
    { name: 'Automotive', slug: 'automotive', available: false },
    { name: 'Insurance', slug: 'insurance', available: false },
    { name: 'Real Estate', slug: 'real-estate', available: false },
    { name: 'Telecom', slug: 'telecom', available: false },
    { name: 'Construction', slug: 'construction', available: false },
    { name: 'Logistics', slug: 'logistics', available: false },
    { name: 'E-commerce', slug: 'ecommerce', available: false },
    { name: 'Hospitality', slug: 'hospitality', available: false },
    { name: 'Media & Entertainment', slug: 'media', available: false },
    { name: 'Financial Services', slug: 'financial-services', available: false },
] as const;

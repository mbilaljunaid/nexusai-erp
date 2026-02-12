import React from 'react';
import { Package, TrendingDown, FileText, BarChart3, Shield, Clock } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function FixedAssetsPage() {
    return (
        <ModulePageTemplate
            name="Fixed Assets"
            slug="fixed-assets"
            category="Finance"
            tagline="Complete asset lifecycle management from acquisition to disposal"
            description="Manage the complete lifecycle of capital assets with NexusAI's Fixed Asset Management. Track acquisitions, calculate depreciation under multiple methods (GAAP, IFRS, Tax), handle transfers and retirements, and ensure audit compliance. Support for unlimited asset books, mass additions, and automated depreciation posting."

            features={[
                {
                    title: "Multi-Book Depreciation",
                    description: "Maintain separate depreciation books for GAAP, IFRS, tax, and management reporting with automated calculations and postings.",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "Lifecycle Tracking",
                    description: "Manage assets from purchase through disposal including transfers, reclassifications, impairments, and retirements.",
                    icon: <Clock className="w-6 h-6" />
                },
                {
                    title: "Barcode & RFID Integration",
                    description: "Track physical location and status with barcode scanning or RFID tags for inventory verification and audits.",
                    icon: <Package className="w-6 h-6" />
                },
                {
                    title: "Depreciation Methods",
                    description: "Support for straight-line, declining balance, MACRS, units of production, and custom depreciation calculations.",
                    icon: <TrendingDown className="w-6 h-6" />
                },
                {
                    title: "Fixed Assets Analytics",
                    description: "Real-time dashboards for asset valuation, depreciation expense, ROI analysis, and maintenance cost tracking.",
                    icon: <BarChart3 className="w-6 h-6" />
                },
                {
                    title: "Compliance & Audit",
                    description: "Complete audit trail with SOX controls, automated compliance reporting, and support for tax depreciation schedules.",
                    icon: <Shield className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "100% Asset Accuracy",
                    description: "Automated tracking eliminates spreadsheet errors and ensures financial statements reflect actual asset values."
                },
                {
                    title: "50% Faster Year-End Close",
                    description: "Automated depreciation calculations and journal entries accelerate financial close processes."
                },
                {
                    title: "Tax Optimization",
                    description: "Maximize depreciation deductions with Section 179, bonus depreciation, and optimal tax method selection."
                }
            ]}

            useCases={[
                {
                    title: "Capital-Intensive Industries",
                    description: "Manufacturing, utilities, and transportation companies with large equipment fleets and complex depreciation requirements."
                },
                {
                    title: "Real Estate & Property Management",
                    description: "Track buildings, tenant improvements, and land with separate depreciation schedules and cost segregation studies."
                },
                {
                    title: "Healthcare Systems",
                    description: "Manage medical equipment, facilities, and IT assets with maintenance tracking and replacement planning."
                }
            ]}

            integrations={[
                "General Ledger",
                "Accounts Payable",
                "Purchase Orders",
                "Maintenance Management",
                "Project Accounting",
                "Barcode Systems",
                "Tax Software"
            ]}

            industries={[
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "Real Estate", slug: "real-estate" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Energy & Utilities", slug: "energy" }
            ]}

            relatedModules={[
                { name: "General Ledger", slug: "general-ledger" },
                { name: "Accounts Payable", slug: "accounts-payable" },
                { name: "Maintenance Management", slug: "maintenance-management" }
            ]}

            pricing={{
                model: "Included",
                description: "Core module included in all NexusAI ERP packages"
            }}

            testimonials={[
                {
                    quote: "We track $500M in assets across 50 locations. NexusAI's multi-book depreciation and barcode tracking gave us 100% audit accuracy for the first time.",
                    author: "Robert Martinez",
                    company: "Regional Utility Company",
                    role: "Fixed Assets Manager"
                }
            ]}
        />
    );
}

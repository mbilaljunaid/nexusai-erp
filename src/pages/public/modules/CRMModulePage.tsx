import React from 'react';
import { Target, Users, TrendingUp, User, FileText, ShoppingCart, Globe, Phone } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function CRMModulePage() {
    return (
        <ModulePageTemplate
            name="CRM & Sales"
            slug="crm"
            category="Core ERP"
            tagline="Complete sales and customer management with AI insights and omni-channel engagement"
            description="NexusAI CRM powers your entire sales process from lead capture to order fulfillment. AI-driven lead scoring, opportunity management, 360° customer view, quote-to-cash automation, and self-service customer portals. Built for B2B sales teams with complex products, long sales cycles, and multi-stakeholder buying processes. Increase win rates by 35% and accelerate sales cycles by 40%."

            features={[
                {
                    title: "Sales CRM",
                    description: "Complete customer relationship management with 360° customer view, interaction history, and AI sales intelligence. Activity tracking, pipeline management, forecasting, and territory management with mobile CRM access.",
                    icon: <Target className="w-6 h-6" />
                },
                {
                    title: "Lead Management",
                    description: "Multi-channel lead capture (web forms, email, events, chat, ads) with AI lead scoring and automated nurture campaigns. Lead routing, qualification workflows, and conversion tracking to opportunities.",
                    icon: <Users className="w-6 h-6" />
                },
                {
                    title: "Opportunity Management",
                    description: "Visual pipeline with drag-and-drop stage progression, AI close probability prediction, and deal coaching. Competitive tracking, proposal management, and quote integration for streamlined deal closure.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "Account Management",
                    description: "Strategic account planning with health scoring, relationship mapping, and org charts. Up-sell/cross-sell recommendations, renewal tracking, and executive sponsor identification for enterprise accounts.",
                    icon: <User className="w-6 h-6" />
                },
                {
                    title: "Contact Management",
                    description: "Comprehensive contact database with roles, titles, influence levels, and social intelligence. LinkedIn enrichment, email/call/meeting tracking, and engagement scoring for personalized outreach.",
                    icon: <Phone className="w-6 h-6" />
                },
                {
                    title: "Quote Management (CPQ)",
                    description: "Configure-Price-Quote automation with product configurator, intelligent pricing, volume discounts, and approval workflows. Professional quote documents, e-signature integration, and seamless conversion to orders.",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "Sales Orders",
                    description: "Order capture with real-time inventory availability, fulfillment tracking, and shipping integration. Multi-channel order management (direct sales, eCommerce, EDI) with customer notifications and delivery tracking.",
                    icon: <ShoppingCart className="w-6 h-6" />
                },
                {
                    title: "Customer Portal",
                    description: "Self-service portal for order tracking, invoice downloads, payment processing, support case management, and knowledge base access. White-label branding with SSO integration for enterprise customers.",
                    icon: <Globe className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "35% Higher Win Rates",
                    description: "AI insights, competitive intelligence, and deal coaching help sales reps close more deals at higher values."
                },
                {
                    title: "40% Faster Sales Cycles",
                    description: "Automated workflows, quote generation, and streamlined approvals reduce time from lead to close."
                },
                {
                    title: "50% Reduction in Manual Tasks",
                    description: "CRM automation, AI lead scoring, and self-service portals eliminate repetitive admin work for sales teams."
                },
                {
                    title: "25% Revenue Growth",
                    description: "Better pipeline visibility, forecasting accuracy, and customer insights drive consistent revenue growth."
                }
            ]}

            useCases={[
                {
                    title: "B2B Enterprise Sales",
                    description: "Complex, multi-stakeholder sales with long cycles, custom quotes, and strategic account management."
                },
                {
                    title: "Subscription & Recurring Revenue",
                    description: "SaaS companies with subscription sales, renewal management, and expansion revenue tracking."
                },
                {
                    title: "Manufacturing & Distribution",
                    description: "Quote-to-order workflows with configurableroducts, pricing matrices, and high-volume order processing."
                },
                {
                    title: "Channel & Partner Sales",
                    description: "Indirect sales through distributors, resellers, or channel partners with deal registration and co-selling."
                }
            ]}

            integrations={[
                "Marketing Automation (HubSpot, Marketo)",
                "Email (Outlook, Gmail)",
                "Calendar (Google, Office 365)",
                "LinkedIn Sales Navigator",
                "Phone Systems (RingCentral, Aircall)",
                "E-Signature (DocuSign, Adobe Sign)",
                "eCommerce Platforms",
                "Shipping Carriers (UPS, FedEx)",
                "Payment Gateways"
            ]}

            industries={[
                { name: "SaaS", slug: "saas" },
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "Technology", slug: "technology" },
                { name: "Professional Services", slug: "professional-services" },
                { name: "Financial Services", slug: "financial-services" },
                { name: "Healthcare", slug: "healthcare" }
            ]}

            relatedModules={[
                { name: "Marketing Automation", slug: "marketing" },
                { name: "Customer Support & Service", slug: "service" },
                { name: "eCommerce Integration", slug: "ecommerce" }
            ]}

            pricing={{
                model: "Per User / Month",
                description: "Core CRM included. CPQ, Customer Portal, and advanced AI features available as add-ons."
            }}

            testimonials={[
                {
                    quote: "NexusAI CRM increased our win rate from 22% to 31%. The AI close probability and competitive insights help our reps focus on the winnable deals.",
                    author: "Mark Stevens",
                    company: "Enterprise Software Vendor",
                    role: "VP Sales"
                },
                {
                    quote: "CPQ cut our quote generation time from 2 hours to 15 minutes. The product configurator ensures accurate quotes and the approval workflows prevent discount leakage.",
                    author: "Lisa Patel",
                    company: "Industrial Equipment Manufacturer",
                    role: "Sales Operations Director"
                }
            ]}
        />
    );
}

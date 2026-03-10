import {
    Heart, Store, Radio, Hotel, Landmark, Car, ShieldCheck, Building2, GraduationCap,
    Lightbulb, Film, Factory, Home, Construction, Truck, Cloud, ShoppingCart, TrendingUp, Users, Clock, Briefcase
} from "lucide-react";

export interface IndustryData {
    slug: string;
    name: string;
    icon: any;
    hero: {
        title: string;
        subtitle: string;
        gradient: string;
    };
    features: {
        title: string;
        description: string;
        icon: any;
    }[];
    stats: {
        label: string;
        value: string;
    }[];
    benefits: {
        title: string;
        description: string;
    }[];
}

export const industries: Record<string, IndustryData> = {
    healthcare: {
        slug: "healthcare",
        name: "Healthcare",
        icon: Heart,
        hero: {
            title: "Transforming Patient Care with AI-Driven ERP",
            subtitle: "Streamline hospital operations, improve patient outcomes, and ensure compliance with NexusAI for Healthcare.",
            gradient: "from-blue-500 to-cyan-400",
        },
        features: [
            { title: "Patient Management", description: "360-degree view of patient data and history.", icon: Heart },
            { title: "Clinical Compliance", description: "Automated HIPAA and GDPR compliance checks.", icon: ShieldCheck },
            { title: "Inventory Optimization", description: "Smart medical supply tracking and procurement.", icon: ShoppingCart },
        ],
        stats: [
            { label: "Patient Satisfaction", value: "98%" },
            { label: "Admin Time Saved", value: "40%" },
            { label: "Compliance Rate", value: "100%" },
        ],
        benefits: [
            { title: "Unified Data", description: "Connect clinical and administrative data in one secure platform." },
            { title: "Real-time Analytics", description: "Make life-saving decisions with instant data insights." },
        ]
    },
    retail: {
        slug: "retail",
        name: "Retail",
        icon: Store,
        hero: {
            title: "Next-Gen Retail Management",
            subtitle: "Unify online and offline channels, optimize inventory, and personalize customer experiences.",
            gradient: "from-orange-500 to-red-500",
        },
        features: [
            { title: "Omnichannel POS", description: "Seamless sales across web, mobile, and in-store.", icon: Store },
            { title: "Smart Inventory", description: "AI-predicted stock levels and automated reordering.", icon: ShoppingCart },
            { title: "Customer Loyalty", description: "Personalized rewards and engagement programs.", icon: Heart },
        ],
        stats: [
            { label: "Sales Increase", value: "25%" },
            { label: "Stockouts", value: "0%" },
            { label: "Customer Retention", value: "+30%" },
        ],
        benefits: [
            { title: "Inventory Accuracy", description: "Real-time tracking prevents overstocking and stockouts." },
            { title: "Personalized Shopping", description: "Deliver tailored offers based on purchase history." },
        ]
    },
    manufacturing: {
        slug: "manufacturing",
        name: "Manufacturing",
        icon: Factory,
        hero: {
            title: "Smart Manufacturing for Industry 4.0",
            subtitle: "Optimize production, predictive maintenance, and supply chain visibility.",
            gradient: "from-slate-700 to-slate-900",
        },
        features: [
            { title: "Production Planning", description: "Optimize schedules and resource allocation.", icon: Factory },
            { title: "Quality Control", description: "AI-driven defect detection and quality metrics.", icon: ShieldCheck },
            { title: "Supply Chain", description: "End-to-end visibility from raw materials to delivery.", icon: Truck },
        ],
        stats: [
            { label: "Efficiency Gain", value: "35%" },
            { label: "Downtime Reduced", value: "50%" },
            { label: "On-time Delivery", value: "99%" },
        ],
        benefits: [
            { title: "Predictive Maintenance", description: "Fix equipment before it breaks using IoT sensors." },
            { title: "Cost Reduction", description: "Minimize waste and optimize energy consumption." },
        ]
    },
    // Add other industries similarly...
    // For brevity in this initial creation, I'm adding placeholders for the rest which can be expanded.
    telecom: {
        slug: "telecom",
        name: "Telecom",
        icon: Radio,
        hero: {
            title: "Powering the Connected World",
            subtitle: "Manage networks, billing, and customer service with a unified platform.",
            gradient: "from-indigo-500 to-purple-500",
        },
        features: [
            { title: "Network OSS", description: "Manage network inventory and operations.", icon: Radio },
            { title: "Billing & Revenue", description: "Complex usage-based billing and revenue assurance.", icon: TrendingUp },
            { title: "Customer Care", description: "360-degree customer view and support.", icon: Heart },
        ],
        stats: [
            { label: "Churn Reduction", value: "20%" },
            { label: "Billing Accuracy", value: "99.9%" },
        ],
        benefits: [
            { title: "5G Ready", description: "Scalable architecture for next-gen networks." },
        ]
    },
    hospitality: {
        slug: "hospitality",
        name: "Hospitality",
        icon: Hotel,
        hero: {
            title: "Elevate Guest Experiences",
            subtitle: "Integrated property management, POS, and booking systems.",
            gradient: "from-yellow-500 to-amber-600",
        },
        features: [
            { title: "Property Management", description: "Manage reservations, front desk, and housekeeping.", icon: Hotel },
            { title: "Point of Sale", description: "Integrated restaurant and retail POS.", icon: Store },
            { title: "Event Management", description: "Bookings and catering for events.", icon: Film },
        ],
        stats: [
            { label: "Booking Increase", value: "15%" },
            { label: "Guest Satisfaction", value: "4.8/5" },
        ],
        benefits: [
            { title: "Seamless Check-in", description: "Mobile check-in and digital keys." },
        ]
    },
    banking: {
        slug: "banking",
        name: "Banking",
        icon: Landmark,
        hero: {
            title: "Secure & Scalable Core Banking",
            subtitle: "Modernize your financial institution with our open-source core banking platform.",
            gradient: "from-green-600 to-emerald-800"
        },
        features: [
            { title: "Core Banking", description: "Ledger, accounts, and transaction processing.", icon: Landmark },
            { title: "Fraud Detection", description: "Real-time AI fraud monitoring.", icon: ShieldCheck },
            { title: "Digital Banking", description: "Web and mobile apps for customers.", icon: Cloud }
        ],
        stats: [
            { label: "Transaction Speed", value: "<100ms" },
            { label: "Cost Savings", value: "60%" }
        ],
        benefits: [
            { title: "Open Banking", description: "API-first architecture for easy integrations." }
        ]
    },
    automotive: {
        slug: "automotive",
        name: "Automotive",
        icon: Car,
        hero: {
            title: "Drive Innovation in Automotive",
            subtitle: "From manufacturing floor to dealership showroom, manage the entire lifecycle.",
            gradient: "from-stone-500 to-stone-800"
        },
        features: [
            { title: "Manufacturing", description: "Lean production and assembly line management.", icon: Factory },
            { title: "Dealer Management", description: "Inventory, sales, and service for dealerships.", icon: Store },
            { title: "Supply Chain", description: "Just-in-time parts delivery.", icon: Truck }
        ],
        stats: [
            { label: "Production Up", value: "20%" },
            { label: "Inventory Turn", value: "15x" }
        ],
        benefits: [
            { title: "Connected Car", description: "Integrate with vehicle telemetry data." }
        ]
    },
    insurance: {
        slug: "insurance",
        name: "Insurance",
        icon: ShieldCheck,
        hero: {
            title: "Modernize Insurance Operations",
            subtitle: "Streamline underwriting, claims, and policy management.",
            gradient: "from-blue-700 to-indigo-900"
        },
        features: [
            { title: "Policy Admin", description: "End-to-end policy lifecycle management.", icon: ShieldCheck },
            { title: "Claims Processing", description: "Automated claims workflow and settlement.", icon: TrendingUp },
            { title: "Underwriting", description: "AI-assisted risk assessment.", icon: Lightbulb }
        ],
        stats: [
            { label: "Claims Speed", value: "2x Faster" },
            { label: "Loss Ratio", value: "-5%" }
        ],
        benefits: [
            { title: "Digital First", description: "Self-service portals for agents and customers." }
        ]
    },
    government: {
        slug: "government",
        name: "Government",
        icon: Building2,
        hero: {
            title: "Digital Government for the People",
            subtitle: "Efficient, transparent, and secure public sector management.",
            gradient: "from-slate-600 to-slate-800"
        },
        features: [
            { title: "Citizen Services", description: "Digital portals for public services.", icon: Building2 },
            { title: "Budgeting", description: "Public finance and fund accounting.", icon: Landmark },
            { title: "Procurement", description: "Transparent tendering and purchasing.", icon: ShoppingCart }
        ],
        stats: [
            { label: "Citizen Trust", value: "+40%" },
            { label: "Process Time", value: "-60%" }
        ],
        benefits: [
            { title: "Transparency", description: "Open data and audit trails built-in." }
        ]
    },
    "public-sector": {
        slug: "public-sector",
        name: "Public Sector",
        icon: Building2,
        hero: {
            title: "Digital Public Sector",
            subtitle: "Efficient, transparent, and secure public sector management.",
            gradient: "from-slate-600 to-slate-800"
        },
        features: [
            { title: "Citizen Services", description: "Digital portals for public services.", icon: Building2 },
            { title: "Budgeting", description: "Public finance and fund accounting.", icon: Landmark },
            { title: "Procurement", description: "Transparent tendering and purchasing.", icon: ShoppingCart }
        ],
        stats: [
            { label: "Citizen Trust", value: "+40%" },
            { label: "Process Time", value: "-60%" }
        ],
        benefits: [
            { title: "Transparency", description: "Open data and audit trails built-in." }
        ]
    },
    "engineering": {
        slug: "engineering",
        name: "Engineering & Construction",
        icon: Construction,
        hero: {
            title: "Engineering Excellence",
            subtitle: "Manage complex engineering projects with precision.",
            gradient: "from-orange-600 to-red-700"
        },
        features: [
            { title: "Project Management", description: "End-to-end project tracking.", icon: Construction },
            { title: "Resource Allocation", description: "Optimize talent and equipment.", icon: TrendingUp },
            { title: "Cost Control", description: "Real-time budget tracking.", icon: ShoppingCart }
        ],
        stats: [
            { label: "Margin Improvement", value: "15%" },
            { label: "On-time Delivery", value: "95%" }
        ],
        benefits: [
            { title: "Integrated Data", description: "Unified view of all active projects." }
        ]
    },
    "professional-services": {
        slug: "professional-services",
        name: "Professional Services",
        icon: Briefcase,
        hero: {
            title: "Empowering Professional Services",
            subtitle: "Maximize billable hours and resource utilization.",
            gradient: "from-blue-600 to-indigo-700"
        },
        features: [
            { title: "Resource Management", description: "Match skills to projects.", icon: Users },
            { title: "Time & Expense", description: "Easy tracking and invoicing.", icon: Clock },
            { title: "Project Accounting", description: "Detailed profitability analysis.", icon: Landmark }
        ],
        stats: [
            { label: "Utilization Rate", value: "+20%" },
            { label: "Billing Accuracy", value: "99.9%" }
        ],
        benefits: [
            { title: "Real-time Insights", description: "Monitor project health instantly." }
        ]
    },
    "aerospace": {
        slug: "aerospace",
        name: "Aerospace & Defense",
        icon: ShieldCheck,
        hero: {
            title: "Mission Critical Solutions",
            subtitle: "Secure and compliant operations for A&D.",
            gradient: "from-slate-700 to-slate-900"
        },
        features: [
            { title: "Compliance", description: "ITAR and strict regulatory adherence.", icon: ShieldCheck },
            { title: "Supply Chain", description: "Traceability of every component.", icon: Truck },
            { title: "Program Management", description: "Complex lifecycle management.", icon: Cloud }
        ],
        stats: [
            { label: "Compliance Rate", value: "100%" },
            { label: "Supply Chain Visibility", value: "Full" }
        ],
        benefits: [
            { title: "Security First", description: "Highest levels of data security." }
        ]
    },
    education: {
        slug: "education",
        name: "Education",
        icon: GraduationCap,
        hero: {
            title: "Empowering Educational Institutions",
            subtitle: "Manage students, faculty, and administration in one unified system.",
            gradient: "from-yellow-400 to-orange-500"
        },
        features: [
            { title: "Student Information", description: "Enrollment, grades, and attendance.", icon: GraduationCap },
            { title: "Learning Management", description: "Course delivery and online learning.", icon: Lightbulb },
            { title: "Campus Operations", description: "Facility management and scheduling.", icon: Building2 }
        ],
        stats: [
            { label: "Student Success", value: "+15%" },
            { label: "Admin Savings", value: "30%" }
        ],
        benefits: [
            { title: "Connected Campus", description: "Integrate SIS, LMS, and ERP." }
        ]
    },
    energy: {
        slug: "energy",
        name: "Energy & Utilities",
        icon: Lightbulb,
        hero: {
            title: "Powering the Future of Energy",
            subtitle: "Manage grid operations, assets, and customer billing.",
            gradient: "from-yellow-300 to-yellow-600"
        },
        features: [
            { title: "Grid Operations", description: "Real-time monitoring and asset management.", icon: Lightbulb },
            { title: "Utility Billing", description: "Smart metering and flexible billing.", icon: TrendingUp },
            { title: "Sustainability", description: "Track carbon footprint and renewables.", icon: Heart }
        ],
        stats: [
            { label: "Reliability", value: "99.99%" },
            { label: "OpEx Reduction", value: "20%" }
        ],
        benefits: [
            { title: "Smart Grid", description: "Ready for IoT and distributed energy resources." }
        ]
    },
    media: {
        slug: "media",
        name: "Media & Entertainment",
        icon: Film,
        hero: {
            title: "Streamline Media Production",
            subtitle: "Manage projects, assets, and royalties efficiently.",
            gradient: "from-pink-500 to-rose-600"
        },
        features: [
            { title: "Project Management", description: "Track production schedules and budgets.", icon: Film },
            { title: "Digital Assets", description: "Centralized DAM for all media files.", icon: Cloud },
            { title: "Rights & Royalties", description: "Complex rights management and payouts.", icon: Landmark }
        ],
        stats: [
            { label: "Production Speed", value: "+25%" },
            { label: "Revenue Leakage", value: "0%" }
        ],
        benefits: [
            { title: "Collaboration", description: "Connect creative teams globally." }
        ]
    },
    "real-estate": {
        slug: "real-estate",
        name: "Real Estate",
        icon: Home,
        hero: {
            title: "Property Management Simplified",
            subtitle: "Manage leases, maintenance, and tenants across your portfolio.",
            gradient: "from-emerald-500 to-teal-700"
        },
        features: [
            { title: "Lease Management", description: "Automate renewals and rent collection.", icon: Home },
            { title: "Maintenance", description: "Work order tracking and vendor management.", icon: Construction },
            { title: "Tenant Portal", description: "Self-service payments and requests.", icon: ShieldCheck }
        ],
        stats: [
            { label: "Occupancy Rate", value: "98%" },
            { label: "Late Payments", value: "-40%" }
        ],
        benefits: [
            { title: "Portfolio View", description: "Real-time insights across all properties." }
        ]
    },
    construction: {
        slug: "construction",
        name: "Construction",
        icon: Construction,
        hero: {
            title: "Build Better with NexusAI",
            subtitle: "Project management, job costing, and field operations for construction.",
            gradient: "from-orange-600 to-red-700"
        },
        features: [
            { title: "Project Management", description: "RFI, submittals, and daily logs.", icon: Construction },
            { title: "Job Costing", description: "Real-time budget vs actual tracking.", icon: TrendingUp },
            { title: "Equipment", description: "Track fleet location and usage.", icon: Truck }
        ],
        stats: [
            { label: "Projects On-time", value: "90%" },
            { label: "Budget Variance", value: "<5%" }
        ],
        benefits: [
            { title: "Field Mobile", description: "Access plans and capture data from the jobsite." }
        ]
    },
    logistics: {
        slug: "logistics",
        name: "Logistics",
        icon: Truck,
        hero: {
            title: "Optimize Your Supply Chain",
            subtitle: "Fleet management, warehousing, and transportation management.",
            gradient: "from-blue-600 to-blue-800"
        },
        features: [
            { title: "Fleet Management", description: "Route optimization and tracking.", icon: Truck },
            { title: "Warehouse", description: "WMS for inventory and fulfillment.", icon: Factory },
            { title: "Freight Audit", description: "Automated invoice auditing.", icon: ShieldCheck }
        ],
        stats: [
            { label: "Delivery Speed", value: "+20%" },
            { label: "Fuel Savings", value: "15%" }
        ],
        benefits: [
            { title: "Visibility", description: "Real-time tracking of every shipment." }
        ]
    },
    saas: {
        slug: "saas",
        name: "SaaS",
        icon: Cloud,
        hero: {
            title: "Scale Your SaaS Business",
            subtitle: "Subscription billing, revenue recognition, and customer success.",
            gradient: "from-indigo-600 to-violet-700"
        },
        features: [
            { title: "Subscription Billing", description: "Automate recurring payments.", icon: TrendingUp },
            { title: "Rev Rec", description: "ASC 606 automated compliance.", icon: ShieldCheck },
            { title: "Metrics", description: "Real-time MRR, ARR, and Churn tracking.", icon: Lightbulb }
        ],
        stats: [
            { label: "Billing Time", value: "-90%" },
            { label: "Churn Rate", value: "-10%" }
        ],
        benefits: [
            { title: "Growth Ready", description: "Handle complex pricing models easily." }
        ]
    },
    ecommerce: {
        slug: "ecommerce",
        name: "E-Commerce",
        icon: ShoppingCart,
        hero: {
            title: "Unified E-Commerce ERP",
            subtitle: "Connect your storefront, inventory, and accounting.",
            gradient: "from-rose-500 to-pink-600"
        },
        features: [
            { title: "Multi-Channel", description: "Sync inventory across Amazon, Shopify, etc.", icon: Store },
            { title: "Order Management", description: "Centralized order processing.", icon: ShoppingCart },
            { title: "CRM", description: "Customer segmentation and marketing.", icon: Heart }
        ],
        stats: [
            { label: "Order Accuracy", value: "99.9%" },
            { label: "Stockouts", value: "0%" }
        ],
        benefits: [
            { title: "Real-time Sync", description: "Never oversell with instant inventory updates." }
        ]
    },
    "financial-services": {
        slug: "financial-services",
        name: "Financial Services",
        icon: TrendingUp,
        hero: {
            title: "Wealth & Asset Management",
            subtitle: "Secure, compliant, and efficient financial operations.",
            gradient: "from-emerald-600 to-green-700"
        },
        features: [
            { title: "Portfolio Mgmt", description: "Track asset performance.", icon: TrendingUp },
            { title: "Compliance", description: "KYC/AML and regulatory reporting.", icon: ShieldCheck },
            { title: "Client Portal", description: "Secure access for investors.", icon: ShieldCheck }
        ],
        stats: [
            { label: "AUM Growth", value: "+20%" },
            { label: "Risk Reduction", value: "High" }
        ],
        benefits: [
            { title: "Security", description: "Bank-grade security standards." }
        ]
    }
};

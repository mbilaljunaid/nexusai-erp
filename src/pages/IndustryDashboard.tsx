import { useRoute } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Heart,
    Wifi,
    Hotel,
    ShoppingBag,
    Boxes,
    Car,
    Landmark,
    Shield,
    GraduationCap,
    Flame,
    ArrowLeft,
    Check,
    FileText,
    BookOpen,
} from "lucide-react";
import { Link } from "wouter";

interface Module {
    name: string;
    description: string;
    status: "enabled" | "recommended" | "available";
}

interface Template {
    name: string;
    description: string;
    itemCount: number;
}

interface Resource {
    title: string;
    type: "guide" | "tutorial" | "documentation";
    url: string;
}

interface IndustryData {
    code: string;
    name: string;
    icon: any;
    tagline: string;
    overview: string;
    keyBenefits: string[];
    modules: Module[];
    templates: Template[];
    resources: Resource[];
}

const INDUSTRY_DATA: Record<string, IndustryData> = {
    healthcare: {
        code: "healthcare",
        name: "Healthcare",
        icon: Heart,
        tagline: "Complete Patient & Clinical Management Solution",
        overview:
            "Streamline healthcare operations with integrated patient management, scheduling, clinical documentation, pharmacy, and medical billing. Built with HIPAA compliance and healthcare workflows in mind.",
        keyBenefits: [
            "HIPAA-compliant data management",
            "Integrated clinical workflows",
            "Automated medical billing",
            "Patient portal & engagement",
            "Clinical decision support",
            "Pharmacy integration",
        ],
        modules: [
            { name: "Core HR", description: "Employee & staff management", status: "enabled" },
            { name: "Payroll", description: "Healthcare payroll processing", status: "enabled" },
            { name: "Scheduling", description: "Patient appointments & staff scheduling", status: "recommended" },
            { name: "Compliance", description: "HIPAA & regulatory compliance", status: "recommended" },
            { name: "Billing", description: "Medical billing & insurance claims", status: "recommended" },
            { name: "Clinical Docs", description: "EHR & clinical documentation", status: "recommended" },
            { name: "Pharmacy", description: "Prescription management", status: "recommended" },
            { name: "Inventory", description: "Medical supplies & equipment", status: "available" },
        ],
        templates: [
            { name: "Appointment Types", description: "Consultation, Follow-up, Procedure, Telehealth", itemCount: 12 },
            { name: "Clinical Forms", description: "Patient intake, consent, medical history", itemCount: 24 },
            { name: "ICD-10 Codes", description: "Common diagnosis codes", itemCount: 150 },
            { name: "CPT Codes", description: "Procedural billing codes", itemCount: 200 },
            { name: "Chart of Accounts", description: "Healthcare-specific GL accounts", itemCount: 45 },
        ],
        resources: [
            { title: "HIPAA Compliance Guide", type: "guide", url: "/docs/healthcare/hipaa" },
            { title: "EHR Setup Tutorial", type: "tutorial", url: "/docs/healthcare/ehr-setup" },
            { title: "Medical Billing Best Practices", type: "documentation", url: "/docs/healthcare/billing" },
        ],
    },
    // For other industries, we'll create simplified versions
    retail: {
        code: "retail",
        name: "Retail & Commerce",
        icon: ShoppingBag,
        tagline: "Omnichannel Retail Management Solution",
        overview:
            "Manage your retail operations end-to-end with POS, inventory, e-commerce, and customer management. Perfect for single stores or multi-location chains.",
        keyBenefits: [
            "Unified omnichannel experience",
            "Real-time inventory sync",
            "Integrated POS system",
            "E-commerce platform",
            "Customer loyalty programs",
            "Multi-location support",
        ],
        modules: [
            { name: "Inventory", description: "Stock & warehouse management", status: "enabled" },
            { name: "POS", description: "Point of sale system", status: "enabled" },
            { name: "CRM", description: "Customer relationship management", status: "recommended" },
            { name: "SCM", description: "Supply chain management", status: "recommended" },
            { name: "E-Commerce", description: "Online store platform", status: "recommended" },
            { name: "Analytics", description: "Sales & performance analytics", status: "recommended" },
        ],
        templates: [
            { name: "Product Categories", description: "Apparel, Electronics, Home & Garden", itemCount: 30 },
            { name: "Tax Rates", description: "Sales tax by region", itemCount: 50 },
            { name: "Payment Methods", description: "Cash, Card, Digital wallets", itemCount: 12 },
            { name: "Pricing Rules", description: "Discounts, promotions, bundles", itemCount: 25 },
        ],
        resources: [
            { title: "POS Setup Guide", type: "guide", url: "/docs/retail/pos" },
            { title: "Inventory Management", type: "documentation", url: "/docs/retail/inventory" },
        ],
    },
    // Add basic data for remaining industries
    telecom: {
        code: "telecom",
        name: "Telecommunications",
        icon: Wifi,
        tagline: "Network Operations & Billing Solution",
        overview: "Manage network infrastructure, customer billing, and service provisioning for telecom operators.",
        keyBenefits: ["Network OSS integration", "Usage-based billing", "SLA monitoring", "Device management"],
        modules: [
            { name: "Network OSS", description: "Network operations support", status: "enabled" },
            { name: "Billing", description: "Subscription & usage billing", status: "enabled" },
            { name: "CRM", description: "Customer management", status: "recommended" },
        ],
        templates: [
            { name: "Service Plans", description: "Mobile, Broadband, Enterprise", itemCount: 15 },
            { name: "Billing Cycles", description: "Monthly, Prepaid, Postpaid", itemCount: 10 },
        ],
        resources: [{ title: "Billing Setup", type: "guide", url: "/docs/telecom/billing" }],
    },
};

// Add minimal data for missing industries
const DEFAULT_INDUSTRIES = ["hospitality", "logistics", "automotive", "banking", "insurance", "government", "education", "energy"];

DEFAULT_INDUSTRIES.forEach((code) => {
    if (!INDUSTRY_DATA[code]) {
        INDUSTRY_DATA[code] = {
            code,
            name: code.charAt(0).toUpperCase() + code.slice(1),
            icon: Landmark,
            tagline: `${code.charAt(0).toUpperCase() + code.slice(1)} Industry Solution`,
            overview: `Comprehensive solution for ${code} industry operations.`,
            keyBenefits: ["Industry-specific workflows", "Compliance tools", "Analytics & reporting"],
            modules: [
                { name: "Core System", description: "Essential modules", status: "enabled" },
                { name: "Analytics", description: "Business intelligence", status: "recommended" },
            ],
            templates: [{ name: "Standard Templates", description: "Industry configurations", itemCount: 10 }],
            resources: [{ title: "Getting Started", type: "guide", url: `/docs/${code}/overview` }],
        };
    }
});

export default function IndustryDashboard() {
    const [, params] = useRoute("/industry/:industryCode/dashboard");
    const industryCode = (params as any)?.industryCode || "";
    const industry = INDUSTRY_DATA[industryCode];

    if (!industry) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-muted-foreground">Industry not found</h1>
                    <Link to="/industries">
                        <Button className="mt-4">Back to Industries</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const Icon = industry.icon;

    return (
        <StandardPage
            title={industry.name}
            description={industry.tagline}
            actions={
                <Link to="/industries">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Industries
                    </Button>
                </Link>
            }
        >
            {/* Overview Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{industry.overview}</p>
                    <div>
                        <h3 className="font-semibold mb-2">Key Benefits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {industry.keyBenefits.map((benefit) => (
                                <div key={benefit} className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-sm">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="modules" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="modules">Modules</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                {/* Modules Tab */}
                <TabsContent value="modules" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {industry.modules.map((module) => (
                            <Card key={module.name}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{module.name}</CardTitle>
                                        <Badge
                                            variant={module.status === "enabled" ? "default" : module.status === "recommended" ? "secondary" : "outline"}
                                        >
                                            {module.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{module.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-4">
                    <div className="space-y-3">
                        {industry.templates.map((template) => (
                            <Card key={template.name}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-primary" />
                                            <CardTitle className="text-base">{template.name}</CardTitle>
                                        </div>
                                        <Badge variant="outline">{template.itemCount} items</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{template.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-4">
                    <div className="space-y-3">
                        {industry.resources.map((resource) => (
                            <Card key={resource.title} className="hover:bg-accent cursor-pointer transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                            <CardTitle className="text-base">{resource.title}</CardTitle>
                                        </div>
                                        <Badge variant="outline">{resource.type}</Badge>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* CTA */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <h3 className="font-semibold text-lg">Ready to get started?</h3>
                        <p className="text-sm text-muted-foreground">Set up your {industry.name} workspace with recommended modules</p>
                    </div>
                    <Button size="lg">Get Started</Button>
                </CardContent>
            </Card>
        </StandardPage>
    );
}


import { ModuleNavigationGrid } from "@/components/nav/ModuleNavigationGrid";
import { StandardPage } from "@/components/layout/StandardPage";
import {
    FileText,
    DollarSign,
    Wrench,
    BarChart3,
    Settings,
    Truck,
    Map
} from "lucide-react";

const constructionMenu = [
    {
        label: "Project Controls",
        items: [
            { title: "Contracts", url: "/construction/contracts", icon: FileText },
            { title: "Billing Workbench", url: "/construction/billing", icon: DollarSign },
            { title: "Cost Codes", url: "/construction/cost-codes", icon: Wrench },
        ]
    },
    {
        label: "Field Operations",
        items: [
            { title: "Site Management", url: "/construction/site-management", icon: Map },
            { title: "Resource Workbench", url: "/construction/resources", icon: Truck },
        ]
    },
    {
        label: "Executive",
        items: [
            { title: "Insights Dashboard", url: "/construction/insights", icon: BarChart3 },
            { title: "Configuration", url: "/construction/setup", icon: Settings },
        ]
    }
];

export default function ConstructionLanding() {
    return (
        <StandardPage
            title="Construction Management"
            description="Manage contracts, billing, and field operations for construction projects."
            breadcrumbs={[]}
        >
            <div className="mt-6">
                <ModuleNavigationGrid menu={constructionMenu} />
            </div>
        </StandardPage>
    );
}

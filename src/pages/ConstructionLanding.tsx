
import { useState } from "react";
import { ModuleNavigationGrid } from "@/components/nav/ModuleNavigationGrid";
import { StandardPage } from "@/components/layout/StandardPage";
import { EnterpriseContextSwitcher } from "@/components/enterprise/EnterpriseContextSwitcher";
import {
    FileText,
    DollarSign,
    Wrench,
    BarChart3,
    Settings,
    Truck,
    Map
} from "lucide-react";

const buildMenu = (buId?: string) => [
    {
        label: "Project Controls",
        items: [
            { title: "Contracts", url: `/construction/contracts${buId ? `?buId=${buId}` : ""}`, icon: FileText },
            { title: "Billing Workbench", url: `/construction/billing${buId ? `?buId=${buId}` : ""}`, icon: DollarSign },
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
    const [activeBuId, setActiveBuId] = useState<string | undefined>(undefined);

    return (
        <StandardPage
            title="Construction Management"
            description="Manage contracts, billing, and field operations for construction projects."
            breadcrumbs={[]}
        >
            <div className="flex justify-end mb-4">
                <EnterpriseContextSwitcher
                    type="business-unit"
                    value={activeBuId}
                    onChange={setActiveBuId}
                />
            </div>
            <ModuleNavigationGrid menu={buildMenu(activeBuId)} />
        </StandardPage>
    );
}

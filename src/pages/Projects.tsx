import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { StandardPage } from "@/components/layout/StandardPage";
import { ModuleNavigationGrid } from "@/components/nav/ModuleNavigationGrid";
import {
  BarChart3,
  Briefcase,
  CheckSquare,
  DollarSign,
  Settings,
  Layers,
  Calculator
} from "lucide-react";

// Lazy load components to optimize bundle size
const ProjectsDashboard = lazyWithRetry(() => import("@/pages/projects/ProjectsDashboard"));

const projectsMenu = [
  {
    label: "Portfolio",
    items: [
      { title: "Dashboard", url: "/projects", icon: BarChart3 },
      { title: "All Projects", url: "/projects/list", icon: Briefcase },
      { title: "My Tasks", url: "/projects/tasks", icon: CheckSquare },
    ]
  },
  {
    label: "Financials",
    items: [
      { title: "Costing", url: "/projects/financials", icon: DollarSign },
      { title: "Billing Rules", url: "/projects/billing-rules", icon: Calculator },
      { title: "Bill Rates", url: "/projects/bill-rates", icon: Calculator },
      { title: "Burden Schedules", url: "/projects/burden", icon: Layers },
    ]
  },
  {
    label: "Assets & Config",
    items: [
      { title: "Capital Assets", url: "/projects/assets", icon: Layers },
      { title: "Templates", url: "/projects/templates", icon: Settings },
    ]
  }
];

export default function Projects() {
  return (
    <StandardPage
      title="Project Portfolio Management"
      description="Manage projects, resources, budgets, and financial performance."
      breadcrumbs={[{ label: "Projects", href: "/projects" }]}
    >
      <div className="mt-6">
        <ModuleNavigationGrid menu={projectsMenu} />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Dashboard...</div>}>
            <ProjectsDashboard />
          </Suspense>
        </div>
      </div>
    </StandardPage>
  );
}

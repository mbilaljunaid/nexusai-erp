import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Users, DollarSign, Briefcase, GraduationCap, FileText, Settings, Database } from "lucide-react";
import { ModuleNavigationGrid } from "@/components/nav/ModuleNavigationGrid";
import HrDashboard from "@/pages/hr/HrDashboard";

const hrMenu = [
  {
    label: "Talent Core",
    items: [
      { title: "Dashboard", url: "/hr", icon: Users },
      { title: "Person Management", url: "/hr/employees", icon: Users },
      { title: "Payroll Workbench", url: "/hr/payroll", icon: DollarSign },
    ]
  },
  {
    label: "Talent Management",
    items: [
      { title: "Recruitment (ATS)", url: "/hr/recruitment", icon: Briefcase },
      { title: "Performance Goals", url: "/hr/performance", icon: FileText },
      { title: "Learning (LMS)", url: "/hr/learning", icon: GraduationCap },
    ]
  },
  {
    label: "Configuration",
    items: [
      { title: "Workforce Structures", url: "/hr/setup", icon: Settings },
      { title: "Data Exchange", url: "/hr/data-exchange", icon: Database },
    ]
  }
];

export default function HR() {
  return (
    <StandardPage
      title="Human Capital Management"
      description="Manage your workforce, payroll, talent acquisition, and development."
      breadcrumbs={[{ label: "HR", href: "/hr" }]}
    >
      <div className="space-y-6">
        <ModuleNavigationGrid menu={hrMenu} />
        <HrDashboard />
      </div>
    </StandardPage>
  );
}

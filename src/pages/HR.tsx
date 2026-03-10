import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Users, DollarSign, Briefcase, GraduationCap, FileText, Settings, Database, Clock, BarChart3, Award, Brain } from "lucide-react";
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
      { title: "Learning (LMS)", url: "/talent/learning", icon: GraduationCap },
    ]
  },
  {
    label: "Workforce Management",
    items: [
      { title: "My Time", url: "/wfm/my-time", icon: Clock },
      { title: "Team Schedule", url: "/wfm/schedule", icon: Clock },
      { title: "Manager Approvals", url: "/wfm/approvals", icon: FileText },
      { title: "Timekeeper Console", url: "/wfm/timekeeper", icon: Clock },
    ]
  },
  {
    label: "Rewards",
    items: [
      { title: "Compensation", url: "/rewards/compensation", icon: Award },
      { title: "Payroll Dashboard", url: "/rewards/payroll", icon: DollarSign },
    ]
  },
  {
    label: "Insights & AI",
    items: [
      { title: "HR Analytics", url: "/hr/analytics", icon: BarChart3 },
      { title: "HR Copilot", url: "/ai", icon: Brain },
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

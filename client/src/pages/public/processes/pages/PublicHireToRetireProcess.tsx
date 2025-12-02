import { PublicProcessTemplate } from "./PublicProcessTemplate";

export default function PublicHireToRetireProcess() {
  const steps = [
    { name: "Job Requisition", description: "HR creates job opening with budget allocation", glAccounts: ["GL-6100"] },
    { name: "Recruitment", description: "Source, screen, and interview candidates", glAccounts: ["GL-6200"] },
    { name: "Hire & Onboard", description: "Offer acceptance and employee setup", glAccounts: ["GL-6300"] },
    { name: "Employment", description: "Active employment with benefits and compensation", glAccounts: ["GL-6400"] },
    { name: "Performance & Development", description: "Annual reviews and skill development", glAccounts: ["GL-6500"] },
    { name: "Termination", description: "Exit process and final settlement", glAccounts: ["GL-6600", "GL-1000"] },
  ];

  const kpis = [
    { metric: "Time-to-Fill", target: "45 days", current: "42 days" },
    { metric: "Employee Retention", target: "85%", current: "87%" },
    { metric: "Payroll Accuracy", target: "99.8%", current: "99.9%" },
  ];

  return <PublicProcessTemplate title="Hire-to-Retire" description="Complete HR lifecycle from recruitment to exit" steps={steps} kpis={kpis} />;
}

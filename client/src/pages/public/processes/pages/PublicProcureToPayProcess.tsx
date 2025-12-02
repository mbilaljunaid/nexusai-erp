import { PublicProcessTemplate } from "./PublicProcessTemplate";

export default function PublicProcureToPayProcess() {
  const steps = [
    { name: "Purchase Requisition", description: "Requisitioner submits PR with business justification", glAccounts: ["GL-5010"] },
    { name: "Purchase Order", description: "Procurement team creates and sends PO to vendor", glAccounts: ["GL-5020"] },
    { name: "Goods Receipt", description: "Receiving department inspects and records goods", glAccounts: ["GL-1200", "GL-5030"] },
    { name: "Invoice Matching", description: "Finance verifies 3-way match (PO, receipt, invoice)", glAccounts: ["GL-2100"] },
    { name: "Approval & Payment", description: "Approval workflow and payment processing", glAccounts: ["GL-1000"] },
  ];

  const kpis = [
    { metric: "Cycle Time", target: "5 days", current: "4.2 days" },
    { metric: "Invoice Accuracy", target: "99%", current: "98.8%" },
    { metric: "On-Time Payment", target: "95%", current: "96.5%" },
  ];

  return <PublicProcessTemplate title="Procure-to-Pay" description="Complete procurement cycle from requisition to payment" steps={steps} kpis={kpis} />;
}

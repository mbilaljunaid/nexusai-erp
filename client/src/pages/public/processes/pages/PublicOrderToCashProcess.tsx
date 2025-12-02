import { PublicProcessTemplate } from "./PublicProcessTemplate";

export default function PublicOrderToCashProcess() {
  const steps = [
    { name: "Lead Creation", description: "Sales captures new prospect information", glAccounts: ["GL-4000"] },
    { name: "Opportunity", description: "Sales qualifies and estimates opportunity value", glAccounts: ["GL-4100"] },
    { name: "Quote Generation", description: "Create and send quote to customer", glAccounts: ["GL-4200"] },
    { name: "Sales Order", description: "Customer approves and order is booked", glAccounts: ["GL-4300"] },
    { name: "Shipment & Invoice", description: "Goods shipped and invoice generated", glAccounts: ["GL-1100", "GL-4400"] },
    { name: "Payment Collection", description: "Payment received and reconciled", glAccounts: ["GL-1000"] },
  ];

  const kpis = [
    { metric: "Sales Cycle", target: "30 days", current: "28 days" },
    { metric: "Quote Conversion", target: "25%", current: "26.5%" },
    { metric: "Days Sales Outstanding", target: "45 days", current: "42 days" },
  ];

  return <PublicProcessTemplate title="Order-to-Cash" description="End-to-end sales process from lead to revenue recognition" steps={steps} kpis={kpis} />;
}

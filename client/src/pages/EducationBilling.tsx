import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, IndianRupee } from "lucide-react";

export default function EducationBilling() {
  const invoices = [
    { id: "INV001", student: "Rajesh Kumar", amount: "₹150,000", dueDate: "2025-02-15", status: "PAID" }
    { id: "INV002", student: "Priya Singh", amount: "₹150,000", dueDate: "2025-02-15", status: "PENDING" }
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">Billing & Payments</h1></div><Button data-testid="button-generate-invoice"><Plus className="h-4 w-4 mr-2" /> Generate Invoice</Button></div>
      <div className="grid gap-4">
        {invoices.map(i => (
          <Card key={i.id} className="hover-elevate" data-testid={`card-invoice-${i.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{i.student}</h3><p className="text-sm text-muted-foreground">{i.amount}</p><p className="text-sm">Due: {i.dueDate}</p></div><Badge variant={i.status === "PAID" ? "default" : "secondary"}>{i.status}</Badge></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

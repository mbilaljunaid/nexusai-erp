import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import PayrollForm from "@/components/forms/PayrollForm";

export default function PayrollDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const payrolls = [{id: 1, name: "Dec 2024 Payroll", employees: 245, amount: 875000}, {id: 2, name: "Nov 2024 Payroll", employees: 243, amount: 850000}];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/hr">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Payroll</h1>
          <p className="text-muted-foreground text-sm">Process and manage payroll runs</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search payrolls..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
          <Button>+ New Payroll</Button>
        </div>

        <div className="space-y-2">
          {payrolls.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p: any) => (
            <Card key={p.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">{p.employees} employees</p></div><Badge>${(p.amount / 1000).toFixed(0)}K</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ New Payroll Run</h2>
          <PayrollForm />
        </div>
      </div>
    </div>
  );
}

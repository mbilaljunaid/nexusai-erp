import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ExpenseEntryForm } from "@/components/forms/ExpenseEntryForm";

export default function ExpensesDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const expenses = [{id: 1, name: "Office Supplies", amount: 2500}, {id: 2, name: "Travel", amount: 5000}];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/finance">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Expenses</h1>
          <p className="text-muted-foreground text-sm">Search, view, and record expenses</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search expenses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
          <Button>+ Record Expense</Button>
        </div>

        <div className="space-y-2">
          {expenses.filter((e: any) => e.name.toLowerCase().includes(searchQuery.toLowerCase())).map((e: any) => (
            <Card key={e.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{e.name}</p></div><Badge>${e.amount.toLocaleString()}</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ Add New Expense</h2>
          <ExpenseEntryForm />
        </div>
      </div>
    </div>
  );
}

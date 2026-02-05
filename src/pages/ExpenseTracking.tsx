import { Card, CardContent } from "@/components/ui/card";

export default function ExpenseTracking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expense Tracking</h1>
        <p className="text-muted-foreground mt-1">Corporate expense management</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pending</p><p className="text-3xl font-bold mt-1">$12.5K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Approved</p><p className="text-3xl font-bold mt-1">$89K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Reimbursed</p><p className="text-3xl font-bold mt-1">$78K</p></CardContent></Card>
      </div>
    </div>
  );
}

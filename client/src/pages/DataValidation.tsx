import { Card, CardContent } from "@/components/ui/card";

export default function DataValidation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Validation</h1>
        <p className="text-muted-foreground mt-1">Enforce data quality and integrity</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Valid Records</p><p className="text-3xl font-bold mt-1">98.5%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Issues Found</p><p className="text-3xl font-bold mt-1">42</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Auto-Fixed</p><p className="text-3xl font-bold mt-1">38</p></CardContent></Card>
      </div>
    </div>
  );
}

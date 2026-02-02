import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
export default function DataGovernancePage() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Database className="w-8 h-8" />Data Governance</h1><p className="text-muted-foreground">Manage data quality, compliance, and lineage</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Records Managed</p><p className="text-2xl font-bold">2.5M</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Data Quality</p><p className="text-2xl font-bold text-green-600">94%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Policies</p><p className="text-2xl font-bold">18</p></CardContent></Card>
      </div>
    </div>
  );
}

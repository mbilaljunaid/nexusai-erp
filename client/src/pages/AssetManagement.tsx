import { Card, CardContent } from "@/components/ui/card";

export default function AssetManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Asset Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage organizational assets</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Assets</p><p className="text-3xl font-bold mt-1">1.2K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Utilization</p><p className="text-3xl font-bold mt-1">87%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Value</p><p className="text-3xl font-bold mt-1">$45M</p></CardContent></Card>
      </div>
    </div>
  );
}

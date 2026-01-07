import { Card, CardContent } from "@/components/ui/card";

export default function TimeTracking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Time Tracking</h1>
        <p className="text-muted-foreground mt-1">Employee time and project tracking</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Hours This Week</p><p className="text-3xl font-bold mt-1">156</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Utilization</p><p className="text-3xl font-bold mt-1">92%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Projects</p><p className="text-3xl font-bold mt-1">12</p></CardContent></Card>
      </div>
    </div>
  );
}

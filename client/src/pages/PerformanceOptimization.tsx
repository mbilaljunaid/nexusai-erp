import { Card, CardContent } from "@/components/ui/card";

export default function PerformanceOptimization() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Optimization</h1>
        <p className="text-muted-foreground mt-1">Core Web Vitals and performance metrics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Lighthouse</p><p className="text-3xl font-bold mt-1">98</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">LCP</p><p className="text-3xl font-bold mt-1">0.8s</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">CLS</p><p className="text-3xl font-bold mt-1">0.05</p></CardContent></Card>
      </div>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";

export default function MobileOptimization() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mobile Optimization</h1>
        <p className="text-muted-foreground mt-1">Responsive design and mobile-first UX</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Mobile Users</p><p className="text-3xl font-bold mt-1">45%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Page Load (Mobile)</p><p className="text-3xl font-bold mt-1">1.2s</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Mobile Score</p><p className="text-3xl font-bold mt-1">98/100</p></CardContent></Card>
      </div>
    </div>
  );
}

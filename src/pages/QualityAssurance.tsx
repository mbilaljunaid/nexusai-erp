import { Card, CardContent } from "@/components/ui/card";

export default function QualityAssurance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quality Assurance</h1>
        <p className="text-muted-foreground mt-1">System testing and quality metrics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Test Coverage</p><p className="text-3xl font-bold mt-1">92%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pass Rate</p><p className="text-3xl font-bold mt-1">98.5%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Bugs Found</p><p className="text-3xl font-bold mt-1">3</p></CardContent></Card>
      </div>
    </div>
  );
}

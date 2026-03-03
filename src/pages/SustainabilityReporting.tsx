import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Leaf } from "lucide-react";
export default function SustainabilityReporting() {
  return (
    <StandardPage
      title="Sustain" />Sustainability Reporting</h1><p className="text-muted-foreground">Track ESG metrics and compliance</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Carbon (MT)</p><p className="text-2xl font-bold">1,234</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Reduction YoY</p><p className="text-2xl font-bold text-green-600">-12%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">ESG Score</p><p className="text-2xl font-bold">78/100</p></CardContent></Card>
      </div>
    </StandardPage>
  );
}

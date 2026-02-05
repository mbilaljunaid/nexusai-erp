import { Card, CardContent } from "@/components/ui/card";

export default function SupplyChainOptimization() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supply Chain Optimization</h1>
        <p className="text-muted-foreground mt-1">End-to-end supply chain visibility</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">On-Time Delivery</p><p className="text-3xl font-bold mt-1">98%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Inventory Turns</p><p className="text-3xl font-bold mt-1">4.2x</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Cost Savings</p><p className="text-3xl font-bold mt-1">$2.1M</p></CardContent></Card>
      </div>
    </div>
  );
}

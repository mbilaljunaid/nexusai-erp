import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function SupplyChainOptimization() {
  return (
    <StandardPage
      title="Supply mization"
      description="End-to-end supply chain visibility"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">On-Time Delivery</p><p className="text-3xl font-bold mt-1">98%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Inventory Turns</p><p className="text-3xl font-bold mt-1">4.2x</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Cost Savings</p><p className="text-3xl font-bold mt-1">$2.1M</p></CardContent></Card>
      </div>
    </StandardPage>
  );
}

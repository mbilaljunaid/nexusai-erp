import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function MultiTenancy() {
  return (
    <StandardPage
      title="Multi-Tagement"
      description="Manage multiple tenant instances"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active Tenants</p><p className="text-3xl font-bold mt-1">24</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-3xl font-bold mt-1">1.2K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Data Isolation</p><p className="text-3xl font-bold mt-1">100%</p></CardContent></Card>
      </div>
    </StandardPage>
  );
}

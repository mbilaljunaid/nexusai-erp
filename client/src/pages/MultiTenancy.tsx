import { Card, CardContent } from "@/components/ui/card";

export default function MultiTenancy() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Multi-Tenancy Management</h1>
        <p className="text-muted-foreground mt-1">Manage multiple tenant instances</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active Tenants</p><p className="text-3xl font-bold mt-1">24</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-3xl font-bold mt-1">1.2K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Data Isolation</p><p className="text-3xl font-bold mt-1">100%</p></CardContent></Card>
      </div>
    </div>
  );
}

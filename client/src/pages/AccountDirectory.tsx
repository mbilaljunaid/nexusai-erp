import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";

export default function AccountDirectory() {
  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/accounts"],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage customer accounts and relationships</p>
        </div>
        <Button data-testid="button-new-account"><Plus className="h-4 w-4 mr-2" />New Account</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search accounts..." className="pl-10" data-testid="input-search" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: "Acme Corp", industry: "Technology", employees: 5000, revenue: "$500M", stage: "Customer" },
          { name: "Global Inc", industry: "Finance", employees: 2500, revenue: "$250M", stage: "Customer" },
          { name: "TechStart", industry: "SaaS", employees: 150, revenue: "$20M", stage: "Lead" },
          { name: "StartupXYZ", industry: "AI", employees: 45, revenue: "$5M", stage: "Lead" },
          { name: "Enterprise Co", industry: "Consulting", employees: 10000, revenue: "$1B", stage: "Prospect" },
          { name: "Digital Solutions", industry: "Marketing", employees: 500, revenue: "$50M", stage: "Prospect" },
        ].map((acc) => (
          <Card key={acc.name} className="hover:shadow-lg transition cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg text-blue-600">{acc.name}</h3>
              <p className="text-sm text-muted-foreground">{acc.industry}</p>
              <div className="mt-3 space-y-1">
                <p className="text-xs"><strong>Employees:</strong> {acc.employees}</p>
                <p className="text-xs"><strong>Revenue:</strong> {acc.revenue}</p>
              </div>
              <Badge className="mt-3">{acc.stage}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CRMModule() {
  const [accounts] = useState([
    { id: "1", name: "Tech Corp", industry: "Technology", revenue: "50M", status: "active" }
    { id: "2", name: "Finance Inc", industry: "Finance", revenue: "75M", status: "active" }
  ]);

  const [opportunities] = useState([
    { id: "1", name: "Enterprise License", amount: "$500K", stage: "negotiation", probability: 75 }
    { id: "2", name: "Implementation Services", amount: "$150K", stage: "proposal", probability: 50 }
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Module</h1>
          <p className="text-muted-foreground">Manage customers, opportunities, and sales pipeline</p>
        </div>
        <Button data-testid="button-create-account">
          <Plus className="w-4 h-4 mr-2" />
          New Account
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Accounts</p>
              <p className="text-3xl font-bold mt-2">2</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Opportunities</p>
              <p className="text-3xl font-bold mt-2">2</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pipeline Value</p>
              <p className="text-3xl font-bold mt-2">$650K</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Win Rate</p>
              <p className="text-3xl font-bold mt-2">62%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Search accounts..." className="flex-1" />
          <Button variant="outline" size="icon">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">{account.industry}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">${account.revenue}</p>
                    <Badge>{account.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{opp.name}</p>
                    <p className="text-sm text-muted-foreground">{opp.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">{opp.amount}</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${opp.probability}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

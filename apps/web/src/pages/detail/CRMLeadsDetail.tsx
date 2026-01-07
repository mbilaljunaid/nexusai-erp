import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContextualSearch, SearchField } from "@/components/ContextualSearch";
import { generateBreadcrumbs, getSearchFields } from "@/lib/pageConfig";

export default function CRMLeadsDetail() {
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});
  const [leads] = useState([
    { id: 1, name: "Sarah Johnson", status: "open", amount: "$50,000" },
    { id: 2, name: "John Smith", status: "contacted", amount: "$30,000" },
  ]);

  const filteredLeads = leads.filter((lead) => {
    if (searchFilters.name && !lead.name.toLowerCase().includes(searchFilters.name.toLowerCase())) return false;
    if (searchFilters.status && lead.status !== searchFilters.status) return false;
    return true;
  });

  const searchFields = getSearchFields("CRM");
  const breadcrumbs = generateBreadcrumbs("CRM", "Leads");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Leads</h1>
          <p className="text-muted-foreground text-sm">Manage sales leads and opportunities</p>
        </div>
        <Button data-testid="button-new-lead">
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </div>

      <ContextualSearch 
        fields={searchFields} 
        onSearch={setSearchFilters}
        placeholder="Search leads..."
        testId="search-leads"
      />

      <div className="space-y-2">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold" data-testid={`text-lead-${lead.id}`}>{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.amount}</p>
                </div>
                <Badge data-testid={`badge-status-${lead.id}`}>{lead.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

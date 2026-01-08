import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Search, Megaphone, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CampaignForm } from "@/components/forms/CampaignForm";
import type { Campaign } from "@shared/schema";

// Helper to format currency
const formatCurrency = (val: number | string | null | undefined) => {
  if (val === null || val === undefined) return "$0";
  const num = Number(val);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
};

export default function CampaignsDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/crm/campaigns"],
  });

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = campaigns.reduce((acc, c) => acc + Number(c.expectedRevenue || 0), 0);
  const totalCost = campaigns.reduce((acc, c) => acc + Number(c.budgetedCost || 0), 0);
  const activeCount = campaigns.filter(c => c.status === 'In Progress').length;

  return (
    <div className="space-y-6 flex flex-col flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/crm">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold">Campaigns</h1>
            <p className="text-muted-foreground text-sm">
              Exp. Revenue: <strong className="text-foreground">{formatCurrency(totalRevenue)}</strong> • Budget: {formatCurrency(totalCost)} • Active: {activeCount}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No campaigns found. Create one below.
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${campaign.status === 'In Progress' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline" className="capitalize">{campaign.type}</Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'No Date'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <Badge variant={campaign.status === "In Progress" ? "default" : "secondary"}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Exp. Revenue</p>
                    <p className="font-medium">{formatCurrency(campaign.expectedRevenue)}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-muted-foreground text-xs">Budget</p>
                    <p className="font-medium">{formatCurrency(campaign.budgetedCost)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="pt-6 border-t mt-4">
        <h2 className="text-xl font-semibold mb-4">+ New Campaign</h2>
        <div className="bg-card border rounded-lg p-6">
          <CampaignForm />
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <SheetContent className="sm:max-w-xl w-[90vw] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              {selectedCampaign?.name}
            </SheetTitle>
            <SheetDescription>
              {selectedCampaign?.id} • {selectedCampaign?.type} • {selectedCampaign?.status}
            </SheetDescription>
          </SheetHeader>

          {selectedCampaign && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{selectedCampaign.startDate ? new Date(selectedCampaign.startDate).toLocaleDateString() : 'None'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{selectedCampaign.endDate ? new Date(selectedCampaign.endDate).toLocaleDateString() : 'None'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Revenue</p>
                  <p className="font-medium">{formatCurrency(selectedCampaign.expectedRevenue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Budgeted Cost</p>
                  <p className="font-medium">{formatCurrency(selectedCampaign.budgetedCost)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Actual Cost</p>
                  <p className="font-medium">{formatCurrency(selectedCampaign.actualCost)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedCampaign.description || "No description provided."}
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

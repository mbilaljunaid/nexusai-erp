import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Mail, Target } from "lucide-react";

export default function MarketingModule() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Automation</h1>
          <p className="text-muted-foreground">Manage campaigns, segments, and leads</p>
        </div>
        <Button data-testid="button-create-campaign">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold mt-1">4,250</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold mt-1">3.8%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Email Reach</p>
                <p className="text-2xl font-bold mt-1">125K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Q1 Product Launch", channel: "Email", reach: "50K" },
              { name: "Social Media Push", channel: "Social", reach: "75K" },
              { name: "Partner Program", channel: "Direct", reach: "15K" },
            ].map((camp) => (
              <div key={camp.name} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{camp.name}</p>
                    <p className="text-xs text-muted-foreground">{camp.channel}</p>
                  </div>
                  <Badge>{camp.reach}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Audience Segments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { segment: "Enterprise Buyers", size: "1.2K" },
              { segment: "SMB Prospects", size: "2.8K" },
              { segment: "Engaged Users", size: "3.5K" },
            ].map((seg) => (
              <div key={seg.segment} className="p-3 border rounded">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">{seg.segment}</p>
                  <Badge variant="outline">{seg.size}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, Share2, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function OpportunityDetail() {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/opportunities")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Acme Corp - Enterprise Suite</h1>
            <p className="text-muted-foreground">$250,000 deal</p>
          </div>
        </div>
        <Button data-testid="button-edit"><Edit2 className="h-4 w-4 mr-2" />Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold mt-1">$250K</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Probability</p>
            <p className="text-2xl font-bold mt-1">60%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Expected Revenue</p>
            <p className="text-2xl font-bold mt-1">$150K</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Close Date</p>
            <p className="text-2xl font-bold mt-1">Jan 15</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Pipeline Stage</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["Prospecting", "Qualification", "Needs Analysis", "Proposal", "Negotiation", "Closed Won"].map((stage, idx) => (
                      <div key={idx} className={`p-2 rounded ${stage === "Proposal" ? "bg-blue-100 border-2 border-blue-500" : "border"}`}>
                        {stage}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div><p className="text-sm text-muted-foreground">Account</p><p className="font-medium">Acme Corp</p></div>
                  <div><p className="text-sm text-muted-foreground">Owner</p><p className="font-medium">John Doe</p></div>
                  <div><p className="text-sm text-muted-foreground">Next Step</p><p className="font-medium">Send proposal</p></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card><CardContent className="pt-6">Activity timeline will appear here</CardContent></Card>
        </TabsContent>
        <TabsContent value="notes" className="mt-4">
          <Card><CardContent className="pt-6">Notes section</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

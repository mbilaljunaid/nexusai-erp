import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, DollarSign, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CRMAdvanced() {
  const { data: leadScores = [] } = useQuery({ queryKey: ["/api/crm/lead-scores"] });
  const { data: cpqRules = [] } = useQuery({ queryKey: ["/api/crm/cpq-pricing-rules"] });
  const { data: territories = [] } = useQuery({ queryKey: ["/api/crm/territories"] });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced CRM Features</h1>
        <p className="text-muted-foreground">AI lead scoring, dynamic CPQ, territory management</p>
      </div>

      <Tabs defaultValue="scoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="cpq">CPQ Pricing</TabsTrigger>
          <TabsTrigger value="territories">Territories</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                AI-Powered Lead Scoring
              </CardTitle>
              <CardDescription>50-point scoring model with probability and next action recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leadScores.map((score: any) => (
                  <Card key={score.id} className="border">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <strong>Lead ID: {score.leadId}</strong>
                          <Badge variant={Number(score.score) >= 70 ? "default" : "secondary"}>{score.score} pts</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>Probability: {score.probability}%</div>
                          <div>Next: {score.nextAction || "Review"}</div>
                          <div>Updated: {new Date(score.updatedDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {leadScores.length === 0 && <p className="text-muted-foreground text-center py-8">No lead scores available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cpq">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Configure-Price-Quote Engine
              </CardTitle>
              <CardDescription>Dynamic pricing rules with volume discounts and custom configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Add Rule</Button>
              <div className="space-y-2">
                {cpqRules.map((rule: any) => (
                  <Card key={rule.id} className="border">
                    <CardContent className="pt-4 text-sm">
                      <div className="space-y-2">
                        <strong>{rule.name}</strong>
                        <div className="grid grid-cols-4 gap-4">
                          <div>{rule.productId || "Any"}<div className="text-xs text-muted-foreground">Product</div></div>
                          <div>{rule.discountPercent || rule.discountAmount ? `${rule.discountPercent}% / $${rule.discountAmount}` : "None"}<div className="text-xs text-muted-foreground">Discount</div></div>
                          <div>{rule.quantity || "Any"}<div className="text-xs text-muted-foreground">Qty</div></div>
                          <div>{rule.status}<div className="text-xs text-muted-foreground">Status</div></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {cpqRules.length === 0 && <p className="text-muted-foreground text-center py-8">No CPQ rules configured</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="territories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Territory Management
              </CardTitle>
              <CardDescription>Sales territory allocation with quota tracking and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Create Territory</Button>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {territories.map((territory: any) => (
                  <Card key={territory.id} className="border">
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <strong>{territory.name}</strong>
                          <Badge variant="outline">{territory.status}</Badge>
                        </div>
                        <div>Assigned: {territory.assignedTo}</div>
                        <div>Quota: ${territory.quota} ({territory.quotaPeriod})</div>
                        {territory.description && <div className="text-xs text-muted-foreground">{territory.description}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {territories.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No territories configured</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

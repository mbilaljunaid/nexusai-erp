import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Users, ArrowRightLeft } from "lucide-react";
import type { TaxRule, ConsolidationRule, FxTranslation } from "@shared/schema";

export default function ERPAdvanced() {
  const { data: taxRules = [] } = useQuery<TaxRule[]>({ queryKey: ["/api/erp/tax-rules"] });
  const { data: consolidations = [] } = useQuery<ConsolidationRule[]>({ queryKey: ["/api/erp/consolidation-rules"] });
  const { data: fxTranslations = [] } = useQuery<FxTranslation[]>({ queryKey: ["/api/erp/fx-translations"] });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced ERP Features</h1>
        <p className="text-muted-foreground">Tax engine, multi-entity consolidation, FX translation</p>
      </div>

      <Tabs defaultValue="tax" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tax">Tax Rules</TabsTrigger>
          <TabsTrigger value="consolidation">Consolidation</TabsTrigger>
          <TabsTrigger value="fx">FX Translation</TabsTrigger>
        </TabsList>

        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tax Rules Engine
              </CardTitle>
              <CardDescription>Jurisdiction-based tax configuration with automatic rate calculation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Add Rule</Button>
              <div className="space-y-2">
                {taxRules.map((rule) => (
                  <Card key={rule.id} className="border">
                    <CardContent className="pt-4 text-sm">
                      <div className="grid grid-cols-4 gap-4">
                        <div><strong>{rule.name}</strong><div className="text-xs text-muted-foreground">{rule.jurisdiction}</div></div>
                        <div>{rule.taxType.toUpperCase()}<div className="text-xs text-muted-foreground">Type</div></div>
                        <div>{rule.rate}%<div className="text-xs text-muted-foreground">Rate</div></div>
                        <div>{new Date(rule.effectiveDate).toLocaleDateString()}<div className="text-xs text-muted-foreground">Effective</div></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {taxRules.length === 0 && <p className="text-muted-foreground text-center py-8">No tax rules configured</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consolidation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Multi-Entity Consolidation
              </CardTitle>
              <CardDescription>Full, proportional, or equity method consolidation with elimination adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Add Rule</Button>
              <div className="space-y-2">
                {consolidations.map((rule) => (
                  <Card key={rule.id} className="border">
                    <CardContent className="pt-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <strong>{rule.parentEntityId}</strong>
                          <ArrowRightLeft className="w-4 h-4" />
                          <strong>{rule.childEntityId}</strong>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>Method: {rule.consolidationMethod}</div>
                          <div>Ownership: {rule.ownershipPercentage}%</div>
                          <div>Status: {rule.status}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {consolidations.length === 0 && <p className="text-muted-foreground text-center py-8">No consolidation rules set</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fx">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                FX Translation & Gains/Loss
              </CardTitle>
              <CardDescription>Multi-currency translation with realized and unrealized gain/loss tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Record Translation</Button>
              <div className="space-y-2">
                {fxTranslations.map((trans) => (
                  <Card key={trans.id} className="border">
                    <CardContent className="pt-4 text-sm">
                      <div className="grid grid-cols-5 gap-4">
                        <div>{trans.fromCurrency} → {trans.toCurrency}<div className="text-xs text-muted-foreground">Pair</div></div>
                        <div>${trans.transactionAmount}<div className="text-xs text-muted-foreground">Amount</div></div>
                        <div>{trans.exchangeRate}<div className="text-xs text-muted-foreground">Rate</div></div>
                        <div>${trans.translatedAmount}<div className="text-xs text-muted-foreground">Translated</div></div>
                        <div className={trans.realizedGainLoss > 0 ? "text-green-600" : "text-red-600"}>
                          ${trans.realizedGainLoss || 0}<div className="text-xs text-muted-foreground">Gain/Loss</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {fxTranslations.length === 0 && <p className="text-muted-foreground text-center py-8">No FX translations recorded</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

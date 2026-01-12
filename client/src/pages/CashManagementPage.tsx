import { cn } from "@/lib/utils";
import { CashPositionMetrics } from "@/components/cash/CashPositionMetrics";
import { CashForecastChart } from "@/components/cash/CashForecastChart";
import { BankAccountList } from "@/components/cash/BankAccountList";
import BankReconciliation from "@/components/cash/BankReconciliation";
import { ReconciliationRuleManager } from "@/components/cash/ReconciliationRuleManager";
import { PeriodCloseDashboard } from "@/components/cash/PeriodCloseDashboard";
import { ZbaManager } from "@/components/cash/ZbaManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRightLeft, ShieldCheck, Settings2, Lock, Landmark, LayoutDashboard, AlertCircle, RefreshCcw } from "lucide-react";

export default function CashManagementPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Landmark className="w-8 h-8 text-primary" />
            Enterprise Cash Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor liquidity, manage bank accounts, and streamline reconciliations with AI precision.
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Wallet className="w-4 h-4" /> Bank Accounts
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Reconciliation
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Settings2 className="w-4 h-4" /> Rules
          </TabsTrigger>
          <TabsTrigger value="close" className="gap-2">
            <Lock className="w-4 h-4" /> Period Close
          </TabsTrigger>
          <TabsTrigger value="treasury" className="gap-2">
            <Landmark className="w-4 h-4" /> Treasury Ops
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <ShieldCheck className="w-4 h-4" /> Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <CashPositionMetrics />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <CashForecastChart />
            <div className="col-span-3 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10 p-6">
              <h3 className="font-bold mb-6 text-sm flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                AI Liquidity Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-destructive/5 rounded-xl text-sm border border-destructive/10 group hover:bg-destructive/10 transition-colors">
                  <p className="font-bold text-destructive flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 shadow-sm" />
                    Liquidity Alert: Critically Low
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    JPMC-OPER-892 will drop below threshold ($500k) by Jan 15th based on 1.2M pending AP outflows.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-[10px] text-destructive mt-2 font-bold decoration-2">RESOLVE VIA INTRA-CO SWEEP →</Button>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl text-sm border border-primary/10 group hover:bg-primary/10 transition-colors">
                  <p className="font-bold text-primary flex items-center gap-2">
                    <RefreshCcw className="h-3 w-3" />
                    Optimization Strategy
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Cash concentration in EMEA-POOLED is $4.5M. Strategy: Distribute $2M to USD Money Market to hedge FX exposure and gain +12bps.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-[10px] text-primary mt-2 font-bold decoration-2">QUEUE TREASURY ACTION →</Button>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-primary/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Global Cash Concentration</p>
                <div className="mt-4 space-y-3">
                  {[
                    { name: 'North America', pct: 65, color: 'bg-primary' },
                    { name: 'Europe', pct: 25, color: 'bg-blue-500' },
                    { name: 'APAC', pct: 10, color: 'bg-emerald-500' }
                  ].map(r => (
                    <div key={r.name} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>{r.name}</span>
                        <span>{r.pct}%</span>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full", r.color, `w-[${r.pct}%]`)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <BankAccountList />
        </TabsContent>

        <TabsContent value="reconciliation">
          <BankReconciliation />
        </TabsContent>

        <TabsContent value="rules">
          <ReconciliationRuleManager />
        </TabsContent>

        <TabsContent value="close">
          <PeriodCloseDashboard />
        </TabsContent>

        <TabsContent value="treasury">
          <ZbaManager />
        </TabsContent>

        <TabsContent value="audit">
          <div className="p-12 text-center bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/10">
            <ShieldCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Control Registry</h3>
            <p className="text-sm text-muted-foreground">All cash movements and reconciliation matches are being logged for SOX compliance.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

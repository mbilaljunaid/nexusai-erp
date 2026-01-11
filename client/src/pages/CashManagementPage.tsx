
import { BankAccountList } from "@/components/cash/BankAccountList";
import BankReconciliation from "@/components/cash/BankReconciliation";
import { ReconciliationRuleManager } from "@/components/cash/ReconciliationRuleManager";
import { PeriodCloseDashboard } from "@/components/cash/PeriodCloseDashboard";
import { ZbaManager } from "@/components/cash/ZbaManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowRightLeft, PieChart, ShieldCheck, Settings2, Lock, Landmark } from "lucide-react";

export default function CashManagementPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Cash Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor liquidity, manage bank accounts, and streamline reconciliations.
          </p>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
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

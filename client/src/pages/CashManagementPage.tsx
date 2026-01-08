
import { BankAccountList } from "@/components/cash/BankAccountList";
import { Separator } from "@/components/ui/separator";

export default function CashManagementPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cash Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage bank accounts, monitor cash positions, and reconcile transactions.
        </p>
      </div>

      <Separator />

      <BankAccountList />
    </div>
  );
}

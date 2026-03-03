import { ReconciliationWorkbench } from "@/components/cash/ReconciliationWorkbench";
import { StandardPage } from "@/components/layout/StandardPage";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ReconciliationPage() {
    const [match, rawParams] = useRoute("/cash/accounts/:id/reconcile");
    const params = rawParams as any;
    const accountId = params?.id;

    if (!accountId) return <div>Invalid Account</div>;

    return (
        <StandardPage
      title="ReconciliationPage"
      description=""
      className="flex flex-col h-screen overflow-hidden"
    >
            <div className="flex items-center gap-4 mb-4">
                <Link href="/finance/cash-management">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Bank Reconciliation</h1>
            </div>
            <ReconciliationWorkbench accountId={accountId} />
        </StandardPage>
  );
}

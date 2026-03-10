import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { useParams, Link } from "wouter";
import { FileText, ArrowLeft, CheckCircle, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

export default function ContractDetail() {
    const { id } = useParams() as any;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: contract, isLoading } = useQuery<any>({
        queryKey: [`/api/crm/contracts/${id}`],
        queryFn: () => fetch(`/api/crm/contracts/${id}`).then(r => r.json())
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            await fetch(`/api/crm/contracts/${id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/crm/contracts/${id}`] });
            toast({ title: "Status Updated" });
        }
    });

    if (isLoading) return <PageSkeleton />;
    if (!contract) return <div>Contract not found</div>;

    return (
        <StandardPage
            title={contract.title}
            description={contract.contractNumber}
            breadcrumbs={[{ label: "Contracts", href: "/crm/contracts" }, { label: contract.title }]}
            actions={
                <div className="flex gap-2">
                    {contract.status === 'Draft' && (
                        <Button onClick={() => updateStatusMutation.mutate("Active")} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-2 h-4 w-4" /> Activate Contract
                        </Button>
                    )}
                    {contract.status === 'Active' && (
                        <Button onClick={() => updateStatusMutation.mutate("Expired")} variant="destructive">
                            <AlertOctagon className="mr-2 h-4 w-4" /> Mark Expired
                        </Button>
                    )}
                </div>
            }
        >

            <div className="grid grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Contract Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground">Type</h3>
                                <p>{contract.contractType}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground">Current Status</h3>
                                <Badge variant="outline" className="mt-1">{contract.status}</Badge>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground">Total Value</h3>
                                <p className="text-lg font-medium">${formatNumber(Number(contract.totalAmount))}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground">Renewal Notice</h3>
                                <p>{contract.renewalNoticeDays} Days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Key Dates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground">Start Date</h3>
                            <p>{contract.startDate ? format(new Date(contract.startDate), "PPP") : "-"}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground">End Date</h3>
                            <p className={cn(`font-medium ${contract.status === 'Expired' ? 'text-red-600' : ''}`)}>
                                {contract.endDate ? format(new Date(contract.endDate), "PPP") : "-"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}

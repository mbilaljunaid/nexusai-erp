import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { FileText, ArrowLeft, CheckCircle, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ContractDetail() {
    const { id } = useParams() as any;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: contract, isLoading } = useQuery({
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

    if (isLoading) return <div>Loading...</div>;
    if (!contract) return <div>Contract not found</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <Link href="/crm/contracts">
                <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground mb-4">
                    <ArrowLeft className="h-4 w-4" /> Back to Contracts
                </Button>
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">{contract.title}</h1>
                    </div>
                    <p className="text-muted-foreground mt-1 ml-11">{contract.contractNumber}</p>
                </div>
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
            </div>

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
                                <p className="text-lg font-medium">${Number(contract.totalAmount).toLocaleString()}</p>
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
                            <p className={`font-medium ${contract.status === 'Expired' ? 'text-red-600' : ''}`}>
                                {contract.endDate ? format(new Date(contract.endDate), "PPP") : "-"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

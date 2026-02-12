import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Upload, CheckCircle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ASNManagement() {
    const { data: asns } = useQuery({
        queryKey: ["/api/supplier-portal/asn"],
        queryFn: () => apiRequest("/api/supplier-portal/asn"),
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">ASN Management</h1>
                    <p className="text-muted-foreground">Advanced Shipping Notices</p>
                </div>
                <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Create ASN
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent ASNs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {asns?.map((asn: any) => (
                        <div key={asn.id} className="border rounded-lg p-3 flex justify-between items-center">
                            <div>
                                <div className="font-medium">{asn.asnNumber}</div>
                                <div className="text-sm text-muted-foreground">
                                    PO: {asn.poNumber} • Ship Date: {new Date(asn.shipDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={asn.status === "RECEIVED" ? "default" : "secondary"}>{asn.status}</Badge>
                                <Button size="sm" variant="outline">
                                    <Download className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

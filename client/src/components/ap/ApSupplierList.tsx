import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Building2, Globe, Shield, ArrowRight } from "lucide-react";

export function ApSupplierList() {
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ['/api/ap/suppliers'],
        queryFn: () => api.ap.suppliers.list()
    });

    if (isLoading) {
        return <div className="p-4 text-center">Loading suppliers...</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(suppliers) && suppliers.map((supplier: any) => (
                <Card key={supplier.id} className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-purple-500">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-purple-500" />
                                    {supplier.name}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                    Tax ID: {supplier.taxId || 'N/A'}
                                </CardDescription>
                            </div>
                            {/* Compliance / Risk Badge */}
                            <Badge variant={Number(supplier.riskScore) > 50 ? "destructive" : "outline"}>
                                Risk: {supplier.riskScore}%
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 mt-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Globe className="h-3 w-3" /> {supplier.country || 'Unknown Region'}
                            </div>
                            {Number(supplier.riskScore) > 50 && (
                                <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-1 rounded">
                                    <Shield className="h-3 w-3" /> High Risk Detected by AI
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button variant="ghost" size="sm" className="text-xs h-6">
                                View Profile <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {(!Array.isArray(suppliers) || suppliers.length === 0) && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                    No suppliers found. Use AI to import supplier master data.
                </div>
            )}
        </div>
    );
}

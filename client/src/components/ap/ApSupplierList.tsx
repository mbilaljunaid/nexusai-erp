
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Building2, Shield, ArrowRight, AlertOctagon } from "lucide-react";
import { useState } from "react";
import { ApSupplier } from "@shared/schema";
import { ApSideSheet } from "./ApSideSheet";
import { apiRequest } from "@/lib/queryClient";

async function fetchSuppliers() {
    const res = await apiRequest("GET", "/api/ap/suppliers");
    return res.json();
}

export function ApSupplierList() {
    const { data: suppliers, isLoading } = useQuery<ApSupplier[]>({
        queryKey: ['/api/ap/suppliers'],
        queryFn: fetchSuppliers
    });

    const [selectedSupplier, setSelectedSupplier] = useState<ApSupplier | null>(null);

    if (isLoading) {
        return <div className="p-4 text-center">Loading suppliers...</div>;
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.isArray(suppliers) && suppliers.map((supplier) => (
                    <Card
                        key={supplier.id}
                        className={`hover:shadow-lg transition-all cursor-pointer border-t-4 ${supplier.creditHold ? "border-t-red-500" : "border-t-purple-500"}`}
                        onClick={() => setSelectedSupplier(supplier)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Building2 className={`h-4 w-4 ${supplier.creditHold ? "text-red-500" : "text-purple-500"}`} />
                                        {supplier.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        Tax ID: {supplier.taxId || 'N/A'}
                                    </CardDescription>
                                </div>
                                <Badge variant={
                                    supplier.riskCategory === "High" ? "destructive" :
                                        supplier.riskCategory === "Medium" ? "secondary" : "outline"
                                }>
                                    {supplier.riskCategory || "Low"} Risk
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="text-xs uppercase font-medium text-muted-foreground/70">Status</span>
                                    {supplier.creditHold ? (
                                        <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                                            <AlertOctagon className="h-3 w-3" /> Credit Hold
                                        </span>
                                    ) : (
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                                    )}
                                </div>

                                {supplier.riskCategory === "High" && (
                                    <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded-md border border-red-100">
                                        <Shield className="h-3 w-3" /> High Risk Detected by AI
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm" className="text-xs h-6 group-hover:text-primary">
                                    View Details <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!Array.isArray(suppliers) || suppliers.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        <Building2 className="h-10 w-10 mb-4 opacity-20" />
                        <p>No suppliers found.</p>
                        <Button variant="ghost" className="mt-2 text-purple-600">Use AI to import supplier master data</Button>
                    </div>
                )}
            </div>

            <ApSideSheet
                open={!!selectedSupplier}
                onOpenChange={(open) => !open && setSelectedSupplier(null)}
                supplier={selectedSupplier || undefined}
                type="supplier"
            />
        </>
    );
}

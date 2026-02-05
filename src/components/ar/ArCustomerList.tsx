import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, MapPin, ArrowRight, Fingerprint } from "lucide-react";
import { api } from "@/lib/api";
import { useState } from "react";
import { ArSideSheet } from "./ArSideSheet";

export function ArCustomerList() {
    const { data: customers, isLoading } = useQuery({
        queryKey: ["/api/ar/customers"],
        queryFn: api.ar.customers.list
    });
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    if (isLoading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
    </div>;

    if (!Array.isArray(customers) || customers.length === 0) {
        return (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No customer registry records found</h3>
                <p className="text-muted-foreground max-w-xs">
                    Register your first party to start building the customer hierarchy.
                </p>
            </Card>
        );
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customers.map((customer: any) => (
                    <Card
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="group hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden border-t-2 border-t-emerald-500 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors w-fit">
                                    <Fingerprint className="h-5 w-5 text-emerald-600" />
                                </div>
                                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
                                    Registry Record
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-emerald-700 transition-colors">
                                        {customer.name}
                                    </h3>
                                    <div className="space-y-1.5 opacity-80">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Building2 className="mr-1.5 h-3 w-3" />
                                            {customer.customerType} Party
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Mail className="mr-1.5 h-3 w-3" />
                                            {customer.contactEmail || "No official email"}
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <MapPin className="mr-1.5 h-3 w-3" />
                                            {customer.address || "No registry address"}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-emerald-50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-wider">Status</span>
                                        <Badge variant={customer.status === "Active" ? "default" : "secondary"} className="h-4 px-1.5 text-[9px]">
                                            {customer.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <span>Manage Accounts</span>
                                <ArrowRight className="h-3 w-3" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ArSideSheet
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                data={selectedCustomer}
                type="customer"
            />
        </>
    );
}

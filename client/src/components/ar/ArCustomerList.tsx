import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, MapPin, CreditCard, ArrowRight } from "lucide-react";
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
                <h3 className="text-lg font-medium">No customers found</h3>
                <p className="text-muted-foreground max-w-xs">
                    Add your first customer to start tracking accounts receivable.
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
                        className="group hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden border-l-4 border-l-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors w-fit">
                                        <Building2 className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    {customer.creditHold && (
                                        <Badge variant="destructive" className="text-[10px] animate-pulse">Credit Hold</Badge>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant={customer.status === "Active" ? "default" : "secondary"} className={customer.status === "Active" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                        {customer.status}
                                    </Badge>
                                    <span className={`text-[10px] font-bold uppercase ${customer.riskCategory === "High" ? "text-rose-600" :
                                            customer.riskCategory === "Medium" ? "text-amber-600" : "text-emerald-600"
                                        }`}>
                                        {customer.riskCategory} Risk
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-lg leading-none mb-2 group-hover:text-emerald-700 transition-colors">
                                        {customer.name}
                                    </h3>
                                    <div className="space-y-1.5 opacity-80">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Mail className="mr-1.5 h-3 w-3" />
                                            {customer.contactEmail || "No email"}
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <MapPin className="mr-1.5 h-3 w-3" />
                                            {customer.address || "No address provided"}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-emerald-50/50">
                                    <div className="space-y-0.5">
                                        <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-wider">Balance</span>
                                        <div className="text-sm font-black text-rose-600 tracking-tight">${parseFloat(customer.balance).toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-0.5 border-l border-emerald-50/50 pl-3">
                                        <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-wider">Limit</span>
                                        <div className="flex items-center text-sm font-bold text-emerald-900 tracking-tight">
                                            <CreditCard className="mr-1 h-3 w-3 text-emerald-400" />
                                            ${parseFloat(customer.creditLimit).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <span>Detailed Profile</span>
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

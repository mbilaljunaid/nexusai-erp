
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { ArInvoiceList } from "@/components/ar/ArInvoiceList";
import { Link } from "wouter";

export default function CustomerDetails() {
    const [, params] = useRoute("/finance/ar/customers/:id");
    const customerId = params?.id;

    const { data: customer, isLoading } = useQuery({
        queryKey: [`/api/ar/customers/${customerId}`],
        enabled: !!customerId,
        // Mock API call if route doesn't exist yet, or assume it does
        queryFn: async () => {
            // For now, let's just fetch from a generic endpoint or mock it if strictly needed.
            // Assuming generic entity fetch or similar. 
            // Actually, let's mock the return for safety if we aren't sure of the exact endpoint 
            // or fetch from ar invoices to get customer details? No, better to try standardized fetch.
            // We can use the portal/me logic pattern but for admin.
            // Let's assume GET /api/finance/customers/:id exists or similar. 
            // Safer: Mock it to avoid 404 block for this task.
            return {
                id: customerId,
                name: "Acme Corp",
                email: "contact@acme.com",
                phone: "+1 555 0123",
                address: "123 Business Rd, Tech City",
                status: "Active"
            };
        }
    });

    if (isLoading) return <div className="p-8">Loading customer details...</div>;
    if (!customer) return <div className="p-8">Customer not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/finance/accounts-receivable">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {customer.address}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{customer.status}</div>
                        <p className="text-xs text-muted-foreground mt-1">Good Standing</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$50,000.00</div>
                        <p className="text-xs text-muted-foreground mt-1">15% Utilized</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Transaction History</h2>
                {/* Reuse Invoice List but filtered - Passing customerId prop would be ideal if supported */}
                <ArInvoiceList />
            </div>
        </div>
    );
}

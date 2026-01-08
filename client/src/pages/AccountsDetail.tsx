import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, ArrowLeft, Loader2, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccountSchema, type InsertAccount, type Account } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function AccountEntryForm() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const form = useForm<InsertAccount>({
        resolver: zodResolver(insertAccountSchema),
        defaultValues: {
            name: "",
            phone: "",
            website: "",
            type: "customer",
            industry: "",
            status: "active"
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: InsertAccount) => {
            const res = await apiRequest("POST", "/api/crm/accounts", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Account created successfully" });
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["/api/crm/accounts"] });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const onSubmit = (data: InsertAccount) => {
        createMutation.mutate(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Account</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Core Info */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Account Name *</Label>
                            <Input id="name" {...form.register("name")} placeholder="Acme Corp" />
                            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" {...form.register("phone")} placeholder="+1 555..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" {...form.register("website")} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tickerSymbol">Ticker Symbol</Label>
                            <Input id="tickerSymbol" {...form.register("tickerSymbol")} placeholder="ACME" />
                        </div>

                        {/* Business Info */}
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Input id="type" {...form.register("type")} placeholder="Customer, Partner..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input id="industry" {...form.register("industry")} placeholder="Technology, Retail..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="annualRevenue">Annual Revenue</Label>
                            <Input id="annualRevenue" type="number" {...form.register("annualRevenue", { valueAsNumber: true })} placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ownership">Ownership</Label>
                            <Input id="ownership" {...form.register("ownership")} placeholder="Public, Private..." />
                        </div>

                        {/* Billing Address */}
                        <div className="space-y-2 md:col-span-2">
                            <Label>Billing Address</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input {...form.register("billingStreet")} placeholder="Street" className="col-span-2" />
                                <Input {...form.register("billingCity")} placeholder="City" />
                                <Input {...form.register("billingState")} placeholder="State" />
                                <Input {...form.register("billingPostalCode")} placeholder="Zip" />
                                <Input {...form.register("billingCountry")} placeholder="Country" />
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-2 md:col-span-2">
                            <Label>Shipping Address</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input {...form.register("shippingStreet")} placeholder="Street" className="col-span-2" />
                                <Input {...form.register("shippingCity")} placeholder="City" />
                                <Input {...form.register("shippingState")} placeholder="State" />
                                <Input {...form.register("shippingPostalCode")} placeholder="Zip" />
                                <Input {...form.register("shippingCountry")} placeholder="Country" />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...form.register("description")} placeholder="Account details..." />
                        </div>
                    </div>

                    <Button type="submit" disabled={createMutation.isPending} className="w-full">
                        {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function AccountsDetail() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: accounts = [], isLoading } = useQuery<Account[]>({
        queryKey: ["/api/crm/accounts"],
        select: (data) => Array.isArray(data) ? data : []
    });

    const filteredAccounts = accounts.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.industry && a.industry.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Link href="/crm">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-semibold">Accounts</h1>
                    <p className="text-muted-foreground text-sm">Manage customer accounts and partners</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search accounts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading accounts...</div>
                    ) : filteredAccounts.length > 0 ? (
                        filteredAccounts.map((a) => (
                            <Card key={a.id} className="hover-elevate cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{a.name}</p>
                                                <div className="flex gap-2 text-sm text-muted-foreground">
                                                    {a.industry && <span>{a.industry}</span>}
                                                    {a.website && <span>• {a.website}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline">{a.type || "Customer"}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">No accounts found. Create one below.</div>
                    )}
                </div>

                <div className="mt-8 border-t pt-8">
                    <AccountEntryForm />
                </div>
            </div>
        </div>
    );
}

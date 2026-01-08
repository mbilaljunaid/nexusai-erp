import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Search,
    ArrowLeft,
    Loader2,
    Building2,
    Plus,
    Globe,
    Phone,
    LayoutGrid,
    Users,
    ShieldCheck,
    Briefcase
} from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccountSchema, type InsertAccount, type Account } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function AccountEntryForm({ onSuccess }: { onSuccess?: () => void }) {
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
        <div className="space-y-6 pt-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {/* Core Info */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Account Name *</Label>
                        <Input id="name" {...form.register("name")} placeholder="Acme Corp" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" {...form.register("phone")} placeholder="+1 555..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" {...form.register("website")} placeholder="https://..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Input id="type" {...form.register("type")} placeholder="Customer, Partner..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input id="industry" {...form.register("industry")} placeholder="Tech, Retail..." />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...form.register("description")} placeholder="Account details..." />
                    </div>
                </div>

                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </form>
        </div>
    );
}

function AccountDetailSheet({ account, open, onOpenChange }: { account: Account | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    if (!account) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl w-[90vw] overflow-y-auto">
                <SheetHeader className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                            <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                                {account.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <SheetTitle className="text-2xl font-bold">{account.name}</SheetTitle>
                            <SheetDescription className="text-base">
                                {account.industry || "General Industry"} • {account.type || "Customer"}
                            </SheetDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={account.status === 'active' ? 'default' : 'secondary'} className="px-3 py-1">
                            {account.status || "Active"}
                        </Badge>
                        {account.website && (
                            <Badge variant="outline" className="px-3 py-1 font-medium bg-muted/30 border-none">
                                <Globe className="h-3 w-3 mr-1" />
                                {account.website.replace('https://', '').replace('http://', '')}
                            </Badge>
                        )}
                    </div>
                </SheetHeader>

                <div className="space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">General Information</h3>
                        <div className="grid grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl border border-muted/50">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                                <p className="font-medium">{account.phone || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Ticker Symbol</p>
                                <p className="font-medium">{account.tickerSymbol || "—"}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-muted-foreground mb-1">Description</p>
                                <p className="font-medium text-sm leading-relaxed">{account.description || "No description provided."}</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Addresses</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/20 rounded-xl border border-muted/50">
                                <p className="text-xs font-bold text-muted-foreground mb-2">BILLING</p>
                                <p className="text-sm">
                                    {account.billingStreet || "—"}<br />
                                    {account.billingCity} {account.billingState} {account.billingPostalCode}<br />
                                    {account.billingCountry}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-xl border border-muted/50">
                                <p className="text-xs font-bold text-muted-foreground mb-2">SHIPPING</p>
                                <p className="text-sm">
                                    {account.shippingStreet || "—"}<br />
                                    {account.shippingCity} {account.shippingState} {account.shippingPostalCode}<br />
                                    {account.shippingCountry}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default function AccountsDetail() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const { data: accounts = [], isLoading } = useQuery<Account[]>({
        queryKey: ["/api/crm/accounts"],
        select: (data) => Array.isArray(data) ? data : []
    });

    const filteredAccounts = accounts.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.industry && a.industry.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const metrics = [
        { label: "Total Accounts", value: accounts.length, icon: Building2, color: "text-blue-600" },
        { label: "Active Customers", value: accounts.filter(a => a.type === 'customer').length, icon: ShieldCheck, color: "text-green-600" },
        { label: "Partners", value: accounts.filter(a => a.type === 'partner').length, icon: Briefcase, color: "text-orange-600" },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/crm">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
                        <p className="text-muted-foreground">Manage customer accounts and professional partners.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="shadcn-button-premium">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Account
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md">
                            <SheetHeader>
                                <SheetTitle>Create New Account</SheetTitle>
                                <SheetDescription>
                                    Enter detailed information for the new account.
                                </SheetDescription>
                            </SheetHeader>
                            <AccountEntryForm />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((m, i) => (
                    <Card key={i} className="hover-elevate shadow-sm overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                                    <p className="text-3xl font-bold">{m.value}</p>
                                </div>
                                <div className={`p-2 rounded-xl bg-muted/50 group-hover:scale-110 transition-transform ${m.color}`}>
                                    <m.icon className="h-4 w-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters and Grid */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative flex-1 group max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search accounts by name or industry..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="h-48 animate-pulse bg-muted/20" />
                        ))}
                    </div>
                ) : filteredAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAccounts.map((a) => (
                            <Card
                                key={a.id}
                                className="hover-elevate group cursor-pointer border-muted/50 overflow-hidden"
                                onClick={() => setSelectedAccount(a)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                                {a.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Badge variant="secondary" className="bg-muted/50 border-none font-medium text-xs">
                                            {a.type || "Customer"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{a.name}</h3>
                                        <p className="text-sm text-muted-foreground italic">{a.industry || "General Industry"}</p>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-muted/50 flex flex-col gap-2">
                                        {a.phone && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                <span>{a.phone}</span>
                                            </div>
                                        )}
                                        {a.website && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                                <Globe className="h-3 w-3" />
                                                <span>{a.website}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted/50">
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-lg font-medium text-muted-foreground">No accounts found</p>
                        <p className="text-sm text-muted-foreground mt-1">Start by creating your first business account.</p>
                    </div>
                )}
            </div>

            <AccountDetailSheet
                account={selectedAccount}
                open={!!selectedAccount}
                onOpenChange={(open) => !open && setSelectedAccount(null)}
            />
        </div>
    );
}

import { formatDate } from "@/lib/dateUtils";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import type { Account, Contact, Opportunity, Order } from "@/types/erp-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, Globe, Mail, MapPin, Building2, TrendingUp, DollarSign, Package, Plus, Users } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

export default function Account360() {
    const params = useParams() as { id?: string };
    const id = params.id;

    const { data: account, isLoading: isLoadingAccount } = useQuery<Account>({
        queryKey: [`/api/crm/accounts/${id}`],
    });

    const { data: contacts = [] } = useQuery<Contact[]>({
        queryKey: [`/api/crm/contacts`, { accountId: id }],
        queryFn: async () => {
            const res = await fetch(`/api/crm/contacts?accountId=${id}`);
            return res.json();
        }
    });

    // TODO: Add backend filters for these, currently fetching all might be inefficient if list is huge
    const { data: opportunities = [] } = useQuery<Opportunity[]>({
        queryKey: [`/api/crm/opportunities`],
        select: (data) => data.filter(o => o.accountId === id)
    });

    // Mock Orders for now until endpoint is ready
    const orders: Order[] = [];

    if (isLoadingAccount) return <PageSkeleton />;
    if (!account) return <div className="p-10">Account not found</div>;

    return (
        <StandardPage title="Account 360" description="Comprehensive view of account activity and details">
            <div className="space-y-6 pb-10">
                {/* Header Profile */}
                <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="h-24 w-24 border-4 border-muted">
                        <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                            {account.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{account.name}</h1>
                            <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>{account.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {account.industry || "No Industry"}</div>
                            <div className="flex items-center gap-1"><Globe className="h-4 w-4" /> {account.website || "No Website"}</div>
                            <div className="flex items-center gap-1"><Phone className="h-4 w-4" /> {account.phone || "No Phone"}</div>
                        </div>
                        <p className="max-w-3xl text-muted-foreground">{account.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-36">
                        <Button>Create Opportunity</Button>
                        <Button variant="outline">Log Interaction</Button>
                    </div>
                </div>

                {/* 360 Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="uppercase text-xs font-bold text-muted-foreground pb-2">Total Pipeline</CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                ${opportunities.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="uppercase text-xs font-bold text-muted-foreground pb-2">Open Deals</CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{opportunities.filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="uppercase text-xs font-bold text-muted-foreground pb-2">Active Contacts</CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                {contacts.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="uppercase text-xs font-bold text-muted-foreground pb-2">Customer LTV</CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">$0.00</div>
                            <div className="text-xs text-muted-foreground">Lifetime Value</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                        <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Overview</TabsTrigger>
                        <TabsTrigger value="contacts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Contacts ({contacts.length})</TabsTrigger>
                        <TabsTrigger value="opportunities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Opportunities ({opportunities.length})</TabsTrigger>
                        <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Orders</TabsTrigger>
                        <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="col-span-2">
                                <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
                                <CardContent className="text-muted-foreground text-sm">
                                    Activity timeline coming soon...
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Addresses</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="text-xs font-bold text-muted-foreground mb-1">BILLING</div>
                                        <div className="text-sm">
                                            {account.billingStreet}<br />
                                            {account.billingCity}, {account.billingState} {account.billingPostalCode}<br />
                                            {account.billingCountry}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-muted-foreground mb-1">SHIPPING</div>
                                        <div className="text-sm">
                                            {account.shippingStreet || "Same as Billing"}<br />
                                            {account.shippingCity} {account.shippingState} {account.shippingPostalCode}<br />
                                            {account.shippingCountry}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="contacts">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Related Contacts</CardTitle>
                                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Contact</Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contacts.map(contact => (
                                            <TableRow key={contact.id}>
                                                <TableCell className="font-medium">{contact.firstName} {contact.lastName}</TableCell>
                                                <TableCell>{contact.title || "—"}</TableCell>
                                                <TableCell>{contact.email}</TableCell>
                                                <TableCell>{contact.phone}</TableCell>
                                            </TableRow>
                                        ))}
                                        {contacts.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No contacts found</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="opportunities">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Opportunities</CardTitle>
                                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Deal</Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Stage</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Close Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {opportunities.map(opp => (
                                            <TableRow key={opp.id}>
                                                <TableCell className="font-medium">{opp.name}</TableCell>
                                                <TableCell><Badge variant="outline">{opp.stage}</Badge></TableCell>
                                                <TableCell>${formatNumber(Number(opp.amount))}</TableCell>
                                                <TableCell>{formatDate(opp.closeDate!)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {opportunities.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No opportunities found</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}

// Replaced inline SVGs with lucide-react equivalents

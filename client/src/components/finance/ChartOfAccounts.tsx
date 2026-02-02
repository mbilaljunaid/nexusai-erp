import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, FolderTree, Edit2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GlAccount, InsertGlAccount } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGlAccountSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ChartOfAccounts() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: accounts = [], isLoading } = useQuery<GlAccount[]>({
        queryKey: ["/api/gl/accounts"],
        queryFn: () => fetch("/api/gl/accounts").then(res => res.json())
    });

    const form = useForm<InsertGlAccount>({
        resolver: zodResolver(insertGlAccountSchema),
        defaultValues: {
            accountCode: "",
            accountName: "",
            accountType: "Asset",
            parentAccountId: null,
            isActive: true
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: InsertGlAccount) => fetch("/api/gl/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/accounts"] });
            setIsAddOpen(false);
            form.reset();
            toast({ title: "Account created successfully" });
        }
    });

    const filteredAccounts = accounts.filter(acc =>
        acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.accountCode.includes(searchTerm)
    );

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <FolderTree className="h-5 w-5" />
                    Chart of Accounts
                </CardTitle>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Account</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Account</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="accountCode" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="accountName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="accountType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Asset">Asset</SelectItem>
                                                <SelectItem value="Liability">Liability</SelectItem>
                                                <SelectItem value="Equity">Equity</SelectItem>
                                                <SelectItem value="Revenue">Revenue</SelectItem>
                                                <SelectItem value="Expense">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="parentAccountId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent Account (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select parent..." /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>{acc.accountCode} - {acc.accountName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createMutation.isPending}>Create Account</Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="flex items-center mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search accounts..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Parent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                            ) : filteredAccounts.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No accounts found</TableCell></TableRow>
                            ) : (
                                filteredAccounts.map((acc) => (
                                    <TableRow key={acc.id}>
                                        <TableCell className="font-mono">{acc.accountCode}</TableCell>
                                        <TableCell className="font-medium">{acc.accountName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{acc.accountType}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {accounts.find(p => p.id === acc.parentAccountId)?.accountName || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={acc.isActive ? "default" : "secondary"}>
                                                {acc.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

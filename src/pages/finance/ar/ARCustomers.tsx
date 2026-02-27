import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Building, MapPin } from "lucide-react";
import type { ArCustomer, ArCustomerAccount, ArCustomerSite } from "@shared/schema";

export default function ARCustomers() {
  const { toast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Queries
  const { data: customers = [], isLoading: loadingCustomers } = useQuery<ArCustomer[]>({
    queryKey: ["/api/ar/customers"],
  });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<ArCustomerAccount[]>({
    queryKey: ["/api/ar/accounts", { customerId: selectedCustomerId }],
    enabled: !!selectedCustomerId,
  });

  const { data: sites = [], isLoading: loadingSites } = useQuery<ArCustomerSite[]>({
    queryKey: ["/api/ar/sites", { accountId: selectedAccountId }],
    enabled: !!selectedAccountId,
  });

  // Forms
  const customerForm = useForm({
    defaultValues: { name: "", customerType: "Commercial", taxId: "", contactEmail: "" }
  });

  const accountForm = useForm({
    defaultValues: { accountName: "", accountNumber: "", riskCategory: "Low", creditLimit: "10000" }
  });

  const siteForm = useForm({
    defaultValues: { siteName: "", address: "", isBillTo: true, isShipTo: false }
  });

  // Mutations
  const createCustomer = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", "/api/ar/customers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/customers"] });
      toast({ title: "Customer Created" });
    }
  });

  const createAccount = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", "/api/ar/accounts", { ...data, customerId: selectedCustomerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/accounts"] });
      toast({ title: "Account Created" });
    }
  });

  const createSite = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", "/api/ar/sites", { ...data, accountId: selectedAccountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/sites"] });
      toast({ title: "Site Created" });
    }
  });

  // Columns
  const customerCols: Column<ArCustomer>[] = [
    { header: "Customer Name", accessorKey: "name" },
    { header: "Type", accessorKey: "customerType" },
    { header: "Status", accessorKey: "status" },
    { header: "Tax ID", accessorKey: "taxId" },
  ];

  const accountCols: Column<ArCustomerAccount>[] = [
    { header: "Account Number", accessorKey: "accountNumber" },
    { header: "Account Name", accessorKey: "accountName" },
    { header: "Risk", accessorKey: "riskCategory" },
    { header: "Balance", accessorKey: "balance", cell: (row) => `$${Number(row.balance).toFixed(2)}` },
  ];

  const siteCols: Column<ArCustomerSite>[] = [
    { header: "Site Name", accessorKey: "siteName" },
    { header: "Address", accessorKey: "address" },
    { header: "Bill-To", accessorKey: "isBillTo", cell: (r) => r.isBillTo ? "Yes" : "No" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customer Master (TCA)</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Customers (Parties) */}
        <div className="xl:col-span-1 border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> Customers</h2>
            <Dialog>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Customer</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Customer Party</DialogTitle></DialogHeader>
                <Form {...customerForm}>
                  <form onSubmit={customerForm.handleSubmit((d) => createCustomer.mutate({ ...d, contactEmail: d.contactEmail || undefined, taxId: d.taxId || undefined }))} className="space-y-4">
                    <FormField control={customerForm.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <Button type="submit">Save</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <StandardTable
            data={customers}
            columns={customerCols}
            isLoading={loadingCustomers}
            onRowClick={(row) => { setSelectedCustomerId(row.id); setSelectedAccountId(null); }}
            className="w-full"
          />
        </div>

        {/* Accounts */}
        <div className="xl:col-span-1 border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Building className="w-5 h-5" /> Accounts {selectedCustomerId && "(Selected)"}</h2>
            <Dialog>
              <DialogTrigger asChild><Button size="sm" disabled={!selectedCustomerId}><Plus className="w-4 h-4 mr-2" /> New Account</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Customer Account</DialogTitle></DialogHeader>
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit((d) => createAccount.mutate(d))} className="space-y-4">
                    <FormField control={accountForm.control} name="accountName" render={({ field }) => (
                      <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={accountForm.control} name="accountNumber" render={({ field }) => (
                      <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <Button type="submit">Save</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          {selectedCustomerId ? (
            <StandardTable
              data={accounts}
              columns={accountCols}
              isLoading={loadingAccounts}
              onRowClick={(row) => setSelectedAccountId(row.id)}
              className="w-full"
            />
          ) : (
            <div className="text-center text-muted-foreground p-8">Select a customer parameter to view accounts...</div>
          )}
        </div>

        {/* Sites */}
        <div className="xl:col-span-1 border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin className="w-5 h-5" /> Sites {selectedAccountId && "(Selected)"}</h2>
            <Dialog>
              <DialogTrigger asChild><Button size="sm" disabled={!selectedAccountId}><Plus className="w-4 h-4 mr-2" /> New Site</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Customer Site (Address)</DialogTitle></DialogHeader>
                <Form {...siteForm}>
                  <form onSubmit={siteForm.handleSubmit((d) => createSite.mutate(d))} className="space-y-4">
                    <FormField control={siteForm.control} name="siteName" render={({ field }) => (
                      <FormItem><FormLabel>Site Name (Code)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={siteForm.control} name="address" render={({ field }) => (
                      <FormItem><FormLabel>Address (Standard/IBAN)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <Button type="submit">Save</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          {selectedAccountId ? (
            <StandardTable
              data={sites}
              columns={siteCols}
              isLoading={loadingSites}
            />
          ) : (
            <div className="text-center text-muted-foreground p-8">Select an account to view nested sites...</div>
          )}
        </div>

      </div>
    </div>
  );
}

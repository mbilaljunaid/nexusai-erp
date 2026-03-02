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
import { Plus, Users, Building, MapPin, Contact2 } from "lucide-react";
import type { ArCustomer, ArCustomerAccount, ArCustomerSite, ArCustomerContact } from "@shared/schema";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function ARCustomers() {
  const { toast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const { businessUnitId } = useEnterpriseStore();

  // Queries
  const { data: customers = [], isLoading: loadingCustomers } = useQuery<ArCustomer[]>({
    queryKey: ["/api/ar/customers", businessUnitId],
    queryFn: () => fetch("/api/ar/customers", { headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined }).then(r => r.json())
  });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<ArCustomerAccount[]>({
    queryKey: ["/api/ar/accounts", { customerId: selectedCustomerId }, businessUnitId],
    queryFn: () => fetch(`/api/ar/accounts?customerId=${selectedCustomerId}`, { headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined }).then(r => r.json()),
    enabled: !!selectedCustomerId,
  });

  const { data: sites = [], isLoading: loadingSites } = useQuery<ArCustomerSite[]>({
    queryKey: ["/api/ar/sites", { accountId: selectedAccountId }, businessUnitId],
    queryFn: () => fetch(`/api/ar/sites?accountId=${selectedAccountId}`, { headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined }).then(r => r.json()),
    enabled: !!selectedAccountId,
  });

  const { data: contacts = [], isLoading: loadingContacts } = useQuery<ArCustomerContact[]>({
    queryKey: ["/api/ar/contacts", { customerId: selectedCustomerId }, businessUnitId],
    queryFn: () => fetch(`/api/ar/contacts?customerId=${selectedCustomerId}`, { headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined }).then(r => r.json()),
    enabled: !!selectedCustomerId,
  });

  // Forms
  const customerForm = useForm({
    defaultValues: { businessUnitId: "", name: "", customerType: "Commercial", taxId: "", contactEmail: "" }
  });

  const accountForm = useForm({
    defaultValues: { accountName: "", accountNumber: "", riskCategory: "Low", creditLimit: "10000" }
  });

  const siteForm = useForm({
    defaultValues: { orgId: "1", siteName: "", address: "", isBillTo: true, isShipTo: false }
  });

  const contactForm = useForm({
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", role: "BILLING", isPrimary: false, siteId: "" }
  });

  // Mutations
  const createCustomer = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, entBusinessUnitId: businessUnitId };
      return await fetch("/api/ar/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {}) },
        body: JSON.stringify(payload)
      }).then(r => r.json());
    },
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

  const createContact = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", "/api/ar/contacts", { ...data, customerId: selectedCustomerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/contacts"] });
      toast({ title: "Contact Created" });
    }
  });

  // Columns
  const customerCols: Column<ArCustomer>[] = [
    { header: "BU", accessorKey: "businessUnitId", className: "text-muted-foreground font-mono text-xs w-20", cell: (r: any) => r.businessUnitId || "Default" },
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
    { header: "BU", accessorKey: "orgId", className: "text-muted-foreground font-mono text-xs w-16" },
    { header: "Site Name", accessorKey: "siteName" },
    { header: "Address", accessorKey: "address" },
    { header: "Bill-To", accessorKey: "isBillTo", cell: (r) => r.isBillTo ? "Yes" : "No" },
  ];

  const contactCols: Column<ArCustomerContact>[] = [
    { header: "Name", accessorKey: "firstName", cell: (r) => `${r.firstName} ${r.lastName}` },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    { header: "Primary", accessorKey: "isPrimary", cell: (r) => r.isPrimary ? "Yes" : "No" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customer Master (TCA)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Customers (Parties) */}
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> Customers</h2>
            <Dialog>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Customer</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Customer Party</DialogTitle></DialogHeader>
                <Form {...customerForm}>
                  <form onSubmit={customerForm.handleSubmit((d) => createCustomer.mutate({ ...d, contactEmail: d.contactEmail || undefined, taxId: d.taxId || undefined }))} className="space-y-4">
                    <FormField control={customerForm.control} name="businessUnitId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Unit *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select BU..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="BU_US">US Operations</SelectItem>
                            <SelectItem value="BU_EU">EU Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
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
            filterColumn="name"
            filterPlaceholder="Search customers..."
          />
        </div>

        {/* Accounts */}
        <div className="border rounded-lg p-4 bg-card">
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
              filterColumn="accountName"
              filterPlaceholder="Search accounts..."
            />
          ) : (
            <div className="text-center text-muted-foreground p-8">Select a customer parameter to view accounts...</div>
          )}
        </div>

        {/* Sites */}
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin className="w-5 h-5" /> Sites {selectedAccountId && "(Selected)"}</h2>
            <Dialog>
              <DialogTrigger asChild><Button size="sm" disabled={!selectedAccountId}><Plus className="w-4 h-4 mr-2" /> New Site</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Customer Site (Address)</DialogTitle></DialogHeader>
                <Form {...siteForm}>
                  <form onSubmit={siteForm.handleSubmit((d) => createSite.mutate(d))} className="space-y-4">
                    <FormField control={siteForm.control} name="orgId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Unit (Operating Unit) *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select BU..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="1">US Operations (BU_US)</SelectItem>
                            <SelectItem value="2">EU Operations (BU_EU)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
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
              filterColumn="siteName"
              filterPlaceholder="Search sites..."
            />
          ) : (
            <div className="text-center text-muted-foreground p-8">Select an account to view nested sites...</div>
          )}
        </div>

        {/* Contacts */}
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Contact2 className="w-5 h-5" /> Contacts {selectedCustomerId && "(Selected)"}</h2>
            <Dialog>
              <DialogTrigger asChild><Button size="sm" disabled={!selectedCustomerId}><Plus className="w-4 h-4 mr-2" /> New Contact</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Customer Contact</DialogTitle></DialogHeader>
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit((d) => createContact.mutate({ ...d, siteId: d.siteId || undefined }))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={contactForm.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={contactForm.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                    </div>
                    <FormField control={contactForm.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={contactForm.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={contactForm.control} name="role" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="BILLING">Billing Contact</SelectItem>
                            <SelectItem value="DUNNING">Dunning Contact</SelectItem>
                            <SelectItem value="SHIPPING">Shipping Contact</SelectItem>
                            <SelectItem value="PRIMARY">Primary Contact</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <Button type="submit">Save</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          {selectedCustomerId ? (
            <StandardTable
              data={contacts}
              columns={contactCols}
              isLoading={loadingContacts}
              filterColumn="firstName"
              filterPlaceholder="Search contacts..."
            />
          ) : (
            <div className="text-center text-muted-foreground p-8">Select a customer to view linked contacts...</div>
          )}
        </div>

      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Users, Building, MapPin, Contact2 } from "lucide-react";
import type { ArCustomer, ArCustomerAccount, ArCustomerSite, ArCustomerContact } from "@shared/schema";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { StandardPage } from "@/components/layout/StandardPage";

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

  // Schemas
  const customerSchema = z.object({
    businessUnitId: z.string().min(1, "Business Unit is required"),
    name: z.string().min(1, "Name is required"),
    customerType: z.string().min(1, "Customer Type is required"),
    taxId: z.string().optional(),
    contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  });

  const accountSchema = z.object({
    accountName: z.string().min(1, "Account Name is required"),
    accountNumber: z.string().min(1, "Account Number is required"),
    riskCategory: z.string().min(1, "Risk category is required"),
    creditLimit: z.string().min(1, "Credit limit is required"),
  });

  const siteSchema = z.object({
    orgId: z.string().min(1, "BU is required"),
    siteName: z.string().min(1, "Site Name is required"),
    address: z.string().min(1, "Address is required"),
    isBillTo: z.boolean(),
    isShipTo: z.boolean(),
  });

  const contactSchema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    role: z.string().min(1, "Role is required"),
    isPrimary: z.boolean(),
    siteId: z.string().optional(),
  });

  // Forms
  const customerForm = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: { businessUnitId: "", name: "", customerType: "Commercial", taxId: "", contactEmail: "" }
  });

  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: { accountName: "", accountNumber: "", riskCategory: "Low", creditLimit: "10000" }
  });

  const siteForm = useForm<z.infer<typeof siteSchema>>({
    resolver: zodResolver(siteSchema),
    defaultValues: { orgId: "1", siteName: "", address: "", isBillTo: true, isShipTo: false }
  });

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
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
  const customerCols: SpreadsheetColumn<any>[] = [
    { id: "bu", header: "BU", width: "100px", cell: (r: any) => <span className="text-muted-foreground font-mono text-xs">{r.businessUnitId || "Default"}</span> },
    { id: "name", header: "Customer Name", width: "200px", cell: (r: any) => <span>{r.name}</span> },
    { id: "customerType", header: "Type", width: "150px", cell: (r: any) => <span>{r.customerType}</span> },
    { id: "status", header: "Status", width: "150px", cell: (r: any) => <span>{r.status}</span> },
    { id: "taxId", header: "Tax ID", width: "150px", cell: (r: any) => <span>{r.taxId}</span> },
    { id: "actions", header: "Actions", width: "100px", cell: (r: any) => <Button variant="outline" size="sm" onClick={() => { setSelectedCustomerId(r.id); setSelectedAccountId(null); }}>Select</Button> },
  ];

  const accountCols: SpreadsheetColumn<any>[] = [
    { id: "accountNumber", header: "Account Number", width: "150px", cell: (r: any) => <span>{r.accountNumber}</span> },
    { id: "accountName", header: "Account Name", width: "200px", cell: (r: any) => <span>{r.accountName}</span> },
    { id: "riskCategory", header: "Risk", width: "120px", cell: (r: any) => <span>{r.riskCategory}</span> },
    { id: "balance", header: "Balance", width: "120px", cell: (row: any) => <span>${formatCurrency(Number(row.balance))}</span> },
    { id: "actions", header: "Actions", width: "100px", cell: (r: any) => <Button variant="outline" size="sm" onClick={() => setSelectedAccountId(r.id)}>Select</Button> },
  ];

  const siteCols: SpreadsheetColumn<any>[] = [
    { id: "orgId", header: "BU", width: "100px", cell: (r: any) => <span className="text-muted-foreground font-mono text-xs">{r.orgId}</span> },
    { id: "siteName", header: "Site Name", width: "200px", cell: (r: any) => <span>{r.siteName}</span> },
    { id: "address", header: "Address", width: "250px", cell: (r: any) => <span>{r.address}</span> },
    { id: "isBillTo", header: "Bill-To", width: "100px", cell: (r: any) => <span>{r.isBillTo ? "Yes" : "No"}</span> },
  ];

  const contactCols: SpreadsheetColumn<any>[] = [
    { id: "name", header: "Name", width: "200px", cell: (r: any) => <span>{r.firstName} {r.lastName}</span> },
    { id: "email", header: "Email", width: "200px", cell: (r: any) => <span>{r.email}</span> },
    { id: "role", header: "Role", width: "150px", cell: (r: any) => <span>{r.role}</span> },
    { id: "isPrimary", header: "Primary", width: "100px", cell: (r: any) => <span>{r.isPrimary ? "Yes" : "No"}</span> },
  ];

  return (
    <StandardPage
      title="Customer Master (TCA)"
      description="Manage all customer accounts, sites, and contacts"
    >
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
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={customerForm.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" disabled={customerForm.formState.isSubmitting}>
                      {customerForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <InteractiveSpreadsheet
            data={customers}
            columns={customerCols}
            virtualized={true}
            containerHeight="400px"
            onChange={() => { }}
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
                      <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={accountForm.control} name="accountNumber" render={({ field }) => (
                      <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" disabled={customerForm.formState.isSubmitting}>
                      {customerForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          {selectedCustomerId ? (
            <InteractiveSpreadsheet
              data={accounts}
              columns={accountCols}
              virtualized={true}
              containerHeight="400px"
              onChange={() => { }}
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
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={siteForm.control} name="siteName" render={({ field }) => (
                      <FormItem><FormLabel>Site Name (Code)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={siteForm.control} name="address" render={({ field }) => (
                      <FormItem><FormLabel>Address (Standard/IBAN)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" disabled={customerForm.formState.isSubmitting}>
                      {customerForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          {selectedAccountId ? (
            <InteractiveSpreadsheet
              data={sites}
              columns={siteCols}
              virtualized={true}
              containerHeight="400px"
              onChange={() => { }}
            />
          ) : (
            <div className="text-center text-muted-foreground p-8">Select an account to view nested sites...</div>
          )}
        </div>

        {/* Contacts */}
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Contact2 className="w-5 h-5" /> Contacts {selectedCustomerId && "(Selected)"}</h2>
            <Sheet>
              <SheetTrigger asChild><Button size="sm" disabled={!selectedCustomerId}><Plus className="w-4 h-4 mr-2" /> New Contact</Button></SheetTrigger>
              <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
                <SheetHeader><SheetTitle>Create Customer Contact</SheetTitle></SheetHeader>
                <div className="mt-6">
                  <Form {...contactForm}>
                    <form onSubmit={contactForm.handleSubmit((d) => createContact.mutate({ ...d, siteId: d.siteId || undefined }))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={contactForm.control} name="firstName" render={({ field }) => (
                          <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={contactForm.control} name="lastName" render={({ field }) => (
                          <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={contactForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={contactForm.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" disabled={customerForm.formState.isSubmitting}>
                        {customerForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                    </form>
                  </Form>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {selectedCustomerId ? (
            <InteractiveSpreadsheet
              data={contacts}
              columns={contactCols}
              virtualized={true}
              containerHeight="400px"
              onChange={() => { }}
            />
          ) : (
            <div className="text-center text-muted-foreground p-8">Select a customer to view linked contacts...</div>
          )}
        </div>

      </div>
    </StandardPage>
  );
}

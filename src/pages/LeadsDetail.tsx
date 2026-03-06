import { cn } from "@/lib/utils";
import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const leadFormSchema = z.object({
  name: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  leadSource: z.string().optional(),
});
type InsertLead = z.infer<typeof leadFormSchema>;
interface Lead extends InsertLead {
  id: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  createdAt?: string;
}
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Users,
  UserPlus,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

// ... existing subcomponents ...
function LeadConvertModal({ lead, onSuccess }: { lead: Lead; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const convertMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/leads/${lead.id}/convert`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Lead Converted",
        description: `Created Account: ${data.account.name}, Contact: ${data.contact.firstName} ${data.contact.lastName}, Opportunity: ${data.opportunity.name}`
      });
      setOpen(false);
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "Conversion Failed", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="ml-auto" disabled={lead.status === 'converted'}>
          {lead.status === 'converted' ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
          {lead.status === 'converted' ? "Converted" : "Convert"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert Lead</DialogTitle>
          <DialogDescription>
            This will create a new Account, Contact, and Opportunity from this lead.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Company:</strong> {lead.company}</div>
            <div><strong>Name:</strong> {lead.name}</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Account Name will be <strong>{lead.company || lead.name}</strong>.
            Opportunity Name will be <strong>{lead.company || lead.name} - New Opportunity</strong>.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => convertMutation.mutate()} disabled={convertMutation.isPending}>
            {convertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Convert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadEntryForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<InsertLead>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      status: "new"
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      const res = await apiRequest("POST", "/api/leads", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead created successfully" });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/metrics"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const onSubmit = (data: InsertLead) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6 pt-4">
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Core Info */}
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl><Input placeholder="John" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl><Input placeholder="Doe" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name Display *</FormLabel>
              <FormControl><Input placeholder="John Doe" {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl><Input placeholder="Acme Inc" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="CEO" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input placeholder="john@example.com" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input placeholder="+1 555..." {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl><Input placeholder="new" {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="leadSource" render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Source</FormLabel>
              <FormControl><Input placeholder="Web, Referral..." {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button type="submit" disabled={createMutation.isPending} className="w-full">
          {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Lead
        </Button>
      </form>
      </Form>
    </div>
  );
}

export default function LeadsDetail() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    select: (data) => Array.isArray(data) ? data : []
  });

  const metrics = [
    { label: "Total Leads", value: leads.length, icon: Users, color: "text-blue-600" },
    { label: "New Leads", value: leads.filter(l => l.status === 'new').length, icon: Clock, color: "text-orange-600" },
    { label: "Converted", value: leads.filter(l => l.status === 'converted').length, icon: CheckCircle2, color: "text-green-600" },
  ];

  const columns: SpreadsheetColumn<any>[] = [
    {
      id: "name",
      header: "Lead Name",
      width: "35%",
      cell: (lead: any) => (
        <div className="p-2 flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/5 text-primary text-xs">
              {lead.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{lead.name}</div>
            <div className="text-xs text-muted-foreground">{lead.company}</div>
          </div>
        </div>
      )
    },
    {
      id: "status",
      header: "Status",
      width: "20%",
      cell: (lead: any) => (
        <div className="p-2">
          <Badge variant={lead.status === 'converted' ? 'secondary' : 'default'} className={lead.status === 'converted' ? 'bg-green-100/50 text-green-700' : ''}>
            {lead.status}
          </Badge>
        </div>
      )
    },
    {
      id: "contact",
      header: "Contact",
      width: "30%",
      cell: (lead: any) => (
        <div className="p-2 text-sm">
          <div>{lead.email}</div>
          <div className="text-xs text-muted-foreground">{lead.phone}</div>
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      width: "15%",
      cell: (lead: any) => (
        <div role="button" tabIndex={0} className="p-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
          <LeadConvertModal
            lead={lead}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
              queryClient.invalidateQueries({ queryKey: ["/api/crm/metrics"] });
            }}
          />
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="Leads"
      description="Manage and qualify your potential customers."
      breadcrumbs={[
        { label: 'CRM Dashboard', href: '/crm' },
        { label: 'Leads' }
      ]}
      actions={
        <Sheet>
          <SheetTrigger asChild>
            <Button className="shadcn-button-premium">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Lead
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Create New Lead</SheetTitle>
              <SheetDescription>
                Enter the details for the new prospect.
              </SheetDescription>
            </SheetHeader>
            <LeadEntryForm />
          </SheetContent>
        </Sheet>
      }
    >
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
                <div className={cn(`p-2 rounded-xl bg-muted/50 group-hover:scale-110 transition-transform ${m.color}`)}>
                  <m.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="border rounded-md">
          <InteractiveSpreadsheet
            data={leads}
            columns={columns}
            virtualized={true}
            containerHeight="600px"
            onChange={() => { }}
          />
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="sm:max-w-xl w-[90vw]">
          <SheetHeader className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                  {selectedLead?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-2xl font-bold">{selectedLead?.name}</SheetTitle>
                <SheetDescription className="text-base">
                  {selectedLead?.title} at {selectedLead?.company}
                </SheetDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1 font-medium italic">
                {selectedLead?.leadSource || "Direct Traffic"}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                {selectedLead?.status}
              </Badge>
            </div>
          </SheetHeader>

          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact Information</h3>
              <div className="grid grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl border border-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                  <p className="font-medium">{selectedLead?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-medium">{selectedLead?.phone || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Postal Address</p>
                  <p className="font-medium">
                    {selectedLead?.street && `${selectedLead.street}, `}
                    {selectedLead?.city} {selectedLead?.state} {selectedLead?.postalCode}
                    {selectedLead?.country && ` (${selectedLead.country})`}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lead Timeline</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-4 px-2">
                <div className="relative pl-6 pb-4 border-l-2 border-muted/50">
                  <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                  <p className="text-sm font-medium">Lead Created</p>
                  <p className="text-xs text-muted-foreground">Automatic capture via website portal</p>
                </div>
                <div className="relative pl-6 border-l-2 border-transparent">
                  <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-muted border-4 border-background" />
                  <p className="text-sm font-medium text-muted-foreground">Next Step: Qualification</p>
                  <p className="text-xs text-muted-foreground italic">Pending initial outreach...</p>
                </div>
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </StandardPage >
  );
}

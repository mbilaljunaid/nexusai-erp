import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema, type InsertLead, type Lead } from "@shared/schema";
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
    resolver: zodResolver(insertLeadSchema),
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
    <Card>
      <CardHeader>
        <CardTitle>Add New Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Core Info */}
            <div className="space-y-2">
              <Label htmlFor="salutation">Salutation</Label>
              <Input id="salutation" {...form.register("salutation")} placeholder="Mr./Ms." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...form.register("firstName")} placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...form.register("lastName")} placeholder="Doe" />
              {form.formState.errors.lastName && <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name Display *</Label>
              <Input id="name" {...form.register("name")} placeholder="John Doe" />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} placeholder="CEO" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...form.register("company")} placeholder="Acme Inc" />
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...form.register("email")} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} placeholder="+1 555..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobilePhone">Mobile</Label>
              <Input id="mobilePhone" {...form.register("mobilePhone")} placeholder="+1 555..." />
            </div>

            {/* Address Info */}
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input {...form.register("street")} placeholder="Street" className="col-span-2" />
                <Input {...form.register("city")} placeholder="City" />
                <Input {...form.register("state")} placeholder="State" />
                <Input {...form.register("postalCode")} placeholder="Zip" />
                <Input {...form.register("country")} placeholder="Country" />
              </div>
            </div>

            {/* Qualification */}
            <div className="space-y-2">
              <Label htmlFor="leadSource">Lead Source</Label>
              <Input id="leadSource" {...form.register("leadSource")} placeholder="Web, Referral..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" {...form.register("status")} placeholder="new" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...form.register("industry")} placeholder="Tech, Retail..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input id="rating" {...form.register("rating")} placeholder="Hot, Warm, Cold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualRevenue">Annual Revenue</Label>
              <Input id="annualRevenue" type="number" {...form.register("annualRevenue", { valueAsNumber: true })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfEmployees">No. Employees</Label>
              <Input id="numberOfEmployees" type="number" {...form.register("numberOfEmployees", { valueAsNumber: true })} placeholder="0" />
            </div>
          </div>

          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Lead
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LeadsDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    // Use select to handle potential non-array error responses gracefully in UI
    select: (data) => Array.isArray(data) ? data : []
  });

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.company && l.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/crm">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Leads</h1>
          <p className="text-muted-foreground text-sm">Search, view, and create leads</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading leads...</div>
          ) : filteredLeads.length > 0 ? (
            filteredLeads.map((l) => (
              <Card key={l.id} className="hover-elevate cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{l.name}</p>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{l.email || "No email"}</span>
                        {l.company && <span>• {l.company}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={l.status === 'new' ? 'default' : 'secondary'}>{l.status}</Badge>
                      <LeadConvertModal
                        lead={l}
                        onSuccess={() => {
                          queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
                          queryClient.invalidateQueries({ queryKey: ["/api/crm/metrics"] });
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No leads found. Create one below.</div>
          )}
        </div>

        <div className="mt-8 border-t pt-8">
          <LeadEntryForm />
        </div>
      </div>
    </div>
  );
}

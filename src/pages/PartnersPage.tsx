import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Header, Footer } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Partner } from "@/types/erp-types";
import { StandardPage } from "@/components/layout/StandardPage";
import { z } from "zod";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  Award,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Loader2,
  Users,
  Filter
} from "lucide-react";

const tierConfig = {
  diamond: { bg: "bg-cyan-500/10", text: "text-cyan-600", label: "Diamond" },
  platinum: { bg: "bg-slate-400/10", text: "text-slate-600", label: "Platinum" },
  gold: { bg: "bg-yellow-500/10", text: "text-yellow-600", label: "Gold" },
  silver: { bg: "bg-gray-400/10", text: "text-gray-600", label: "Silver" },
};

const partnerApplySchema = z.object({
  type: z.enum(["partner", "trainer"]),
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  specializations: z.string().optional(),
});

export default function PartnersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [applyOpen, setApplyOpen] = useState(false);

  const form = useForm<z.infer<typeof partnerApplySchema>>({
    resolver: zodResolver(partnerApplySchema),
    defaultValues: {
      type: "partner",
      name: "",
      company: "",
      email: "",
      phone: "",
      website: "",
      description: "",
      specializations: "",
    }
  });

  const applyType = form.watch("type");

  useEffect(() => {
    document.title = "Partners & Trainers | NexusAIFirst - Enterprise ERP Platform";
  }, []);

  const { data, isLoading } = useQuery<{ partners: Partner[]; total: number; page: number; totalPages: number }>({
    queryKey: ["/api/partners/public", { type: typeFilter, tier: tierFilter, search, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (tierFilter !== "all") params.append("tier", tierFilter);
      if (search) params.append("search", search);
      params.append("page", String(page));
      params.append("limit", "20");
      const res = await fetch(`/api/partners/public?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch partners");
      return res.json();
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/partners/apply", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Thank you for your interest! We'll review your application and get back to you soon.",
      });
      setApplyOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof partnerApplySchema>) => {
    const specs = (values.specializations || "").split(",").map(s => s.trim()).filter(Boolean);
    applyMutation.mutate({
      ...values,
      specializations: specs,
    });
  };

  const partners = data?.partners || [];
  const totalPages = data?.totalPages || 1;

  return (
    <StandardPage title="Partners & Trainers">
      <Header />

      <main className="flex-1">
        <section className="px-4 py-20 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-blue-600 text-white">ECOSYSTEM</Badge>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Connect with our certified implementation partners and professional trainers
            to accelerate your NexusAIFirst deployment and maximize your platform investment.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Dialog open={applyOpen} onOpenChange={(open) => {
              setApplyOpen(open);
              if (!open) form.reset();
            }}>
              <DialogTrigger asChild>
                <Button size="lg" onClick={() => form.setValue("type", "partner")} data-testid="button-become-partner">
                  <Handshake className="mr-2 w-5 h-5" /> Become a Partner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Apply as {applyType === "partner" ? "Implementation Partner" : "Certified Trainer"}</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to submit your application. We'll review it and get back to you within 5 business days.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-apply-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="partner">Implementation Partner</SelectItem>
                              <SelectItem value="trainer">Certified Trainer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name *</FormLabel>
                          <FormControl>
                            <Input data-testid="input-apply-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input data-testid="input-apply-company" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" data-testid="input-apply-email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input data-testid="input-apply-phone" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input data-testid="input-apply-website" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About You / Company</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us about your experience and expertise..." data-testid="input-apply-description" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specializations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specializations (comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Finance, Manufacturing, Healthcare" data-testid="input-apply-specializations" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={applyMutation.isPending} data-testid="button-submit-application">
                      {applyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Submit Application
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button
              size="lg"
              variant="outline"
              onClick={() => { form.setValue("type", "trainer"); setApplyOpen(true); }}
              data-testid="button-become-trainer"
            >
              <GraduationCap className="mr-2 w-5 h-5" /> Become a Trainer
            </Button>
          </div>
        </section>

        <section className="px-4 py-12 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners and trainers..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  data-testid="input-search-partners"
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-40" data-testid="select-type-filter">
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="partner">Partners</SelectItem>
                    <SelectItem value="trainer">Trainers</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-40" data-testid="select-tier-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : partners.length === 0 ? (
              <div className="text-center py-20">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Partners Found</h3>
                <p className="text-muted-foreground">
                  {search || tierFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Be the first to join our partner ecosystem!"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {partners.map((partner) => {
                    const tier = tierConfig[partner.tier as keyof typeof tierConfig] || tierConfig.silver;
                    return (
                      <Card key={partner.id} className="hover-elevate" data-testid={`card-partner-${partner.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                              {partner.type === "trainer" ? (
                                <GraduationCap className="h-6 w-6 text-muted-foreground" />
                              ) : (
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Badge variant="secondary" className={`${tier.bg} ${tier.text} text-xs`}>
                                <Award className="h-3 w-3 mr-1" />
                                {tier.label}
                              </Badge>
                            </div>
                          </div>
                          <h3 className="font-semibold mb-1">{partner.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{partner.company}</p>
                          {partner.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{partner.description}</p>
                          )}
                          {partner.specializations && partner.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {partner.specializations.slice(0, 3).map((spec, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{spec}</Badge>
                              ))}
                              {partner.specializations.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{partner.specializations.length - 3}</Badge>
                              )}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {partner.email && (
                              <a href={`mailto:${partner.email}`} className="flex items-center gap-1 hover:text-foreground">
                                <Mail className="h-3 w-3" /> Contact
                              </a>
                            )}
                            {partner.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {partner.phone}
                              </span>
                            )}
                            {partner.website && (
                              <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
                                <Globe className="h-3 w-3" /> Website
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm font-medium mx-4">Page {page} of {totalPages}</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </section>

        <section className="px-4 py-20 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Why Partner With NexusAIFirst?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <Award className="h-10 w-10 mx-auto mb-4 text-yellow-500" />
              <h3 className="font-semibold mb-2">Partner Benefits</h3>
              <p className="text-sm text-muted-foreground">
                Access exclusive resources, training materials, lead referrals, and co-marketing opportunities.
              </p>
            </Card>
            <Card className="p-6">
              <Users className="h-10 w-10 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">Growing Ecosystem</h3>
              <p className="text-sm text-muted-foreground">
                Join a thriving community of implementation experts serving enterprises worldwide.
              </p>
            </Card>
            <Card className="p-6">
              <GraduationCap className="h-10 w-10 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">Certification Program</h3>
              <p className="text-sm text-muted-foreground">
                Get certified on NexusAIFirst modules and showcase your expertise to potential clients.
              </p>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </StandardPage>
  );
}

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
import type { Partner } from "@shared/schema";
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

export default function PartnersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyType, setApplyType] = useState<"partner" | "trainer">("partner");
  
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    specializations: "",
  });

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
      setFormData({ name: "", company: "", email: "", phone: "", website: "", description: "", specializations: "" });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const specs = formData.specializations.split(",").map(s => s.trim()).filter(Boolean);
    applyMutation.mutate({
      ...formData,
      type: applyType,
      specializations: specs,
    });
  };

  const partners = data?.partners || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="px-4 py-20 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-blue-600 text-white">ECOSYSTEM</Badge>
          <h1 className="text-5xl font-bold mb-6">Partners & Trainers</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Connect with our certified implementation partners and professional trainers 
            to accelerate your NexusAIFirst deployment and maximize your platform investment.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
              <DialogTrigger asChild>
                <Button size="lg" onClick={() => setApplyType("partner")} data-testid="button-become-partner">
                  <Handshake className="mr-2 w-5 h-5" /> Become a Partner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply as {applyType === "partner" ? "Implementation Partner" : "Certified Trainer"}</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to submit your application. We'll review it and get back to you within 5 business days.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleApply} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Application Type</Label>
                    <Select value={applyType} onValueChange={(v) => setApplyType(v as "partner" | "trainer")}>
                      <SelectTrigger data-testid="select-apply-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partner">Implementation Partner</SelectItem>
                        <SelectItem value="trainer">Certified Trainer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Your Name *</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-apply-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input 
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                      data-testid="input-apply-company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      data-testid="input-apply-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      data-testid="input-apply-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input 
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      data-testid="input-apply-website"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>About You / Company</Label>
                    <Textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell us about your experience and expertise..."
                      data-testid="input-apply-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Specializations (comma-separated)</Label>
                    <Input 
                      value={formData.specializations}
                      onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                      placeholder="e.g. Finance, Manufacturing, Healthcare"
                      data-testid="input-apply-specializations"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={applyMutation.isPending} data-testid="button-submit-application">
                    {applyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Submit Application
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => { setApplyType("trainer"); setApplyOpen(true); }}
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
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                      Page {page} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      data-testid="button-next-page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
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
    </div>
  );
}

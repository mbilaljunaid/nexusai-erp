import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Building2, Package, Headphones, Briefcase, Factory, CreditCard, Truck, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function IndustriesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const createSlug = (name: string) => name.toLowerCase().replace(/[&\s]+/g, '-').replace(/[^a-z0-9-]/g, '');

  useEffect(() => {
    document.title = "Industries | NexusAIFirst - Enterprise Solutions for 41+ Industries";
  }, []);

  const industries = [
    { name: "Automotive", category: "manufacturing", description: "Production, dealer management, service, finance" },
    { name: "Banking & Finance", category: "finance", description: "Core banking, lending, treasury, compliance" },
    { name: "Healthcare", category: "services", description: "Patient management, EMR, pharmacy, billing" },
    { name: "Education", category: "services", description: "Student enrollment, course management, grading" },
    { name: "Retail & E-Commerce", category: "retail", description: "POS, inventory, loyalty, merchandising" },
    { name: "Manufacturing", category: "manufacturing", description: "BOM, production, quality, supply chain" },
    { name: "Logistics & Transportation", category: "logistics", description: "Fleet management, route optimization, tracking" },
    { name: "Telecom", category: "telecom", description: "Subscriber management, billing, network ops" },
    { name: "Insurance", category: "finance", description: "Policy management, claims, underwriting" },
    { name: "Fashion & Apparel", category: "retail", description: "Design, inventory, retail, supply chain" },
    { name: "Government & Public Sector", category: "services", description: "Citizen services, permits, budgeting" },
    { name: "Hospitality & Travel", category: "services", description: "Reservations, guest services, billing" },
    { name: "Pharmaceuticals", category: "manufacturing", description: "Production, R&D, compliance, distribution" },
    { name: "CPG & Food & Beverage", category: "manufacturing", description: "Supply chain, distribution, retail" },
    { name: "Energy & Utilities", category: "manufacturing", description: "Grid management, billing, compliance" },
    { name: "Business Services", category: "services", description: "Consulting, project management, billing" },
    { name: "Real Estate & Construction", category: "logistics", description: "Project management, finance, compliance" },
    { name: "Media & Entertainment", category: "services", description: "Content management, distribution, analytics" },
    { name: "Warehouse & Storage", category: "logistics", description: "Inventory, WMS, distribution" },
    { name: "Wholesale & Distribution", category: "logistics", description: "Procurement, inventory, logistics" },
    { name: "Laboratory Services", category: "services", description: "Testing, quality, compliance reporting" },
    { name: "Equipment Rental", category: "logistics", description: "Asset management, rental, maintenance" },
    { name: "Marine & Shipping", category: "logistics", description: "Vessel management, cargo, compliance" },
    { name: "Training & Development", category: "services", description: "Course delivery, certifications, analytics" },
    { name: "Vehicle & Auto Rental", category: "logistics", description: "Fleet management, billing, maintenance" },
    { name: "Mortgage & Lending", category: "finance", description: "Loan origination, servicing, compliance" },
    { name: "Credit & Collections", category: "finance", description: "Credit management, collections, analytics" },
    { name: "Freight & Cargo", category: "logistics", description: "Booking, tracking, billing" },
    { name: "Export & Import", category: "logistics", description: "Documentation, compliance, logistics" },
    { name: "Events & Conferences", category: "services", description: "Registration, ticketing, analytics" },
    { name: "Marketing & Advertising", category: "services", description: "Campaign management, analytics, ROI" },
    { name: "Property Management", category: "logistics", description: "Tenant management, billing, maintenance" },
    { name: "Security & Defense", category: "services", description: "Personnel management, compliance, reporting" },
    { name: "Portal & Digital Services", category: "services", description: "User management, digital workflows" },
    { name: "Audit & Compliance", category: "services", description: "Compliance tracking, audit trails" },
    { name: "Carrier & Shipping", category: "logistics", description: "Shipment management, tracking, billing" },
    { name: "Clinical Research", category: "services", description: "Study management, patient tracking, compliance" },
    { name: "Finance & Investment", category: "finance", description: "Portfolio management, analytics, compliance" },
    { name: "Laboratory Technology", category: "manufacturing", description: "Equipment management, data, compliance" },
    { name: "Pharmacy & Retail", category: "retail", description: "Inventory, prescription management, POS" },
    { name: "Shipment Management", category: "logistics", description: "Tracking, routing, compliance" },
  ];

  const categories = [
    { id: "all", label: "All Industries", icon: Briefcase },
    { id: "manufacturing", label: "Manufacturing", icon: Factory },
    { id: "retail", label: "Retail & Commerce", icon: Package },
    { id: "finance", label: "Finance & Banking", icon: CreditCard },
    { id: "logistics", label: "Logistics & Supply", icon: Truck },
    { id: "services", label: "Services", icon: Headphones },
    { id: "telecom", label: "Telecom & Tech", icon: Radio },
  ];

  const filtered = selectedCategory === "all" 
    ? industries 
    : industries.filter(ind => ind.category === selectedCategory);

  return (
    <div className="public-page min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-16 border-b bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <Badge className="mb-4" style={{ backgroundColor: `hsl(var(--primary) / 0.1)`, color: `hsl(var(--primary))` }}>
              INDUSTRIES
            </Badge>
            <h1 className="text-5xl font-bold mb-4" style={{ 
              background: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--chart-1)))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Enterprise Solutions for 41+ Industries
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Tailored ERP, CRM, and automation solutions designed for your industry's unique challenges
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-4 py-12 border-b">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.id)}
                    data-testid={`button-category-${cat.id}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Industries Grid */}
        <section className="px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
              {filtered.map((industry, idx) => (
                <Link to={`/industry/${createSlug(industry.name)}`} key={idx}>
                  <Card
                    className="hover-elevate p-4 cursor-pointer h-full"
                    data-testid={`card-industry-${industry.name.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <h3 className="text-lg font-bold mb-2">{industry.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{industry.description}</p>
                    <Button size="sm" variant="outline" className="w-full" data-testid={`button-view-${industry.name.replace(/\s+/g, '-').toLowerCase()}`}>
                      View Details <ArrowRight className="ml-2 w-3 h-3" />
                    </Button>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-2 gap-12 py-20 border-t">
              <div>
                <h2 className="text-3xl font-bold mb-6">Industry-Specific Solutions</h2>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span style={{ color: `hsl(var(--primary))` }}>✓</span>
                    <span>Pre-configured workflows for your industry</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: `hsl(var(--primary))` }}>✓</span>
                    <span>Compliance and regulatory requirements built-in</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: `hsl(var(--primary))` }}>✓</span>
                    <span>Industry best practices and templates</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: `hsl(var(--primary))` }}>✓</span>
                    <span>Vertical-specific modules and features</span>
                  </li>
                </ul>
              </div>
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Explore?</h3>
                <p className="text-muted-foreground mb-6">
                  Select your industry to see how NexusAIFirst transforms operations, reduces costs, and drives growth
                </p>
                <Link to="/demo">
                  <Button className="w-full" data-testid="button-request-demo-industries">
                    Request Demo <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

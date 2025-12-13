import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Building2, Package, Headphones, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function IndustriesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const createSlug = (name: string) => name.toLowerCase().replace(/[&\s]+/g, '-').replace(/[^a-z0-9-]/g, '');

  useEffect(() => {
    document.title = "Industries | NexusAI - Enterprise Solutions for 41+ Industries";
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
    { id: "manufacturing", label: "Manufacturing", icon: Package },
    { id: "retail", label: "Retail & Commerce", icon: Building2 },
    { id: "finance", label: "Finance & Banking", icon: Briefcase },
    { id: "logistics", label: "Logistics & Supply", icon: Building2 },
    { id: "services", label: "Services", icon: Headphones },
    { id: "telecom", label: "Telecom & Tech", icon: Building2 },
  ];

  const filtered = selectedCategory === "all" 
    ? industries 
    : industries.filter(ind => ind.category === selectedCategory);

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <section className="px-4 py-16 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-500/50">INDUSTRIES</Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Enterprise Solutions for 41+ Industries
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Tailored ERP, CRM, and automation solutions designed for your industry's unique challenges
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 py-12 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
                data-testid={`button-category-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
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
                  className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all p-4 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 h-full"
                  data-testid={`card-industry-${industry.name.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <h3 className="text-lg font-bold text-white mb-2">{industry.name}</h3>
                  <p className="text-sm text-slate-300 mb-4">{industry.description}</p>
                  <Button size="sm" variant="outline" className="w-full text-blue-400 border-blue-500 hover:bg-blue-500/10" data-testid={`button-view-${industry.name.replace(/\s+/g, '-').toLowerCase()}`}>
                    View Details <ArrowRight className="ml-2 w-3 h-3" />
                  </Button>
                </Card>
              </Link>
            ))}
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-12 py-20 border-t border-slate-700">
            <div>
              <h2 className="text-3xl font-bold mb-6">Industry-Specific Solutions</h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>Pre-configured workflows for your industry</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>Compliance and regulatory requirements built-in</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>Industry best practices and templates</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>Vertical-specific modules and features</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Ready to Explore?</h3>
              <p className="text-slate-300 mb-6">
                Select your industry to see how NexusAI transforms operations, reduces costs, and drives growth
              </p>
              <Link to="/demo">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-request-demo-industries">
                  Request Demo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState, useMemo } from "react";
import { Header, Footer } from "@/components/Navigation";
import { GraduationCap, ArrowLeft, ArrowRight, Factory, Settings, Layers, ClipboardCheck, Calendar, Wrench } from "lucide-react";
import { TrainingFilters, type SkillLevel, getSkillLevelBadgeColor } from "@/components/TrainingFilters";
import { type EnterpriseRole } from "@/components/RBACContext";

interface ModuleData {
  icon: typeof Factory;
  title: string;
  desc: string;
  duration: string;
  href: string;
  skillLevel: SkillLevel;
  allowedRoles: EnterpriseRole[];
}

export default function TrainingGuideManufacturing() {
  useEffect(() => {
    document.title = "Manufacturing Training Guide | NexusAI ERP";
  }, []);

  const [selectedRole, setSelectedRole] = useState<EnterpriseRole | "all">("all");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | "all">("all");

  const modules: ModuleData[] = [
    { icon: Layers, title: "Bill of Materials", desc: "BOM creation, versions, and engineering changes", duration: "50 min", href: "/docs/training-guides/manufacturing/bill-of-materials", skillLevel: "intermediate", allowedRoles: ["business_user", "business_analyst", "tenant_admin", "implementation_partner", "platform_admin", "super_admin"] },
    { icon: Settings, title: "Routing & Work Centers", desc: "Production routing, capacity, and scheduling", duration: "45 min", href: "/docs/training-guides/manufacturing/routing-work-centers", skillLevel: "intermediate", allowedRoles: ["business_user", "business_analyst", "tenant_admin", "implementation_partner", "platform_admin", "super_admin"] },
    { icon: Factory, title: "Work Orders", desc: "Order creation, release, and shop floor execution", duration: "55 min", href: "/docs/training-guides/manufacturing/work-orders", skillLevel: "intermediate", allowedRoles: ["business_user", "end_user", "business_analyst", "tenant_admin", "implementation_partner", "platform_admin", "super_admin"] },
    { icon: Calendar, title: "MRP & Planning", desc: "Material requirements planning and scheduling", duration: "60 min", href: "/docs/training-guides/manufacturing/mrp-planning", skillLevel: "advanced", allowedRoles: ["business_analyst", "tenant_admin", "implementation_partner", "platform_admin", "super_admin"] },
    { icon: ClipboardCheck, title: "Quality Control", desc: "Inspection plans, NCR, and quality metrics", duration: "40 min", href: "/docs/training-guides/manufacturing/quality-control", skillLevel: "intermediate", allowedRoles: ["business_user", "business_analyst", "tenant_admin", "implementation_partner", "platform_admin", "super_admin"] },
    { icon: Wrench, title: "Maintenance", desc: "Preventive maintenance and equipment tracking", duration: "35 min", href: "/docs/training-guides/manufacturing/maintenance", skillLevel: "intermediate", allowedRoles: ["business_user", "end_user", "business_analyst", "tenant_admin", "implementation_partner", "platform_admin", "super_admin"] },
  ];

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      if (selectedSkillLevel !== "all" && mod.skillLevel !== selectedSkillLevel) {
        return false;
      }
      if (selectedRole !== "all" && !mod.allowedRoles.includes(selectedRole)) {
        return false;
      }
      return true;
    });
  }, [selectedRole, selectedSkillLevel]);

  const clearFilters = () => {
    setSelectedRole("all");
    setSelectedSkillLevel("all");
  };

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-16 max-w-5xl mx-auto">
          <Link to="/docs/training-guides">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Training Guides
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <GraduationCap className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <Badge className="mb-2">TRAINING</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Manufacturing Training Guide</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Complete training program for the Manufacturing module covering BOM, 
            production planning, shop floor execution, and quality control.
          </p>
        </section>

        <section className="px-4 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Training Modules</h2>

          <TrainingFilters
            selectedRole={selectedRole}
            selectedModule="all"
            selectedSkillLevel={selectedSkillLevel}
            onRoleChange={setSelectedRole}
            onModuleChange={() => {}}
            onSkillLevelChange={setSelectedSkillLevel}
            onClearFilters={clearFilters}
            showModuleFilter={false}
          />

          {filteredModules.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No training modules match the selected filters.</p>
              <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters-empty">
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredModules.map((item, index) => (
                <Link key={index} to={item.href} className="block">
                  <Card className="transition-all duration-200 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer" data-testid={`card-module-${index}`}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Badge className={getSkillLevelBadgeColor(item.skillLevel)}>
                        {item.skillLevel.charAt(0).toUpperCase() + item.skillLevel.slice(1)}
                      </Badge>
                      <Badge variant="outline">{item.duration}</Badge>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Total training time: approximately 5 hours
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to={modules[0].href}>
                <Button size="lg" data-testid="button-start-training">
                  Start Training
                </Button>
              </Link>
              <Link to="/docs/training-guides">
                <Button size="lg" variant="outline" data-testid="button-view-all">
                  View All Guides
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

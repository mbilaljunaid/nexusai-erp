import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  Users, 
  DollarSign, 
  Package, 
  Factory, 
  BarChart3,
  Clock,
  CheckCircle,
  PlayCircle,
  FileText,
  Award,
  ArrowRight
} from "lucide-react";

export default function TrainingGuidesPage() {
  useEffect(() => {
    document.title = "Training Guides | NexusAI ERP Documentation";
  }, []);

  const trainingModules = [
    { icon: Users, title: "CRM Training", desc: "Master customer relationship management", duration: "4 hours", lessons: 12, href: "/docs/training-guides/crm" },
    { icon: DollarSign, title: "Finance Training", desc: "Learn financial management and reporting", duration: "6 hours", lessons: 18, href: "/docs/training-guides/finance" },
    { icon: Package, title: "Inventory Training", desc: "Stock management and warehouse operations", duration: "3 hours", lessons: 10, href: "/docs/training-guides/inventory" },
    { icon: Factory, title: "Manufacturing Training", desc: "Production planning and execution", duration: "5 hours", lessons: 15, href: "/docs/training-guides/manufacturing" },
    { icon: BarChart3, title: "Analytics Training", desc: "Business intelligence and reporting", duration: "3 hours", lessons: 8, href: "/docs/training-guides/analytics" },
    { icon: Users, title: "HR & Payroll Training", desc: "Human resources management", duration: "4 hours", lessons: 14, href: "/docs/training-guides/hr" },
  ];

  const learningPaths = [
    { title: "New User Onboarding", duration: "2 hours", level: "Beginner", modules: 5 },
    { title: "Finance Professional", duration: "8 hours", level: "Intermediate", modules: 12 },
    { title: "System Administrator", duration: "10 hours", level: "Advanced", modules: 15 },
    { title: "Power User", duration: "6 hours", level: "Intermediate", modules: 10 },
  ];

  const trainingFormats = [
    { icon: Video, title: "Video Tutorials", desc: "Step-by-step video walkthroughs" },
    { icon: BookOpen, title: "Written Guides", desc: "Detailed documentation with screenshots" },
    { icon: PlayCircle, title: "Interactive Labs", desc: "Hands-on practice environments" },
    { icon: Award, title: "Certifications", desc: "Validate your NexusAI expertise" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-16 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-orange-600 text-white" data-testid="badge-training">TRAINING CENTER</Badge>
          <h1 className="text-5xl font-bold mb-6" data-testid="text-page-title">Training Guides</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Comprehensive training resources to help you and your team master NexusAI ERP. 
            From beginner tutorials to advanced certifications.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/docs/training-guides/crm">
              <Button size="lg" data-testid="button-start-learning">
                <GraduationCap className="mr-2 w-5 h-5" /> Start Learning
              </Button>
            </Link>
            <Button size="lg" variant="outline" data-testid="button-view-paths">
              <BookOpen className="mr-2 w-5 h-5" /> View Learning Paths
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 py-12 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <Card className="p-6" data-testid="stat-modules">
                <div className="text-4xl font-bold text-blue-500 mb-2">50+</div>
                <div className="text-muted-foreground">Training Modules</div>
              </Card>
              <Card className="p-6" data-testid="stat-hours">
                <div className="text-4xl font-bold text-green-500 mb-2">40+</div>
                <div className="text-muted-foreground">Hours of Content</div>
              </Card>
              <Card className="p-6" data-testid="stat-lessons">
                <div className="text-4xl font-bold text-purple-500 mb-2">200+</div>
                <div className="text-muted-foreground">Lessons</div>
              </Card>
              <Card className="p-6" data-testid="stat-certs">
                <div className="text-4xl font-bold text-orange-500 mb-2">6</div>
                <div className="text-muted-foreground">Certifications</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Training Modules */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Training Modules</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose a module to begin your training journey
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingModules.map((module, i) => {
              const IconComponent = module.icon;
              return (
                <Link key={i} to={module.href}>
                  <Card className="p-6 h-full hover-elevate cursor-pointer" data-testid={`card-module-${i}`}>
                    <IconComponent className="w-10 h-10 mb-4 text-orange-500" />
                    <h3 className="font-bold text-lg mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{module.desc}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" /> {module.duration}
                      </div>
                      <Badge variant="secondary">{module.lessons} lessons</Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Learning Paths */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">Learning Paths</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Structured learning journeys tailored to your role
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learningPaths.map((path, i) => (
                <Card key={i} className="p-6" data-testid={`card-path-${i}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{path.title}</h3>
                    <Badge className={
                      path.level === "Beginner" ? "bg-green-500 text-white" :
                      path.level === "Intermediate" ? "bg-blue-500 text-white" :
                      "bg-purple-500 text-white"
                    }>{path.level}</Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {path.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" /> {path.modules} modules
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Training Formats */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Training Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainingFormats.map((format, i) => {
              const IconComponent = format.icon;
              return (
                <Card key={i} className="p-6 text-center" data-testid={`card-format-${i}`}>
                  <IconComponent className="w-10 h-10 mx-auto mb-4 text-blue-500" />
                  <h3 className="font-bold text-lg mb-2">{format.title}</h3>
                  <p className="text-sm text-muted-foreground">{format.desc}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Start */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Quick Start Checklist</h2>
                  <p className="text-muted-foreground">
                    New to NexusAI? Follow these steps to get started quickly.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-sm">Complete the New User Onboarding path</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                  <span className="text-sm">Choose your role-specific training module</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                  <span className="text-sm">Practice in the interactive lab environment</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">4</span>
                  <span className="text-sm">Earn your NexusAI certification</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 bg-gradient-to-br from-orange-600 to-red-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Become a NexusAI Expert?</h2>
            <p className="text-lg text-white/80 mb-8">
              Start your training journey today and unlock the full potential of NexusAI ERP.
            </p>
            <Link to="/docs/training-guides/crm">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100" data-testid="button-begin-training">
                Begin Training <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

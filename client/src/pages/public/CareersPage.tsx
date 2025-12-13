import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  Users, 
  Code2, 
  Video, 
  FileText, 
  BarChart3, 
  Palette, 
  Server, 
  Shield, 
  MessageSquare,
  Heart,
  GitBranch,
  CheckCircle,
  ArrowRight,
  Clock,
  Globe,
  Zap
} from "lucide-react";

interface ContributorRole {
  icon: typeof Users;
  title: string;
  color: string;
  contributions: string[];
  goodFit: string[];
}

export default function CareersPage() {
  useEffect(() => {
    document.title = "Careers - Open Source Contributors | NexusAI ERP";
  }, []);

  const contributorRoles: ContributorRole[] = [
    {
      icon: CheckCircle,
      title: "Quality Assurance & Testing Contributors",
      color: "green",
      contributions: [
        "Test new features and enhancements across modules",
        "Create and execute test cases (manual and automated where applicable)",
        "Validate bug fixes and regressions",
        "Report issues with clear reproduction steps"
      ],
      goodFit: [
        "Enjoy breaking software to make it better",
        "Have experience testing business applications or ERPs",
        "Are comfortable working with GitHub Issues"
      ]
    },
    {
      icon: Code2,
      title: "Software Development Contributors",
      color: "blue",
      contributions: [
        "Implement new features and enhancements",
        "Improve existing modules without introducing new scope",
        "Fix bugs and performance issues",
        "Review and refactor code for maintainability"
      ],
      goodFit: [
        "Are comfortable with collaborative, PR-based development",
        "Value clean, readable, and maintainable code",
        "Enjoy building practical, production-oriented systems"
      ]
    },
    {
      icon: Video,
      title: "Training Video Creator / Editor",
      color: "purple",
      contributions: [
        "Create short walkthroughs of features and workflows",
        "Edit and improve existing training videos",
        "Help explain complex processes in a simple, visual way",
        "Align training content with actual system behavior"
      ],
      goodFit: [
        "Enjoy teaching and knowledge sharing",
        "Have experience with screen recording and video editing",
        "Can translate technical workflows into user-friendly explanations"
      ]
    },
    {
      icon: FileText,
      title: "Documentation Contributors",
      color: "orange",
      contributions: [
        "Update documentation as features evolve",
        "Validate documentation against real system behavior",
        "Improve clarity, structure, and accuracy",
        "Add examples, screenshots, and usage notes"
      ],
      goodFit: [
        "Care about accuracy and clarity",
        "Prefer improving existing content rather than creating from scratch",
        "Enjoy helping others understand systems faster"
      ]
    },
    {
      icon: BarChart3,
      title: "Product & Functional Analysis Contributors",
      color: "cyan",
      contributions: [
        "Review workflows from a business and functional perspective",
        "Validate ERP processes against real-world scenarios",
        "Suggest refinements without expanding scope unnecessarily",
        "Help ensure features remain practical and usable"
      ],
      goodFit: [
        "Have ERP, accounting, planning, or industry domain experience",
        "Think in processes, not just screens",
        "Enjoy aligning software with real operational needs"
      ]
    },
    {
      icon: Palette,
      title: "UX / UI Design Contributors",
      color: "pink",
      contributions: [
        "Review user flows and screen layouts",
        "Suggest usability and accessibility improvements",
        "Help simplify complex workflows",
        "Provide design feedback aligned with ERP users"
      ],
      goodFit: [
        "Care about usability in complex business software",
        "Prefer iterative improvements over full redesigns",
        "Enjoy working with developers to refine experiences"
      ]
    },
    {
      icon: Server,
      title: "DevOps & Infrastructure Contributors",
      color: "yellow",
      contributions: [
        "Improve CI/CD pipelines",
        "Help with deployment and environment setup",
        "Enhance monitoring, logging, and system reliability",
        "Optimize developer experience"
      ],
      goodFit: [
        "Enjoy infrastructure and automation",
        "Have experience with cloud or containerized environments",
        "Prefer enabling others to ship reliably"
      ]
    },
    {
      icon: Shield,
      title: "Security & Access Control Reviewers",
      color: "red",
      contributions: [
        "Review authentication and authorization flows",
        "Validate role-based access control",
        "Identify potential security gaps",
        "Suggest improvements aligned with best practices"
      ],
      goodFit: [
        "Have experience in application security or compliance",
        "Enjoy threat modeling and risk analysis",
        "Prefer preventive improvements over reactive fixes"
      ]
    },
    {
      icon: MessageSquare,
      title: "Community & Collaboration Contributors",
      color: "indigo",
      contributions: [
        "Help triage GitHub issues",
        "Improve contribution guidelines",
        "Support new contributors",
        "Review pull requests for consistency and clarity"
      ],
      goodFit: [
        "Enjoy open-source collaboration",
        "Like helping communities grow sustainably",
        "Prefer coordination and structure over coding"
      ]
    }
  ];

  const philosophy = [
    { icon: Clock, text: "No fixed hours or employment commitments" },
    { icon: GitBranch, text: "Contributions are reviewed via pull requests" },
    { icon: Zap, text: "Small, focused contributions are welcome" },
    { icon: Heart, text: "Practical impact matters more than volume" }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { badge: string; icon: string; border: string }> = {
      green: { badge: "bg-green-600 text-white", icon: "text-green-500", border: "border-green-500/30" },
      blue: { badge: "bg-blue-600 text-white", icon: "text-blue-500", border: "border-blue-500/30" },
      purple: { badge: "bg-purple-600 text-white", icon: "text-purple-500", border: "border-purple-500/30" },
      orange: { badge: "bg-orange-600 text-white", icon: "text-orange-500", border: "border-orange-500/30" },
      cyan: { badge: "bg-cyan-600 text-white", icon: "text-cyan-500", border: "border-cyan-500/30" },
      pink: { badge: "bg-pink-600 text-white", icon: "text-pink-500", border: "border-pink-500/30" },
      yellow: { badge: "bg-yellow-600 text-white", icon: "text-yellow-500", border: "border-yellow-500/30" },
      red: { badge: "bg-red-600 text-white", icon: "text-red-500", border: "border-red-500/30" },
      indigo: { badge: "bg-indigo-600 text-white", icon: "text-indigo-500", border: "border-indigo-500/30" }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="px-4 py-16 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-blue-600 text-white" data-testid="badge-careers">OPEN SOURCE</Badge>
          <h1 className="text-5xl font-bold mb-6" data-testid="text-page-title">Open-Source Contributor Call</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Nexus AI First is an open-source ERP initiative, and we welcome contributors from diverse backgrounds.
            Whether you contribute code, documentation, testing, design, or domain expertise, your contributions help shape a practical, real-world ERP platform.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
              <Button size="lg" data-testid="button-view-github">
                <GitBranch className="mr-2 w-5 h-5" /> View on GitHub
              </Button>
            </a>
            <Link to="/docs/contributing">
              <Button size="lg" variant="outline" data-testid="button-contribution-guide">
                <FileText className="mr-2 w-5 h-5" /> Contribution Guide
              </Button>
            </Link>
          </div>
        </section>

        <section className="px-4 py-12 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <Card className="p-6" data-testid="stat-roles">
                <div className="text-4xl font-bold text-blue-500 mb-2">9</div>
                <div className="text-muted-foreground">Contributor Roles</div>
              </Card>
              <Card className="p-6" data-testid="stat-modules">
                <div className="text-4xl font-bold text-green-500 mb-2">18+</div>
                <div className="text-muted-foreground">ERP Modules</div>
              </Card>
              <Card className="p-6" data-testid="stat-flexibility">
                <div className="text-4xl font-bold text-purple-500 mb-2">100%</div>
                <div className="text-muted-foreground">Remote & Flexible</div>
              </Card>
              <Card className="p-6" data-testid="stat-open">
                <Globe className="w-10 h-10 mx-auto mb-2 text-orange-500" />
                <div className="text-muted-foreground">Open to Everyone</div>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Contribution Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {philosophy.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <Card key={i} className="p-4 flex items-center gap-4" data-testid={`card-philosophy-${i}`}>
                    <IconComponent className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    <p className="text-sm">{item.text}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Contributor Roles</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Contributions can be part-time, asynchronous, and remote, and range from small fixes to long-term ownership of modules.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contributorRoles.map((role, i) => {
              const IconComponent = role.icon;
              const colorClasses = getColorClasses(role.color);
              return (
                <Card key={i} className={`p-6 border-l-4 ${colorClasses.border}`} data-testid={`card-role-${i}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <IconComponent className={`w-8 h-8 ${colorClasses.icon} flex-shrink-0`} />
                    <div>
                      <h3 className="font-bold text-lg">{role.title}</h3>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">How you can contribute:</h4>
                    <ul className="space-y-1">
                      {role.contributions.map((item, j) => (
                        <li key={j} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Good fit if you:</h4>
                    <ul className="space-y-1">
                      {role.goodFit.map((item, j) => (
                        <li key={j} className="text-sm flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-16 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Contribute?</h2>
            <p className="text-lg text-white/80 mb-8">
              Join our community of contributors and help shape the future of open-source ERP.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100" data-testid="button-get-started">
                  Get Started on GitHub <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <Link to="/docs/contributing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-read-guide">
                  Read Contribution Guide
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

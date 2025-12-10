import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  Github, 
  GitPullRequest, 
  Bug, 
  Lightbulb, 
  FileText, 
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Code2,
  BookOpen,
  Heart,
  ExternalLink
} from "lucide-react";

export default function ContributingPage() {
  useEffect(() => {
    document.title = "Contributing | NexusAI Open Source";
  }, []);

  const steps = [
    { num: 1, title: "Fork the Repository", desc: "Create your own copy of NexusAI on GitHub" },
    { num: 2, title: "Create a Branch", desc: "Make a new branch for your feature or fix" },
    { num: 3, title: "Make Changes", desc: "Implement your improvements following our guidelines" },
    { num: 4, title: "Test Thoroughly", desc: "Ensure all tests pass and add new ones if needed" },
    { num: 5, title: "Submit PR", desc: "Open a pull request with a clear description" },
    { num: 6, title: "Code Review", desc: "Collaborate with maintainers to refine your contribution" },
  ];

  const guidelines = [
    { icon: Code2, title: "Code Style", items: ["Follow existing patterns", "Use TypeScript strictly", "Write meaningful comments", "Keep functions small"] },
    { icon: FileText, title: "Documentation", items: ["Update README if needed", "Document new features", "Add JSDoc comments", "Include examples"] },
    { icon: Bug, title: "Testing", items: ["Write unit tests", "Test edge cases", "Run full test suite", "Add integration tests"] },
    { icon: MessageSquare, title: "Communication", items: ["Clear PR descriptions", "Respond to feedback", "Be respectful", "Ask questions"] },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-16 text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-purple-600 text-white">CONTRIBUTING GUIDE</Badge>
          <h1 className="text-5xl font-bold mb-6">Contribute to NexusAI</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Thank you for your interest in contributing! This guide will help you get started 
            with contributing to NexusAI.
          </p>
          <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
            <Button size="lg" data-testid="button-view-repo">
              <Github className="mr-2 w-5 h-5" /> View Repository
            </Button>
          </a>
        </section>

        {/* Ways to Contribute */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Ways to Contribute</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <Bug className="w-8 h-8 mb-4 text-red-500" />
                <h3 className="font-bold text-lg mb-2">Report Bugs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Found a bug? Open an issue with detailed reproduction steps.
                </p>
                <Badge variant="outline">Good First Contribution</Badge>
              </Card>
              <Card className="p-6">
                <Lightbulb className="w-8 h-8 mb-4 text-yellow-500" />
                <h3 className="font-bold text-lg mb-2">Suggest Features</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Have an idea? Open a discussion or feature request issue.
                </p>
                <Badge variant="outline">Community Input</Badge>
              </Card>
              <Card className="p-6">
                <GitPullRequest className="w-8 h-8 mb-4 text-green-500" />
                <h3 className="font-bold text-lg mb-2">Submit Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Fix bugs, add features, or improve performance.
                </p>
                <Badge variant="outline">Core Contribution</Badge>
              </Card>
              <Card className="p-6">
                <BookOpen className="w-8 h-8 mb-4 text-blue-500" />
                <h3 className="font-bold text-lg mb-2">Improve Docs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Help others by improving documentation and guides.
                </p>
                <Badge variant="outline">High Impact</Badge>
              </Card>
            </div>
          </div>
        </section>

        {/* Contribution Process */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Contribution Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => (
              <Card key={step.num} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                </div>
                <p className="text-muted-foreground">{step.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Guidelines */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Contribution Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {guidelines.map((guide, i) => {
                const IconComponent = guide.icon;
                return (
                  <Card key={i} className="p-6">
                    <IconComponent className="w-8 h-8 mb-4 text-blue-500" />
                    <h3 className="font-bold text-lg mb-4">{guide.title}</h3>
                    <ul className="space-y-2">
                      {guide.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Code of Conduct */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <Heart className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Code of Conduct</h2>
                <p className="text-muted-foreground">
                  We are committed to providing a welcoming and inclusive environment for all contributors.
                </p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Be respectful and inclusive in all interactions</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Welcome newcomers and help them get started</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Focus on constructive feedback and collaboration</p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Report violations to maintainers@nexusai.com</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="/code-of-conduct">
                Read Full Code of Conduct <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </Card>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Contribute?</h2>
            <p className="text-lg text-white/80 mb-8">
              Join our growing community of contributors and help shape the future of enterprise ERP.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="https://github.com/mbilaljunaid/nexusai-erp/fork" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100" data-testid="button-fork-repo">
                  Fork Repository
                </Button>
              </a>
              <a href="https://github.com/mbilaljunaid/nexusai-erp/issues" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-view-issues">
                  View Open Issues
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

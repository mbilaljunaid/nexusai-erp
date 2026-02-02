import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  Mail, 
  CheckCircle, 
  Clock,
  Eye,
  FileWarning,
  ExternalLink
} from "lucide-react";

export default function SecurityPolicyPage() {
  useEffect(() => {
    document.title = "Security Policy | NexusAIFirst";
  }, []);

  const reportingSteps = [
    { num: 1, title: "Do Not Disclose Publicly", desc: "Please do not create public GitHub issues for security vulnerabilities" },
    { num: 2, title: "Contact Security Team", desc: "Use our secure contact form with 'SECURITY' in the subject" },
    { num: 3, title: "Provide Details", desc: "Include reproduction steps, affected versions, and potential impact" },
    { num: 4, title: "Wait for Response", desc: "We aim to respond within 48 hours of receiving your report" },
  ];

  const securityFeatures = [
    { icon: Lock, title: "Encryption at Rest", desc: "All sensitive data is encrypted using AES-256" },
    { icon: Shield, title: "Encryption in Transit", desc: "TLS 1.3 for all network communications" },
    { icon: Eye, title: "Audit Logging", desc: "Comprehensive logging of all security events" },
    { icon: CheckCircle, title: "RBAC", desc: "Role-based access control with principle of least privilege" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-16 text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-red-600 text-white">SECURITY</Badge>
          <h1 className="text-5xl font-bold mb-6">Security Policy</h1>
          <p className="text-xl text-muted-foreground mb-8">
            We take security seriously. This page describes our security practices and 
            how to responsibly report vulnerabilities.
          </p>
        </section>

        {/* Reporting Vulnerabilities */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
              <h2 className="text-3xl font-bold">Reporting Security Vulnerabilities</h2>
            </div>

            <Card className="p-6 mb-8 border-yellow-500/50 bg-yellow-500/5">
              <p className="text-lg mb-4">
                If you discover a security vulnerability in NexusAIFirst, please report it responsibly. 
                We appreciate your help in keeping NexusAIFirst secure.
              </p>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Mail className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold">Security Contact</p>
                  <a href="/contact?subject=security" className="text-blue-500 hover:underline" data-testid="link-security-contact">
                    Contact Security Team
                  </a>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportingSteps.map((step) => (
                <Card key={step.num} className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                      {step.num}
                    </div>
                    <h3 className="font-bold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Response Timeline */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Response Timeline</h2>
          <div className="space-y-6">
            <Card className="p-6 flex items-center gap-6">
              <Clock className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Within 48 Hours</h3>
                <p className="text-muted-foreground">Initial acknowledgment of your report</p>
              </div>
            </Card>
            <Card className="p-6 flex items-center gap-6">
              <FileWarning className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Within 7 Days</h3>
                <p className="text-muted-foreground">Assessment and severity classification</p>
              </div>
            </Card>
            <Card className="p-6 flex items-center gap-6">
              <Shield className="w-8 h-8 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Within 90 Days</h3>
                <p className="text-muted-foreground">Fix development and coordinated disclosure</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Security Features */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Security Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityFeatures.map((feature, i) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={i} className="p-6 text-center">
                    <IconComponent className="w-10 h-10 mx-auto mb-4 text-green-500" />
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Supported Versions */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Supported Versions</h2>
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Version</th>
                  <th className="px-6 py-4 text-left font-semibold">Support Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-6 py-4">1.x (current)</td>
                  <td className="px-6 py-4">
                    <Badge className="bg-green-500 text-white">Supported</Badge>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-6 py-4">0.x (beta)</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary">Limited Support</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* Recognition */}
        <section className="px-4 py-16 bg-gradient-to-br from-green-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Security Researchers</h2>
            <p className="text-lg text-white/80 mb-8">
              We appreciate the work of security researchers who help keep NexusAIFirst safe. 
              Responsible disclosure reporters will be credited in our security acknowledgments.
            </p>
            <Button size="lg" className="bg-white text-green-600 hover:bg-slate-100" asChild data-testid="button-report-vulnerability">
              <a href="/contact?subject=security">
                <Mail className="mr-2 w-5 h-5" /> Report a Vulnerability
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

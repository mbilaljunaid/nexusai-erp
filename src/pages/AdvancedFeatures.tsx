import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Zap, TrendingUp, Users } from "lucide-react";

export default function AdvancedFeatures() {
  const features = [
    {
      category: "ERP Advanced",
      icon: <Zap className="h-6 w-6" />,
      features: [
        { name: "Bank Reconciliation", description: "Auto-match transactions with fuzzy logic", status: "ready" },
        { name: "Multi-Entity Consolidation", description: "Consolidate financials across subsidiaries", status: "ready" },
        { name: "Tax Engine", description: "Automated tax calculation by jurisdiction", status: "ready" },
        { name: "Auto-Reconciliation", description: "AI-powered transaction matching", status: "ready" },
      ],
    },
    {
      category: "Finance Advanced",
      icon: <TrendingUp className="h-6 w-6" />,
      features: [
        { name: "Period Close Automation", description: "Guided close process with checklist", status: "ready" },
        { name: "FX Translation", description: "Multi-currency translation & gains/losses", status: "ready" },
        { name: "Intercompany Elimination", description: "Automatic elimination of IC transactions", status: "ready" },
      ],
    },
    {
      category: "CRM Advanced",
      icon: <Users className="h-6 w-6" />,
      features: [
        { name: "Territory Management", description: "Optimize sales territories & quotas", status: "ready" },
        { name: "CPQ (Configure-Price-Quote)", description: "Dynamic quoting with discounts", status: "ready" },
        { name: "Partner Portal", description: "Self-service portal for partners", status: "ready" },
      ],
    },
    {
      category: "HRMS Advanced",
      icon: <Users className="h-6 w-6" />,
      features: [
        { name: "Recruitment", description: "Job posting, applicant tracking, scoring", status: "ready" },
        { name: "Learning Management", description: "Course enrollment, tracking, plans", status: "ready" },
        { name: "Compensation Planning", description: "Salary reviews and benchmarking", status: "coming" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Features</h1>
        <p className="text-muted-foreground mt-2">Enterprise-grade capabilities for complex business operations</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {features.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg hover:bg-muted transition-colors"
                    data-testid={`card-feature-${feature.name.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <Badge
                        variant={feature.status === "ready" ? "default" : "secondary"}
                        className="whitespace-nowrap ml-2"
                      >
                        {feature.status === "ready" ? "✓ Ready" : "Coming"}
                      </Badge>
                    </div>
                    {feature.status === "ready" && (
                      <Button size="sm" variant="outline" data-testid={`button-try-${feature.name.replace(/\s+/g, "-").toLowerCase()}`}>
                        Try Now
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" data-testid="button-bank-recon">
              Bank Reconciliation
            </Button>
            <Button variant="outline" size="sm" data-testid="button-territory">
              Territory Mgmt
            </Button>
            <Button variant="outline" size="sm" data-testid="button-cpq">
              CPQ
            </Button>
            <Button variant="outline" size="sm" data-testid="button-recruitment">
              Recruitment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

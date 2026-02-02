import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-primary">
            <Sparkles className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          NexusAI ERP
        </h1>
        
        <p className="text-xl text-muted-foreground">
          AI-First Enterprise Resource Planning Platform
        </p>

        <Card className="text-left">
          <CardHeader>
            <CardTitle>Enterprise-Grade Features</CardTitle>
            <CardDescription>Everything you need to run your business</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <div>✓ Financial Management & Accounting</div>
            <div>✓ CRM & Sales Pipeline</div>
            <div>✓ HR & Talent Management</div>
            <div>✓ Supply Chain & Inventory</div>
            <div>✓ Manufacturing & Operations</div>
            <div>✓ AI-Powered Analytics</div>
          </CardContent>
        </Card>

        <Link to="/dashboard">
          <Button size="lg" className="gap-2">
            Enter Platform
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;

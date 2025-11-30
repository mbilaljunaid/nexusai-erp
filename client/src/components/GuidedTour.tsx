import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HelpCircle, ChevronRight, X } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
}

const ONBOARDING_TOUR: TourStep[] = [
  { id: "1", title: "Welcome to NexusAI", description: "Your enterprise AI platform is ready. Let's take a quick tour." },
  { id: "2", title: "Explore Modules", description: "Access 24 enterprise modules from the sidebar navigation." },
  { id: "3", title: "AI Chat Assistant", description: "Use the AI Copilot to get insights and assistance." },
  { id: "4", title: "Dashboard Customization", description: "Personalize your dashboard with custom widgets." },
  { id: "5", title: "You're Ready!", description: "You're all set to use NexusAI. Start exploring!" },
];

export function GuidedTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);

  const step = ONBOARDING_TOUR[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_TOUR.length) * 100;

  if (!showTour) {
    return (
      <Button onClick={() => setShowTour(true)} variant="outline" size="sm" className="gap-2" data-testid="button-start-tour">
        <HelpCircle className="h-4 w-4" />
        Take Tour
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 animate-in slide-in-from-bottom-2 shadow-lg z-50" data-testid="guided-tour-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{step.title}</CardTitle>
          <Button size="icon" variant="ghost" onClick={() => setShowTour(false)} data-testid="button-close-tour">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{step.description}</p>
        <Progress value={progress} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {ONBOARDING_TOUR.length}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            data-testid="button-tour-prev"
          >
            Back
          </Button>
          {currentStep === ONBOARDING_TOUR.length - 1 ? (
            <Button size="sm" onClick={() => setShowTour(false)} className="ml-auto" data-testid="button-tour-complete">
              Done
            </Button>
          ) : (
            <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)} className="ml-auto gap-1" data-testid="button-tour-next">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

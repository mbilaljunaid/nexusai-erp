import { useEffect, useState, useRef } from "react";
import { useTour, Tour } from "@/hooks/use-tour";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight, HelpCircle, Sparkles } from "lucide-react";

export function GuidedTourOverlay() {
  const { activeTour, currentStep, isOpen, nextStep, prevStep, skipTour } = useTour();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen || !activeTour) {
      setPosition(null);
      setHighlightRect(null);
      return;
    }

    const step = activeTour.steps[currentStep];
    if (!step) return;

    const updatePosition = () => {
      const element = document.querySelector(step.target);
      if (!element) {
        setPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 175 });
        setHighlightRect(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);

      element.scrollIntoView({ behavior: "smooth", block: "center" });

      const cardWidth = 350;
      const cardHeight = 200;
      const padding = 20;

      let top = 0;
      let left = 0;

      const placement = step.placement || "bottom";

      switch (placement) {
        case "top":
          top = rect.top + window.scrollY - cardHeight - padding;
          left = rect.left + window.scrollX + rect.width / 2 - cardWidth / 2;
          break;
        case "bottom":
          top = rect.bottom + window.scrollY + padding;
          left = rect.left + window.scrollX + rect.width / 2 - cardWidth / 2;
          break;
        case "left":
          top = rect.top + window.scrollY + rect.height / 2 - cardHeight / 2;
          left = rect.left + window.scrollX - cardWidth - padding;
          break;
        case "right":
          top = rect.top + window.scrollY + rect.height / 2 - cardHeight / 2;
          left = rect.right + window.scrollX + padding;
          break;
      }

      left = Math.max(padding, Math.min(left, window.innerWidth - cardWidth - padding));
      top = Math.max(padding, Math.min(top, document.body.scrollHeight - cardHeight - padding));

      setPosition({ top, left });
    };

    const timer = setTimeout(updatePosition, 100);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen, activeTour, currentStep]);

  if (!isOpen || !activeTour) return null;

  const step = activeTour.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === activeTour.steps.length - 1;
  const progress = ((currentStep + 1) / activeTour.steps.length) * 100;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={skipTour}
        data-testid="tour-overlay"
      />

      {highlightRect && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-lg"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5), 0 0 15px 3px hsl(var(--primary))",
          }}
          data-testid="tour-highlight"
        />
      )}

      {position && (
        <Card
          className="fixed z-[10000] w-[350px] shadow-xl animate-in fade-in-0 zoom-in-95"
          style={{ top: position.top, left: position.left }}
          data-testid="tour-card"
        >
          <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">{step.title}</CardTitle>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 -mr-2 -mt-1"
              onClick={skipTour}
              data-testid="tour-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="pb-3 space-y-3">
            <p className="text-sm text-muted-foreground">{step.content}</p>
            <Progress value={progress} className="h-1" />
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2 pt-0">
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {activeTour.steps.length}
            </span>
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button size="sm" variant="outline" onClick={prevStep} data-testid="tour-prev">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={nextStep} data-testid="tour-next">
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
}

export function TourTriggerButton({ tour }: { tour: Tour }) {
  const { startTour, hasCompletedTour } = useTour();
  const completed = hasCompletedTour(tour.id);

  return (
    <Button
      onClick={() => startTour(tour)}
      variant="outline"
      size="sm"
      className="gap-2"
      data-testid="button-start-tour"
    >
      <HelpCircle className="h-4 w-4" />
      {completed ? "Retake Tour" : "Take Tour"}
    </Button>
  );
}

export const dashboardTour: Tour = {
  id: "dashboard-tour",
  name: "Dashboard Tour",
  steps: [
    {
      target: "[data-testid='button-sidebar-toggle']",
      title: "Navigation Menu",
      content: "Click here to toggle the sidebar navigation. The sidebar gives you access to all NexusAI modules and features.",
      placement: "right",
    },
    {
      target: "[data-tour='quick-stats']",
      title: "Quick Stats",
      content: "This section shows you real-time metrics about your organization - active users, running processes, pending tasks, and system health.",
      placement: "bottom",
    },
    {
      target: "[data-tour='core-modules']",
      title: "Core Modules",
      content: "These are the main business modules available in NexusAI. Click any card to access CRM, Projects, Finance, HR, and more.",
      placement: "top",
    },
    {
      target: "[data-tour='quick-links']",
      title: "Quick Links",
      content: "Access frequently used features like Process Hub, Integrations, API Management, and Admin settings from here.",
      placement: "top",
    },
    {
      target: "[data-tour='getting-started']",
      title: "Getting Started",
      content: "New to NexusAI? The Process Hub is a great starting point to understand our 18 end-to-end business processes.",
      placement: "top",
    },
  ],
};

export function GuidedTour() {
  const { startTour, hasCompletedTour } = useTour();
  
  return (
    <Button
      onClick={() => startTour(dashboardTour)}
      variant="outline"
      size="sm"
      className="gap-2"
      data-testid="button-start-tour"
    >
      <HelpCircle className="h-4 w-4" />
      {hasCompletedTour(dashboardTour.id) ? "Retake Tour" : "Take Tour"}
    </Button>
  );
}

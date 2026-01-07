import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, HelpCircle, Sparkles, GitCompare, Share2 } from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  icon?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

interface TutorialOverlayProps {
  steps?: TutorialStep[];
  storageKey?: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

const defaultSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to the Marketplace",
    description: "Let's take a quick tour of the new features available to help you discover and compare apps more effectively.",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
  {
    id: "ai-filter",
    title: "AI-Powered Filter",
    description: "Toggle this switch to filter apps that include AI, machine learning, or automation capabilities. Great for finding cutting-edge solutions!",
    targetSelector: '[data-testid="switch-ai-filter"]',
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    position: "bottom",
  },
  {
    id: "compare-mode",
    title: "Compare Apps",
    description: "Click this button to enter comparison mode. You can select up to 3 apps and view them side-by-side to make informed decisions.",
    targetSelector: '[data-testid="button-compare-mode"]',
    icon: <GitCompare className="w-6 h-6 text-primary" />,
    position: "bottom",
  },
  {
    id: "share-apps",
    title: "Share Apps",
    description: "When viewing an app's details, you'll find share buttons to easily share apps on Twitter, LinkedIn, or copy the link.",
    icon: <Share2 className="w-6 h-6 text-primary" />,
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "You've completed the tour. These features are designed to help you find the perfect apps for your needs. Happy exploring!",
    icon: <Sparkles className="w-6 h-6 text-green-500" />,
  },
];

export function TutorialOverlay({
  steps = defaultSteps,
  storageKey = "marketplace-tutorial-completed",
  onComplete,
  onSkip,
}: TutorialOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (step?.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect);
    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect);
    };
  }, [updateTargetRect]);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
    onSkip?.();
  };

  const handleStartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const getCardPosition = () => {
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const cardWidth = 340;
    const cardHeight = 220;

    switch (step?.position) {
      case "bottom":
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - padding))}px`,
        };
      case "top":
        return {
          top: `${targetRect.top - cardHeight - padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - padding))}px`,
        };
      case "left":
        return {
          top: `${targetRect.top + targetRect.height / 2 - cardHeight / 2}px`,
          left: `${targetRect.left - cardWidth - padding}px`,
        };
      case "right":
        return {
          top: `${targetRect.top + targetRect.height / 2 - cardHeight / 2}px`,
          left: `${targetRect.right + padding}px`,
        };
      default:
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - padding))}px`,
        };
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleStartTour}
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg"
        data-testid="button-start-tutorial"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              data-testid="tutorial-overlay"
            >
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <mask id="spotlight-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    {targetRect && (
                      <rect
                        x={targetRect.left - 8}
                        y={targetRect.top - 8}
                        width={targetRect.width + 16}
                        height={targetRect.height + 16}
                        rx="8"
                        fill="black"
                      />
                    )}
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="rgba(0, 0, 0, 0.7)"
                  mask="url(#spotlight-mask)"
                />
              </svg>

              {targetRect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute pointer-events-none"
                  style={{
                    top: targetRect.top - 8,
                    left: targetRect.left - 8,
                    width: targetRect.width + 16,
                    height: targetRect.height + 16,
                  }}
                >
                  <div className="w-full h-full rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent animate-pulse" />
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed z-50"
              style={getCardPosition()}
            >
              <Card className="w-[340px] shadow-xl" data-testid="tutorial-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {step?.icon}
                      <CardTitle className="text-lg">{step?.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSkip}
                      className="h-8 w-8"
                      data-testid="button-skip-tutorial"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step?.description}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {!isFirstStep && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrev}
                        data-testid="button-tutorial-prev"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={handleNext}
                      data-testid="button-tutorial-next"
                    >
                      {isLastStep ? "Finish" : "Next"}
                      {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function useTutorial(storageKey = "marketplace-tutorial-completed") {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    setHasSeenTutorial(!!completed);
  }, [storageKey]);

  const resetTutorial = () => {
    localStorage.removeItem(storageKey);
    setHasSeenTutorial(false);
  };

  return { hasSeenTutorial, resetTutorial };
}

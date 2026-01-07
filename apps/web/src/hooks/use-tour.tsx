import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
}

interface TourContextValue {
  activeTour: Tour | null;
  currentStep: number;
  isOpen: boolean;
  startTour: (tour: Tour) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
  skipTour: () => void;
  hasCompletedTour: (tourId: string) => boolean;
  resetAllTours: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

const COMPLETED_TOURS_KEY = "nexusai_completed_tours";

function getCompletedTours(): string[] {
  try {
    const stored = localStorage.getItem(COMPLETED_TOURS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setCompletedTour(tourId: string) {
  const completed = getCompletedTours();
  if (!completed.includes(tourId)) {
    completed.push(tourId);
    localStorage.setItem(COMPLETED_TOURS_KEY, JSON.stringify(completed));
  }
}

function clearCompletedTours() {
  localStorage.removeItem(COMPLETED_TOURS_KEY);
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [completedTours, setCompletedTours] = useState<string[]>([]);

  useEffect(() => {
    setCompletedTours(getCompletedTours());
  }, []);

  const startTour = useCallback((tour: Tour) => {
    setActiveTour(tour);
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const nextStep = useCallback(() => {
    if (activeTour && currentStep < activeTour.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [activeTour, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const endTour = useCallback(() => {
    if (activeTour) {
      setCompletedTour(activeTour.id);
      setCompletedTours((prev) => [...prev, activeTour.id]);
    }
    setActiveTour(null);
    setCurrentStep(0);
    setIsOpen(false);
  }, [activeTour]);

  const skipTour = useCallback(() => {
    if (activeTour) {
      setCompletedTour(activeTour.id);
      setCompletedTours((prev) => [...prev, activeTour.id]);
    }
    setActiveTour(null);
    setCurrentStep(0);
    setIsOpen(false);
  }, [activeTour]);

  const hasCompletedTour = useCallback(
    (tourId: string) => {
      return completedTours.includes(tourId);
    },
    [completedTours]
  );

  const resetAllTours = useCallback(() => {
    clearCompletedTours();
    setCompletedTours([]);
  }, []);

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStep,
        isOpen,
        startTour,
        nextStep,
        prevStep,
        endTour,
        skipTour,
        hasCompletedTour,
        resetAllTours,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

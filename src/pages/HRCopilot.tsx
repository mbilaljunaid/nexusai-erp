import { useEffect } from "react";
import { useLocation } from "wouter";
import { useNexusAI } from "@/contexts/NexusAIContext";

/**
 * HR Copilot — Redirects to NexusAI panel with HR context.
 * Legacy standalone page replaced by unified NexusAI.
 */
export default function HRCopilot() {
  const [, navigate] = useLocation();
  const { open } = useNexusAI();

  useEffect(() => {
    open();
    navigate("/hr");
  }, []);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-muted-foreground">Redirecting to NexusAI with HR context...</p>
    </div>
  );
}

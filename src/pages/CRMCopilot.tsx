import { useEffect } from "react";
import { useLocation } from "wouter";
import { useNexusAI } from "@/contexts/NexusAIContext";

/**
 * CRM Copilot — Redirects to NexusAI panel with CRM context.
 * Legacy standalone page replaced by unified NexusAI.
 */
export default function CRMCopilot() {
  const [, navigate] = useLocation();
  const { open } = useNexusAI();

  useEffect(() => {
    open();
    navigate("/crm");
  }, []);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-muted-foreground">Redirecting to NexusAI with CRM context...</p>
    </div>
  );
}

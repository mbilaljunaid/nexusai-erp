import { useEffect } from "react";
import { useLocation } from "wouter";
import { useNexusAI } from "@/contexts/NexusAIContext";

/**
 * ERP Copilot — Redirects to NexusAI panel with Finance context.
 * Legacy standalone page replaced by unified NexusAI.
 */
export default function ERPCopilot() {
  const [, navigate] = useLocation();
  const { open } = useNexusAI();

  useEffect(() => {
    open();
    navigate("/finance");
  }, []);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-muted-foreground">Redirecting to NexusAI with Finance context...</p>
    </div>
  );
}

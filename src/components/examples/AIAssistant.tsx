import { useState } from "react";
import { AIAssistant, AIAssistantTrigger } from "../AIAssistant";

export default function AIAssistantExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-[600px] relative">
      {!isOpen && <AIAssistantTrigger onClick={() => setIsOpen(true)} />}
      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

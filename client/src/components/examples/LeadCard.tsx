import { LeadCard } from "../LeadCard";

export default function LeadCardExample() {
  // Fallback data for demo/preview when no API data provided
  const mockLead = {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@techcorp.com",
    company: "TechCorp Inc.",
    status: "qualified" as const,
    score: 87,
    value: 45000,
    lastContact: "2 days ago",
  };

  return (
    <div className="p-4 max-w-sm">
      <LeadCard 
        lead={mockLead}
        onCall={(lead) => console.log('Calling', lead.name)}
        onEmail={(lead) => console.log('Emailing', lead.name)}
      />
    </div>
  );
}

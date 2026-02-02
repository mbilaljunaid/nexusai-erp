import { LeadTable } from "../LeadTable";

export default function LeadTableExample() {
  return (
    <div className="p-4">
      <LeadTable 
        onSelectLead={(lead) => console.log('Selected lead:', lead)}
        onBulkAction={(ids, action) => console.log('Bulk action:', action, ids)}
      />
    </div>
  );
}

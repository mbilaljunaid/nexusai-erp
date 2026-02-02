import { AddLeadDialog } from "../AddLeadDialog";

export default function AddLeadDialogExample() {
  return (
    <div className="p-4">
      <AddLeadDialog onAddLead={(lead) => console.log('New lead:', lead)} />
    </div>
  );
}

import { useRoute } from "wouter";
import { LeaseDetailView } from "./LeaseDetailView";

export default function LeaseDetailPage() {
    const [match, params] = useRoute("/finance/leases/:id");
    const id = match ? (params as any).id : null;

    if (!match || !id) {
        return <div>Lease ID not found</div>;
    }

    return <LeaseDetailView leaseId={id} />;
}

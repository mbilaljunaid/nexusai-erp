import { useRoute } from "wouter";
import { LeaseDetailView } from "./LeaseDetailView";

export default function LeaseDetailPage() {
    const [match, params] = useRoute("/leases/:id");
    const id = (params as any)?.id;

    if (!match || !id) {
        return <div>Lease ID not found</div>;
    }

    return <LeaseDetailView leaseId={id} />;
}

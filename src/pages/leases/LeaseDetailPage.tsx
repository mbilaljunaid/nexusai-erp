// @ts-nocheck
import { useRoute } from "wouter";
import { LeaseDetailView } from "./LeaseDetailView";

export default function LeaseDetailPage() {
    const [match, params] = useRoute("/leases/:id");

    if (!match || !params?.id) {
        return <div>Lease ID not found</div>;
    }

    return <LeaseDetailView leaseId={params.id} />;
}

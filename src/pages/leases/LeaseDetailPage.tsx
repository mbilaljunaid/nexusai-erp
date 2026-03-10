import { useRoute } from "wouter";
import { LeaseDetailView } from "./LeaseDetailView";
import { StandardPage } from "@/components/layout/StandardPage";

export default function LeaseDetailPage() {
    const [match, params] = useRoute("/finance/leases/:id");
    const id = match ? (params as any).id : null;

    if (!match || !id) {
        return <StandardPage title="Page Title">Lease ID not found</StandardPage>;
    }

    return <LeaseDetailView leaseId={id} />;
}

import { DailyStatusBoard } from "@/components/wfm/DailyStatusBoard";
import { StandardPage } from "@/components/layout/StandardPage";
import { useNexusAI } from "@/contexts/NexusAIContext";

export default function DailyStatus() {
    const { tenantId } = useNexusAI();
    return (
        <StandardPage title="Daily Status">
            <DailyStatusBoard tenantId={tenantId} />
        </StandardPage>
    );
}

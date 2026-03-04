import { DailyStatusBoard } from "@/components/wfm/DailyStatusBoard";
import { StandardPage } from "@/components/layout/StandardPage";

const MOCK_TENANT_ID = "test-tenant-wfm-001";

export default function DailyStatus() {
    return (
        <StandardPage title="Page Title">
            <DailyStatusBoard tenantId={MOCK_TENANT_ID} />
        </StandardPage>
    );
}

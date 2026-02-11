import { DailyStatusBoard } from "@/components/wfm/DailyStatusBoard";

const MOCK_TENANT_ID = "test-tenant-wfm-001";

export default function DailyStatus() {
    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <DailyStatusBoard tenantId={MOCK_TENANT_ID} />
        </div>
    );
}

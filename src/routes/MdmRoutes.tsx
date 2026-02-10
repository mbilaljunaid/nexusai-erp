
import { Route, Switch } from "wouter";
import ModuleLayout from "@/components/layouts/ModuleLayout";
// Data Quality Components (Phase 1)
import DuplicateDetectionWorkbench from "@/pages/mdm/DuplicateDetectionWorkbench";
import MatchRuleBuilder from "@/pages/mdm/MatchRuleBuilder";
import SurvivorshipRuleBuilder from "@/pages/mdm/SurvivorshipRuleBuilder";
import DataQualityDashboard from "@/pages/mdm/DataQualityDashboard";

// Master Data Components (Phase 2)
import ItemMasterUI from "@/pages/mdm/ItemMasterUI";
import LocationManager from "@/pages/mdm/LocationManager";

// Master Data Components (existing)
import PartyDirectory from "@/pages/PartyDirectory";
import PartyProfile from "@/pages/PartyProfile";
import ReferenceDataList from "@/pages/ReferenceDataList";
import ReferenceDataDetail from "@/pages/ReferenceDataDetail";
import ItemDirectory from "@/pages/ItemDirectory";
import ItemProfile from "@/pages/ItemProfile";

// Governance Components (Phase 3)
import BulkImportWizard from "@/pages/mdm/BulkImportWizard";
import ChangeRequestWorkbench from "@/pages/mdm/ChangeRequestWorkbench";
import MDMAuditViewer from "@/pages/mdm/MDMAuditViewer";

// Governance Components (existing)
import DataGovernancePage from "@/pages/DataGovernancePage";
import ChangeRequestInbox from "@/pages/ChangeRequestInbox";

export default function MdmRoutes() {
    return (
        <ModuleLayout>
            {/* Data Quality & Matching - NEW COMPONENTS */}
            <Route path="/mdm/quality/dashboard" component={DataQualityDashboard} />
            <Route path="/mdm/quality/duplicates" component={DuplicateDetectionWorkbench} />
            <Route path="/mdm/quality/match-rules" component={MatchRuleBuilder} />
            <Route path="/mdm/quality/survivorship-rules" component={SurvivorshipRuleBuilder} />

            {/* Master Data - Phase 2 NEW */}
            <Route path="/mdm/items-pim" component={ItemMasterUI} />
            <Route path="/mdm/locations" component={LocationManager} />

            {/* Master Data - existing */}
            <Route path="/mdm/parties" component={PartyDirectory} />
            <Route path="/mdm/parties/:id" component={PartyProfile} />
            <Route path="/mdm/reference-data" component={ReferenceDataList} />
            <Route path="/mdm/reference-data/:id" component={ReferenceDataDetail} />
            <Route path="/mdm/items" component={ItemDirectory} />
            <Route path="/mdm/items/:id" component={ItemProfile} />

            {/* Governance - Phase 3 NEW */}
            <Route path="/mdm/governance/import" component={BulkImportWizard} />
            <Route path="/mdm/governance/change-requests" component={ChangeRequestWorkbench} />
            <Route path="/mdm/governance/audit" component={MDMAuditViewer} />

            {/* Governance - existing */}
            <Route path="/mdm/governance" component={DataGovernancePage} />
            <Route path="/mdm/change-requests" component={ChangeRequestInbox} />
            <Route path="/mdm/import" component={BulkImportWizard} />

            {/* Default */}
            <Route path="/mdm" component={DataQualityDashboard} />
        </ModuleLayout>
    );
}

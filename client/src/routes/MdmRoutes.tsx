
import { Route, Switch } from "wouter";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import DataGovernancePage from "@/pages/DataGovernancePage";
import DuplicateDetection from "@/pages/DuplicateDetection";
import PartyDirectory from "@/pages/PartyDirectory";
import PartyProfile from "@/pages/PartyProfile";
import ReferenceDataList from "@/pages/ReferenceDataList";
import ReferenceDataDetail from "@/pages/ReferenceDataDetail";
import MatchRuleList from "@/pages/MatchRuleList";
import MatchRuleDetail from "@/pages/MatchRuleDetail";
import SurvivorshipRuleList from "@/pages/SurvivorshipRuleList";
import ItemDirectory from "@/pages/ItemDirectory";
import ItemProfile from "@/pages/ItemProfile";
import DataQualityDashboard from "@/pages/DataQualityDashboard";
import ChangeRequestInbox from "@/pages/ChangeRequestInbox";
import BulkImportWizard from "@/pages/BulkImportWizard";

export default function MdmRoutes() {
    return (
        <ModuleLayout>
            <Route path="/mdm/governance" component={DataGovernancePage} />
            <Route path="/mdm/duplicates" component={DuplicateDetection} />
            <Route path="/mdm/parties" component={PartyDirectory} />
            <Route path="/mdm/parties/:id" component={PartyProfile} />
            <Route path="/mdm/reference-data" component={ReferenceDataList} />
            <Route path="/mdm/reference-data/:id" component={ReferenceDataDetail} />

            <Route path="/mdm/config/match-rules" component={MatchRuleList} />
            <Route path="/mdm/config/match-rules/:id" component={MatchRuleDetail} />
            <Route path="/mdm/config/survivorship-rules" component={SurvivorshipRuleList} />

            <Route path="/mdm/items" component={ItemDirectory} />
            <Route path="/mdm/items/:id" component={ItemProfile} />
            <Route path="/mdm/dq-dashboard" component={DataQualityDashboard} />
            <Route path="/mdm/change-requests" component={ChangeRequestInbox} />
            <Route path="/mdm/import" component={BulkImportWizard} />

            {/* Redirects or Default */}
            <Route path="/mdm" component={DataGovernancePage} />
        </ModuleLayout>
    );
}

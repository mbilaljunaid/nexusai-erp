
import { Route, Switch } from "wouter";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import DataGovernancePage from "@/pages/DataGovernancePage";
import DuplicateDetection from "@/pages/DuplicateDetection";
import PartyDirectory from "@/pages/PartyDirectory";
import PartyProfile from "@/pages/PartyProfile";

export default function MdmRoutes() {
    return (
        <ModuleLayout>
            <Route path="/mdm/governance" component={DataGovernancePage} />
            <Route path="/mdm/duplicates" component={DuplicateDetection} />
            <Route path="/mdm/parties" component={PartyDirectory} />
            <Route path="/mdm/parties/:id" component={PartyProfile} />

            {/* Redirects or Default */}
            <Route path="/mdm" component={DataGovernancePage} />
        </ModuleLayout>
    );
}

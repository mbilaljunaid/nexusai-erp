import { Route, Switch } from "wouter";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import EnterpriseDashboard from "@/pages/enterprise/EnterpriseDashboard";
import LegalGroups from "@/pages/enterprise/LegalGroups";
import BusinessUnits from "@/pages/enterprise/BusinessUnits";
import Ledgers from "@/pages/enterprise/Ledgers";
import Mappings from "@/pages/enterprise/Mappings";

export default function CompanySetupRoutes() {
    return (
        <ModuleLayout>
            <Switch>
                <Route path="/company-setup/legal-groups" component={LegalGroups} />
                <Route path="/company-setup/business-units" component={BusinessUnits} />
                <Route path="/company-setup/ledgers" component={Ledgers} />
                <Route path="/company-setup/mappings" component={Mappings} />
                <Route path="/company-setup" component={EnterpriseDashboard} />
            </Switch>
        </ModuleLayout>
    );
}

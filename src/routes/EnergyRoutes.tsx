import { Route } from "wouter";
import EnergyUtilityDashboard from "@/pages/energy/EnergyUtilityDashboard";

export default function EnergyRoutes() {
    return (
        <>
            <Route path="/energy/dashboard" component={EnergyUtilityDashboard} />
        </>
    );
}

import { Route } from "wouter";
import RealEstateDashboard from "@/pages/realestate/RealEstateDashboard";

export default function RealEstateRoutes() {
    return (
        <>
            <Route path="/realestate/dashboard" component={RealEstateDashboard} />
        </>
    );
}

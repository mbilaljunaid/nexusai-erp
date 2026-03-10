import { Route } from "wouter";
import ProductCatalogDashboard from "@/pages/ecommerce/ProductCatalogDashboard";
import EcommerceDashboard from "@/pages/ecommerce/EcommerceDashboard";

export default function EcommerceRoutes() {
    return (
        <>
            <Route path="/ecommerce/catalog" component={ProductCatalogDashboard} />
            <Route path="/ecommerce/dashboard" component={EcommerceDashboard} />
        </>
    );
}

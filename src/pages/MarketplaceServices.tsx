import { Header, Footer } from "@/components/Navigation";
import { ServiceMarketplace } from "@/components/ServiceMarketplace";
import { StandardPage } from "@/components/layout/StandardPage";

export default function MarketplaceServices() {
  return (
    <StandardPage title="Page Title">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ServiceMarketplace />
      </main>
      <Footer />
    </StandardPage>
  );
}

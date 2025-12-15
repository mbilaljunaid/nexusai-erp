import { Header, Footer } from "@/components/Navigation";
import { ServiceMarketplace } from "@/components/ServiceMarketplace";

export default function MarketplaceServices() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ServiceMarketplace />
      </main>
      <Footer />
    </div>
  );
}

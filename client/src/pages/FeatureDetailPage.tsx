import { useRoute, Link } from "wouter";
import { Header, Footer } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFeatureBySlug, getFeaturesByModule, FeatureDetail } from "@/data/featureRegistry";
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, Target, Lightbulb, Link2 } from "lucide-react";
import NotFound from "./not-found";

export default function FeatureDetailPage() {
  const [, params] = useRoute("/features/:slug");
  const slug = params?.slug || "";
  
  const feature = getFeatureBySlug(slug);
  
  if (!feature) {
    return <NotFound />;
  }

  const relatedFeatures = feature.relatedFeatures
    .map(slug => getFeatureBySlug(slug))
    .filter((f): f is FeatureDetail => f !== null)
    .slice(0, 4);

  const Icon = feature.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <section className={`relative py-20 ${feature.color} text-white overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="container mx-auto px-4 relative z-10">
            <Link href="/features">
              <Button variant="ghost" className="mb-6 text-white/80 hover:text-white hover:bg-white/10" data-testid="link-back-features">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Features
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 rounded-xl">
                <Icon className="w-10 h-10" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {feature.module}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-feature-name">
              {feature.name}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mb-8">
              {feature.longDescription}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/demo">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-request-demo">
                  Request Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white/10" data-testid="button-view-pricing">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <CardTitle>Key Capabilities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {feature.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-start gap-3" data-testid={`text-capability-${index}`}>
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{capability}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <CardTitle>Benefits</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3" data-testid={`text-benefit-${index}`}>
                        <div className={`w-2 h-2 rounded-full ${feature.color} mt-2 flex-shrink-0`} />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Use Cases</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {feature.useCases.map((useCase, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className={`w-3 h-3 rounded-full ${feature.color} mb-3`} />
                    <p className="font-medium" data-testid={`text-usecase-${index}`}>{useCase}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {relatedFeatures.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-8">
                <Link2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Related Features</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedFeatures.map((related) => {
                  const RelatedIcon = related.icon;
                  return (
                    <Link key={related.slug} href={`/features/${related.slug}`}>
                      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-related-${related.slug}`}>
                        <CardContent className="p-6">
                          <div className={`p-3 ${related.color} text-white rounded-lg w-fit mb-4`}>
                            <RelatedIcon className="w-5 h-5" />
                          </div>
                          <h3 className="font-semibold mb-2">{related.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{related.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              See how {feature.name} can transform your business operations. Request a personalized demo today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/demo">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-demo">
                  Request Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-cta-contact">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { Check } from "lucide-react";

export default function BillingPlans() {
  const { data: plans = [] } = useQuery({
    queryKey: ["/api/plans"],
    queryFn: () => fetch("/api/plans").then(r => r.json())
  });

  const { data: currentSub = [] } = useQuery({
    queryKey: ["/api/subscriptions/tenant1"],
    queryFn: () => fetch("/api/subscriptions/tenant1").then(r => r.json())
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => 
      fetch("/api/subscriptions", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ tenantId: "tenant1", planId })
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/tenant1"] });
    }
  });

  const currentPlanId = Array.isArray(currentSub) && currentSub.length > 0 ? currentSub[0].planId : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing Plans</h1>
        <p className="text-gray-600">Choose the perfect plan for your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <Card key={plan.id} className={`p-6 relative flex flex-col ${currentPlanId === plan.id ? 'ring-2 ring-blue-500' : ''}`}>
            {currentPlanId === plan.id && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Current Plan
              </div>
            )}
            
            <h2 className="text-2xl font-bold mb-2" data-testid={`text-plan-name-${plan.id}`}>{plan.name}</h2>
            <div className="mb-6">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-gray-600 ml-2">/{plan.billingCycle}</span>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {plan.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center gap-3" data-testid={`feature-${plan.id}-${idx}`}>
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {currentPlanId === plan.id ? (
              <Button disabled className="w-full" data-testid={`button-current-${plan.id}`}>
                Current Plan
              </Button>
            ) : (
              <Button 
                onClick={() => subscribeMutation.mutate(plan.id)}
                className="w-full"
                data-testid={`button-subscribe-${plan.id}`}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

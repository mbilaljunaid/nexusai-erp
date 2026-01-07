import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Package, Star, Clock, DollarSign, ShoppingCart, Plus, Search, 
  CheckCircle, XCircle, AlertCircle, Truck, MessageSquare, User,
  ArrowUpDown, LayoutGrid, List, Filter, Loader2
} from "lucide-react";
import type { ServicePackage, ServiceOrder, ServiceCategory, ServiceReview, UserTrustLevel } from "@shared/schema";

interface ServicePackageWithCategory extends ServicePackage {
  category?: ServiceCategory;
}

interface ServiceOrderWithDetails extends ServiceOrder {
  package?: ServicePackage;
}

export function ServiceMarketplace() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderRequirements, setOrderRequirements] = useState("");
  const [isCreatePackageOpen, setIsCreatePackageOpen] = useState(false);
  const [newPackage, setNewPackage] = useState({ 
    title: "", description: "", categoryId: "", price: "", deliveryDays: 7 
  });
  const [activeView, setActiveView] = useState<"browse" | "my-orders" | "my-packages">("browse");
  const [orderViewType, setOrderViewType] = useState<"buyer" | "provider">("buyer");
  const [reviewDialogOrder, setReviewDialogOrder] = useState<ServiceOrder | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high" | "rating" | "orders" | "delivery_fast" | "delivery_slow">("newest");
  const [visibleCount, setVisibleCount] = useState(30);
  const [viewMode, setViewMode] = useState<"cards" | "rows">("cards");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState<string>("all");
  const [maxDeliveryDays, setMaxDeliveryDays] = useState<string>("all");
  const ITEMS_PER_LOAD = 30;

  const { data: trustLevel } = useQuery<UserTrustLevel>({
    queryKey: ["/api/community/trust-level"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/community/marketplace/categories"],
  });

  const { data: packages, isLoading: packagesLoading } = useQuery<ServicePackageWithCategory[]>({
    queryKey: ["/api/community/marketplace/packages", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/community/marketplace/packages?categoryId=${selectedCategory}` 
        : "/api/community/marketplace/packages";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    },
  });

  const { data: myOrders, isLoading: ordersLoading } = useQuery<ServiceOrderWithDetails[]>({
    queryKey: ["/api/community/marketplace/orders", orderViewType],
    queryFn: async () => {
      const res = await fetch(`/api/community/marketplace/orders?type=${orderViewType}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: activeView === "my-orders",
  });

  const { data: myPackages, isLoading: myPackagesLoading } = useQuery<ServicePackage[]>({
    queryKey: ["/api/community/marketplace/my-packages"],
    queryFn: async () => {
      const res = await fetch("/api/community/marketplace/packages?mine=true");
      if (!res.ok) throw new Error("Failed to fetch my packages");
      return res.json();
    },
    enabled: activeView === "my-packages",
  });

  const { data: selectedPackageReviews } = useQuery<ServiceReview[]>({
    queryKey: ["/api/community/marketplace/reviews", selectedPackage?.providerId],
    queryFn: async () => {
      const res = await fetch(`/api/community/marketplace/providers/${selectedPackage?.providerId}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!selectedPackage?.providerId,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: { packageId: string; requirements: string }) => {
      return apiRequest("POST", "/api/community/marketplace/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/orders"] });
      setIsOrderDialogOpen(false);
      setOrderRequirements("");
      setSelectedPackage(null);
      toast({ title: "Order placed!", description: "The provider will be notified." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to place order. Please log in first.", variant: "destructive" });
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: typeof newPackage) => {
      return apiRequest("POST", "/api/community/marketplace/packages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/my-packages"] });
      setIsCreatePackageOpen(false);
      setNewPackage({ title: "", description: "", categoryId: "", price: "", deliveryDays: 7 });
      toast({ title: "Package created!", description: "Your service is now listed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create package.", variant: "destructive" });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status, deliveryNotes }: { id: string; status?: string; deliveryNotes?: string }) => {
      return apiRequest("PATCH", `/api/community/marketplace/orders/${id}`, { status, deliveryNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/orders"] });
      toast({ title: "Order updated!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order.", variant: "destructive" });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ orderId, rating, comment }: { orderId: string; rating: number; comment: string }) => {
      return apiRequest("POST", `/api/community/marketplace/orders/${orderId}/review`, { rating, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/orders"] });
      setReviewDialogOrder(null);
      setReviewData({ rating: 5, comment: "" });
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    },
  });

  const filteredAndSortedPackages = (() => {
    let result = packages?.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const price = Number(p.price);
      const matchesPriceMin = !priceMin || price >= Number(priceMin);
      const matchesPriceMax = !priceMax || price <= Number(priceMax);
      
      const rating = Number(p.averageRating || 0);
      const matchesRating = minRating === "all" || rating >= Number(minRating);
      
      const delivery = p.deliveryDays || 0;
      const matchesDelivery = maxDeliveryDays === "all" || delivery <= Number(maxDeliveryDays);
      
      return matchesSearch && matchesPriceMin && matchesPriceMax && matchesRating && matchesDelivery;
    }) || [];
    
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return Number(a.price) - Number(b.price);
        case "price_high":
          return Number(b.price) - Number(a.price);
        case "rating":
          return Number(b.averageRating || 0) - Number(a.averageRating || 0);
        case "orders":
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        case "delivery_fast":
          return (a.deliveryDays || 0) - (b.deliveryDays || 0);
        case "delivery_slow":
          return (b.deliveryDays || 0) - (a.deliveryDays || 0);
        case "newest":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
    
    return result;
  })();

  const visiblePackages = filteredAndSortedPackages?.slice(0, visibleCount);
  const hasMore = filteredAndSortedPackages.length > visibleCount;

  const resetFilters = () => {
    setVisibleCount(30);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : value);
    resetFilters();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as typeof sortBy);
    resetFilters();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetFilters();
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_LOAD);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setPriceMin("");
    setPriceMax("");
    setMinRating("all");
    setMaxDeliveryDays("all");
    setSortBy("newest");
    setVisibleCount(30);
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
      in_progress: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Truck },
      delivered: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: Package },
      completed: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle },
      disputed: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", icon: AlertCircle },
    };
    const config = statusConfig[status || "pending"];
    const Icon = config?.icon || Clock;
    return (
      <Badge className={config?.color || "bg-muted"}>
        <Icon className="w-3 h-3 mr-1" />
        {status?.replace("_", " ") || "pending"}
      </Badge>
    );
  };

  const canCreatePackages = (trustLevel?.trustLevel ?? 0) >= 3;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" data-testid="text-marketplace-title">
            <ShoppingCart className="w-6 h-6" />
            Service Marketplace
          </h2>
          <p className="text-muted-foreground mt-1">
            Hire experts or offer your services to the community
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canCreatePackages && (
            <Dialog open={isCreatePackageOpen} onOpenChange={setIsCreatePackageOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-package">
                  <Plus className="w-4 h-4 mr-2" /> Offer a Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Service Package</DialogTitle>
                  <DialogDescription>
                    List your service for community members to purchase
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Select value={newPackage.categoryId} onValueChange={(v) => setNewPackage({ ...newPackage, categoryId: v })}>
                    <SelectTrigger data-testid="select-package-category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Service title..."
                    value={newPackage.title}
                    onChange={(e) => setNewPackage({ ...newPackage, title: e.target.value })}
                    data-testid="input-package-title"
                  />
                  <Textarea
                    placeholder="Describe what you offer..."
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                    className="min-h-[100px]"
                    data-testid="input-package-description"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Price ($)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newPackage.price}
                        onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                        data-testid="input-package-price"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Delivery (days)</label>
                      <Input
                        type="number"
                        placeholder="7"
                        value={newPackage.deliveryDays}
                        onChange={(e) => setNewPackage({ ...newPackage, deliveryDays: parseInt(e.target.value) || 7 })}
                        data-testid="input-package-delivery"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatePackageOpen(false)}>Cancel</Button>
                  <Button
                    onClick={() => createPackageMutation.mutate(newPackage)}
                    disabled={!newPackage.title || !newPackage.categoryId || !newPackage.price || createPackageMutation.isPending}
                    data-testid="button-submit-package"
                  >
                    Create Package
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <TabsList>
          <TabsTrigger value="browse" data-testid="tab-browse">Browse Services</TabsTrigger>
          <TabsTrigger value="my-orders" data-testid="tab-my-orders">My Orders</TabsTrigger>
          {canCreatePackages && (
            <TabsTrigger value="my-packages" data-testid="tab-my-packages">My Packages</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse" className="mt-6 space-y-4">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                data-testid="input-search-packages"
              />
            </div>
            <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px]" data-testid="select-sort">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="orders">Most Popular</SelectItem>
                <SelectItem value="delivery_fast">Fastest Delivery</SelectItem>
                <SelectItem value="delivery_slow">Longest Delivery</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("cards")}
                data-testid="button-view-cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "rows" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("rows")}
                data-testid="button-view-rows"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Price:</span>
              <Input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => { setPriceMin(e.target.value); resetFilters(); }}
                className="w-20"
                data-testid="input-price-min"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => { setPriceMax(e.target.value); resetFilters(); }}
                className="w-20"
                data-testid="input-price-max"
              />
            </div>
            <Select value={minRating} onValueChange={(v) => { setMinRating(v); resetFilters(); }}>
              <SelectTrigger className="w-[140px]" data-testid="select-min-rating">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
              </SelectContent>
            </Select>
            <Select value={maxDeliveryDays} onValueChange={(v) => { setMaxDeliveryDays(v); resetFilters(); }}>
              <SelectTrigger className="w-[160px]" data-testid="select-max-delivery">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Delivery Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Delivery</SelectItem>
                <SelectItem value="3">Within 3 days</SelectItem>
                <SelectItem value="7">Within 7 days</SelectItem>
                <SelectItem value="14">Within 14 days</SelectItem>
                <SelectItem value="30">Within 30 days</SelectItem>
              </SelectContent>
            </Select>
            {(selectedCategory || searchQuery || priceMin || priceMax || minRating !== "all" || maxDeliveryDays !== "all") && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} data-testid="button-clear-filters">
                <Filter className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {packagesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !filteredAndSortedPackages?.length ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No services available yet.</p>
                {canCreatePackages && <p className="text-sm mt-2">Be the first to offer a service!</p>}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span data-testid="text-results-count">
                  Showing {visiblePackages?.length || 0} of {filteredAndSortedPackages.length} services
                </span>
              </div>
              
              {viewMode === "cards" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visiblePackages?.map((pkg) => (
                    <Card 
                      key={pkg.id} 
                      className="cursor-pointer hover-elevate"
                      onClick={() => setSelectedPackage(pkg)}
                      data-testid={`card-package-${pkg.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg line-clamp-1">{pkg.title}</CardTitle>
                          <Badge variant="secondary" className="shrink-0">
                            {categories?.find(c => c.id === pkg.categoryId)?.name || "Other"}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {Number(pkg.averageRating || 0).toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {pkg.deliveryDays} days
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl font-bold text-primary flex items-center gap-1">
                            <DollarSign className="w-5 h-5" />
                            {Number(pkg.price).toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">{pkg.totalOrders} orders</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {visiblePackages?.map((pkg) => (
                    <Card 
                      key={pkg.id} 
                      className="cursor-pointer hover-elevate"
                      onClick={() => setSelectedPackage(pkg)}
                      data-testid={`row-package-${pkg.id}`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{pkg.title}</h3>
                              <Badge variant="secondary" className="shrink-0 text-xs">
                                {categories?.find(c => c.id === pkg.categoryId)?.name || "Other"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{pkg.description}</p>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {Number(pkg.averageRating || 0).toFixed(1)}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {pkg.deliveryDays}d
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <ShoppingCart className="w-4 h-4" />
                              {pkg.totalOrders}
                            </span>
                            <span className="text-lg font-bold text-primary flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {Number(pkg.price).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    className="min-w-[200px]"
                    data-testid="button-load-more"
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Load More ({filteredAndSortedPackages.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="my-orders" className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Button
              variant={orderViewType === "buyer" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderViewType("buyer")}
              data-testid="button-view-buyer"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> As Buyer
            </Button>
            <Button
              variant={orderViewType === "provider" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderViewType("provider")}
              data-testid="button-view-provider"
            >
              <Package className="w-4 h-4 mr-2" /> As Provider
            </Button>
          </div>

          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !myOrders?.length ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <Card key={order.id} data-testid={`card-order-${order.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <CardTitle className="text-lg">{order.package?.title || "Service Order"}</CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <CardDescription className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {Number(order.price).toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(order.createdAt || "").toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  {order.requirements && (
                    <CardContent className="py-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Requirements:</strong> {order.requirements}
                      </p>
                    </CardContent>
                  )}
                  {order.deliveryNotes && (
                    <CardContent className="py-2">
                      <p className="text-sm">
                        <strong>Delivery Notes:</strong> {order.deliveryNotes}
                      </p>
                    </CardContent>
                  )}
                  <CardFooter className="pt-2 gap-2 flex-wrap">
                    {orderViewType === "provider" && order.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderMutation.mutate({ id: order.id, status: "in_progress" })}
                        disabled={updateOrderMutation.isPending}
                        data-testid={`button-start-order-${order.id}`}
                      >
                        Start Working
                      </Button>
                    )}
                    {orderViewType === "provider" && order.status === "in_progress" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderMutation.mutate({ id: order.id, status: "delivered" })}
                        disabled={updateOrderMutation.isPending}
                        data-testid={`button-deliver-order-${order.id}`}
                      >
                        Mark Delivered
                      </Button>
                    )}
                    {orderViewType === "buyer" && order.status === "delivered" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateOrderMutation.mutate({ id: order.id, status: "completed" })}
                          disabled={updateOrderMutation.isPending}
                          data-testid={`button-complete-order-${order.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Accept Delivery
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewDialogOrder(order)}
                          data-testid={`button-review-order-${order.id}`}
                        >
                          <Star className="w-4 h-4 mr-1" /> Leave Review
                        </Button>
                      </>
                    )}
                    {order.status === "completed" && orderViewType === "buyer" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReviewDialogOrder(order)}
                        data-testid={`button-review-completed-${order.id}`}
                      >
                        <Star className="w-4 h-4 mr-1" /> Leave Review
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {canCreatePackages && (
          <TabsContent value="my-packages" className="mt-6 space-y-4">
            {myPackagesLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !myPackages?.length ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't created any service packages yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myPackages.map((pkg) => (
                  <Card key={pkg.id} data-testid={`card-my-package-${pkg.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <CardTitle className="text-lg">{pkg.title}</CardTitle>
                        <Badge variant={pkg.status === "active" ? "default" : "secondary"}>
                          {pkg.status}
                        </Badge>
                      </div>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center gap-6 text-sm flex-wrap">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {Number(pkg.price).toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {pkg.deliveryDays} days
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {Number(pkg.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          {pkg.totalOrders} orders
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!selectedPackage} onOpenChange={(open) => !open && setSelectedPackage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPackage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedPackage.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 flex-wrap mt-2">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {Number(selectedPackage.averageRating || 0).toFixed(1)} rating
                  </span>
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="w-4 h-4" />
                    {selectedPackage.totalOrders} orders
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedPackage.deliveryDays} day delivery
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedPackage.description || "No description provided."}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-2xl font-bold text-primary flex items-center gap-1">
                    <DollarSign className="w-6 h-6" />
                    {Number(selectedPackage.price).toFixed(2)}
                  </span>
                  <Button onClick={() => setIsOrderDialogOpen(true)} data-testid="button-order-package">
                    <ShoppingCart className="w-4 h-4 mr-2" /> Order Now
                  </Button>
                </div>
                {selectedPackageReviews && selectedPackageReviews.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Reviews</h4>
                    <div className="space-y-3">
                      {selectedPackageReviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`w-4 h-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt || "").toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && <p className="text-sm">{review.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
            <DialogDescription>
              Provide your requirements for {selectedPackage?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Describe your specific requirements..."
              value={orderRequirements}
              onChange={(e) => setOrderRequirements(e.target.value)}
              className="min-h-[120px]"
              data-testid="input-order-requirements"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedPackage && createOrderMutation.mutate({ 
                packageId: selectedPackage.id, 
                requirements: orderRequirements 
              })}
              disabled={!orderRequirements.trim() || createOrderMutation.isPending}
              data-testid="button-confirm-order"
            >
              Confirm Order (${Number(selectedPackage?.price || 0).toFixed(2)})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reviewDialogOrder} onOpenChange={(open) => !open && setReviewDialogOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this service
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    size="icon"
                    variant="ghost"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    data-testid={`button-rating-${star}`}
                  >
                    <Star 
                      className={`w-6 h-6 ${star <= reviewData.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                    />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
              <Textarea
                placeholder="Share your experience..."
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="min-h-[100px]"
                data-testid="input-review-comment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOrder(null)}>Cancel</Button>
            <Button
              onClick={() => reviewDialogOrder && submitReviewMutation.mutate({ 
                orderId: reviewDialogOrder.id, 
                rating: reviewData.rating,
                comment: reviewData.comment 
              })}
              disabled={submitReviewMutation.isPending}
              data-testid="button-submit-review"
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

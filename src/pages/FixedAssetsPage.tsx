
import { AssetList } from "@/components/fixed-assets/AssetList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function FixedAssetsPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fixed Assets</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage asset lifecycle, additions, retirements, and depreciation.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Asset
                    </Button>
                    <Button variant="outline">Run Depreciation</Button>
                </div>
            </div>

            <Separator />

            <AssetList />
        </div>
    );
}

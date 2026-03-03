
import { AssetList } from "@/components/fixed-assets/AssetList";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { EnterpriseContextSwitcher } from "@/components/enterprise/EnterpriseContextSwitcher";

export default function FixedAssetsPage() {
    const [leId, setLeId] = useState<string>();
    return (
        <StandardPage
      title="Fixed Assets"
      description="Manage asset lifecycle, additions, retirements, and                     Manage asset lifecycle, additions, retirements, and depreciation.
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <EnterpriseContextSwitcher type="legal-entity" value={leId} onChange={setLeId} className="mr-2" />
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Asset
                    </Button>
                    <Button variant="outline">Run Depreciation</Button>
                </div>
            </div>

            <Separator />

            <AssetList />
        </StandardPage>
  );
}

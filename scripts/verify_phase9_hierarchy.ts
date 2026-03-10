
import { partyService } from "../server/services/PartyService";

async function verifyPhase9Hierarchy() {
    console.log("Starting MDM Phase 9 (Hierarchy) Verification...");

    try {
        // 1. Create Parent Org
        console.log("\n[1] Creating Parent Organization...");
        const parent = await partyService.createOrganization(
            { partyName: "Mega Corp Global", partyNumber: `ORG_P_${Date.now()}`, status: "A" },
            { dunsNumber: "999-000-111", taxReference: "US-TAX-1", organizationName: "Mega Corp Global" }
        );
        console.log("   ✅ Parent Created:", parent.party.partyName, parent.party.id);

        // 2. Create Child Org
        console.log("\n[2] Creating Child Organization...");
        const child = await partyService.createOrganization(
            { partyName: "Mega Corp USA", partyNumber: `ORG_C_${Date.now()}`, status: "A" },
            { dunsNumber: "999-000-222", taxReference: "US-TAX-2", organizationName: "Mega Corp USA" }
        );
        console.log("   ✅ Child Created:", child.party.partyName, child.party.id);

        // 3. Create Relationship (Child is SUBSIDIARY_OF Parent)
        console.log("\n[3] Creating Relationship...");
        await partyService.createRelationship({
            subjectId: child.party.id,
            objectId: parent.party.id,
            relationshipCode: "SUBSIDIARY_OF",
            relationshipType: "HIERARCHY",
            status: "A"
        });
        console.log("   ✅ Relationship Created: Child -(SUBSIDIARY_OF)-> Parent");

        // 4. Verify Relationships from Child's Perspective
        console.log("\n[4] Verifying from Child Perspective...");
        const childRels = await partyService.getRelationships(child.party.id);
        const parentLink = childRels.find(r => r.objectId === parent.party.id);
        if (parentLink && parentLink.relatedPartyName === "Mega Corp Global") {
            console.log("   ✅ Child correctly sees Parent:", parentLink.relatedPartyName);
            console.log("   ✅ Direction:", parentLink.direction); // Should be 'Subject' (Child is Subject)
        } else {
            throw new Error("Child failed to see Parent relationship");
        }

        // 5. Verify Relationships from Parent's Perspective
        console.log("\n[5] Verifying from Parent Perspective...");
        const parentRels = await partyService.getRelationships(parent.party.id);
        const childLink = parentRels.find(r => r.subjectId === child.party.id);
        if (childLink && childLink.relatedPartyName === "Mega Corp USA") {
            console.log("   ✅ Parent correctly sees Child:", childLink.relatedPartyName);
            console.log("   ✅ Direction:", childLink.direction); // Should be 'Object' (Parent is Object)
        } else {
            throw new Error("Parent failed to see Child relationship");
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

verifyPhase9Hierarchy();

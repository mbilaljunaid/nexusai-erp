
import { partyService } from "../server/services/PartyService";
import { locationService } from "../server/services/LocationService";
import { referenceDataService } from "../server/services/ReferenceDataService";
import { hzParties } from "../shared/schema/parties";
import { db } from "../server/db";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("Starting MDM Phase 7 (TCA) Verification...");

    try {
        // 1. Verify Reference Data (Lookups)
        console.log("\n[1] Verifying Reference Data...");
        const uniqueSuffix = Date.now().toString();
        const lookupType = await referenceDataService.createLookupType({
            lookupType: "HZ_TYPE_" + uniqueSuffix.substring(8),
            userLookupName: "Test Party Type",
            description: "Verification Lookup",
            customizationLevel: "U"
        });
        console.log("Created Lookup Type:", lookupType.lookupType);

        const lookupValue = await referenceDataService.createLookupValue({
            lookupTypeId: lookupType.id,
            lookupCode: "TEST_ORG",
            meaning: "Test Organization",
            description: "A test organization type",
            enabledFlag: true,
            sortOrder: 1
        });
        console.log("Created Lookup Value:", lookupValue.lookupCode);

        // 2. Verify Party Creation (Organization)
        console.log("\n[2] Verifying Organization Party Creation...");
        const orgName = "Acme Corp Verification " + uniqueSuffix;
        const { party: orgParty, profile: orgProfile } = await partyService.createOrganization(
            {
                partyName: orgName,
                partyNumber: "ORG-" + uniqueSuffix,
                email: "info@acme.test",
                partyType: 'ORGANIZATION' // Explicitly sent though service sets it
            },
            {
                organizationName: orgName,
                dunsNumber: "123456789"
            }
        );
        console.log(`Created Organization: ${orgParty.partyName} (ID: ${orgParty.id})`);

        if (!orgProfile) throw new Error("Organization Profile not created!");
        if (orgProfile.partyId !== orgParty.id) throw new Error("Profile link mismatch!");

        // 3. Verify Party Creation (Person)
        console.log("\n[3] Verifying Person Party Creation...");
        const personName = "John Doe " + uniqueSuffix;
        const { party: personParty, profile: personProfile } = await partyService.createPerson(
            {
                partyName: personName,
                partyNumber: "PER-" + uniqueSuffix,
                email: "john@doe.test",
                partyType: 'PERSON'
            },
            {
                personFirstName: "John",
                personLastName: "Doe"
            }
        );
        console.log(`Created Person: ${personParty.partyName} (ID: ${personParty.id})`);

        // 4. Verify Location Creation
        console.log("\n[4] Verifying Location Creation...");
        const location = await locationService.createLocation({
            address1: "123 verification St",
            city: "Test City",
            country: "US",
            validationStatus: "UNVALIDATED" // Should be auto-validated by mock logic
        });
        console.log(`Created Location: ${location.id} (${location.address1})`);

        if (location.validationStatus !== 'VALIDATED') {
            console.warn("Warning: Location mock validation did not trigger.");
        }

        // 5. Verify Party Site Linkage
        console.log("\n[5] Verifying Party Site Linkage...");
        const partySite = await locationService.createPartySite({
            partyId: orgParty.id,
            locationId: location.id,
            siteName: "Headquarters Test",
            status: "A"
        });
        console.log(`Linked Location to Party via PartySite: ${partySite.id}`);

        // 6. Verify Site Uses
        console.log("\n[6] Verifying Site Uses...");
        const siteUse = await locationService.createPartySiteUse({
            partySiteId: partySite.id,
            siteUseType: "BILL_TO",
            status: 'A'
        });
        console.log(`Created Site Use: ${siteUse.siteUseType} for Site: ${partySite.id}`);

        // 7. Test Retrieval
        console.log("\n[7] Verifying Retrieval...");
        const fetchedParty = await partyService.getParty(orgParty.id);
        if (!fetchedParty || fetchedParty.party.id !== orgParty.id) throw new Error("Failed to fetch party");
        console.log("Fetched Party successfully.");

        const partyLocations = await locationService.getPartyLocations(orgParty.id);
        if (partyLocations.length === 0) throw new Error("Failed to fetch party locations");
        console.log(`Fetched ${partyLocations.length} locations for party.`);

        console.log("\n--- Verification SUCCESS ---");
        process.exit(0);
    } catch (e: any) {
        console.error("Verification FAILED:", e);
        process.exit(1);
    }
}

verify();

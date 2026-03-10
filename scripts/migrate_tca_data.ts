
import { db } from "../server/db";
import { suppliers } from "../shared/schema/scm";
import { accounts, contacts } from "../shared/schema/crm";
import { partyService } from "../server/services/PartyService";
import { eq, isNull } from "drizzle-orm";

async function migrate() {
    console.log("Starting TCA Data Migration...");

    // 1. Migrate Suppliers
    const allSuppliers = await db.select().from(suppliers).where(isNull(suppliers.partyId));
    console.log(`Found ${allSuppliers.length} suppliers to migrate.`);

    for (const supplier of allSuppliers) {
        const partyNumber = "SUP-" + Math.floor(Math.random() * 1000000);

        const { party, profile } = await partyService.createOrganization(
            {
                partyName: supplier.name,
                partyNumber: partyNumber,
                partyType: 'ORGANIZATION',
                email: supplier.email,
            },
            {
                organizationName: supplier.name,
            }
        );

        await db.update(suppliers)
            .set({ partyId: party.id })
            .where(eq(suppliers.id, supplier.id));

        console.log(`Migrated Supplier: ${supplier.name} -> Party: ${party.id}`);
    }

    // 2. Migrate Accounts (Customers)
    const allAccounts = await db.select().from(accounts).where(isNull(accounts.partyId));
    console.log(`Found ${allAccounts.length} accounts to migrate.`);

    for (const account of allAccounts) {
        const partyNumber = "ACCT-" + Math.floor(Math.random() * 1000000);

        const { party } = await partyService.createOrganization(
            {
                partyName: account.name,
                partyNumber: partyNumber,
                partyType: 'ORGANIZATION',
            },
            {
                organizationName: account.name,
                industryCode: account.industry,
            }
        );

        await db.update(accounts)
            .set({ partyId: party.id })
            .where(eq(accounts.id, account.id));

        console.log(`Migrated Account: ${account.name} -> Party: ${party.id}`);
    }

    // 3. Migrate Contacts
    const allContacts = await db.select().from(contacts).where(isNull(contacts.partyId));
    console.log(`Found ${allContacts.length} contacts to migrate.`);

    for (const contact of allContacts) {
        const fullName = `${contact.firstName} ${contact.lastName}`;
        const partyNumber = "CONT-" + Math.floor(Math.random() * 1000000);

        const { party } = await partyService.createPerson(
            {
                partyName: fullName,
                partyNumber: partyNumber,
                partyType: 'PERSON',
                email: contact.email,
            },
            {
                personFirstName: contact.firstName,
                personLastName: contact.lastName,
            }
        );

        await db.update(contacts)
            .set({ partyId: party.id })
            .where(eq(contacts.id, contact.id));

        console.log(`Migrated Contact: ${fullName} -> Party: ${party.id}`);
    }

    console.log("Migration Complete.");
    process.exit(0);
}

migrate().catch(console.error);

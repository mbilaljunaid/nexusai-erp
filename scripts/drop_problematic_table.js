
import pkg from 'pg';
const { Client } = pkg;

async function dropTable() {
    const client = new Client({
        connectionString: "postgresql://nexusai:nexusai_dev@localhost:5432/nexusai"
    });
    await client.connect();
    try {
        await client.query(`DROP TABLE IF EXISTS maint_work_order_materials CASCADE;`);
        console.log("Dropped maint_work_order_materials");
    } finally {
        await client.end();
    }
}

dropTable().catch(console.error);

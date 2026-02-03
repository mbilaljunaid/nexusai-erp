
import pkg from 'pg';
const { Client } = pkg;

async function checkConstraints() {
    const client = new Client({
        connectionString: "postgresql://nexusai:nexusai_dev@localhost:5432/nexusai"
    });
    await client.connect();
    try {
        const res = await client.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      JOIN pg_class ON pg_class.oid = pg_constraint.conrelid 
      WHERE relname = 'maint_work_order_materials';
    `);
        console.log(JSON.stringify(res.rows, null, 2));
    } finally {
        await client.end();
    }
}

checkConstraints().catch(console.error);

const { Client } = require('pg');

async function checkDb() {
    const client = new Client({
        connectionString: "postgresql://postgres.jxdbbhfspqkxdjvxdvoq:01005515962Eslam@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    });

    try {
        await client.connect();
        
        const prescriptionCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Prescription'");
        console.log("Prescription columns:");
        console.log(prescriptionCols.rows.map(r => r.column_name).join(', '));
        
        const labCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'LabInvestigation'");
        console.log("\nLabInvestigation columns:");
        console.log(labCols.rows.map(r => r.column_name).join(', '));

        const lookupCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Lookup'");
        console.log("\nLookup columns:");
        console.log(lookupCols.rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

checkDb();

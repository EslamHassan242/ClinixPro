const { Client } = require('pg');

async function checkDb() {
    const client = new Client({
        connectionString: "postgresql://postgres.jxdbbhfspqkxdjvxdvoq:01005515962Eslam@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    });

    try {
        await client.connect();
        console.log("Connected successfully");
        
        const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables info:");
        console.log(tablesRes.rows.map(r => r.table_name).join(', '));
        
        const medicalRecordCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'MedicalRecord'");
        console.log("\nMedicalRecord columns:");
        console.log(medicalRecordCols.rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

checkDb();

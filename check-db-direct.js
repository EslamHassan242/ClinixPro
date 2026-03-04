const { Client } = require('pg');

async function checkDb() {
    // Using port 5432 on the pooler host
    const connectionString = "postgresql://postgres.jxdbbhfspqkxdjvxdvoq:01005515962Eslam@aws-1-eu-central-1.pooler.supabase.com:5432/postgres";
    
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log("Connected successfully to DIRECT PORT 5432");
        
        const res = await client.query("SELECT current_user");
        console.log("Current user:", res.rows[0].current_user);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

checkDb();

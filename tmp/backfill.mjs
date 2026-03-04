// node tmp/backfill.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Load env
const envPath = new URL("../apps/web/.env", import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const fs = require("fs");
const envContent = fs.readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envContent.split("\n").filter(l => l.trim() && !l.startsWith("#")).map(l => {
    const idx = l.indexOf("=");
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
  })
);

const DATABASE_URL = env.DATABASE_URL;
const CLERK_SECRET_KEY = env.CLERK_SECRET_KEY;

if (!DATABASE_URL || !CLERK_SECRET_KEY) {
  console.error("Missing DATABASE_URL or CLERK_SECRET_KEY");
  process.exit(1);
}

// Use pg directly to query
const { default: pg } = await import("pg");
const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL });

console.log("Querying admin profiles...");
const result = await pool.query(
  `SELECT id, "tenantId", "fullName", email FROM "Profile" WHERE role = 'admin'`
);
console.log(`Found ${result.rows.length} admin(s)`);

for (const admin of result.rows) {
  if (admin.id.startsWith("pending_")) {
    console.log(`⏭️  Skipping: ${admin.email}`);
    continue;
  }
  console.log(`Updating Clerk metadata for: ${admin.fullName} (${admin.email}) ID: ${admin.id}`);
  const res = await fetch(`https://api.clerk.com/v1/users/${admin.id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_metadata: { onboarded: true, tenantId: admin.tenantId, role: "admin" },
    }),
  });
  
  if (res.ok) {
    console.log(`✅ Done: ${admin.fullName}`);
  } else {
    const err = await res.text();
    console.error(`❌ Failed: ${err}`);
  }
}

await pool.end();
console.log("\nDone! Sign out and sign back in for changes to take effect.");

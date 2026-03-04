// Run: node tmp/backfill-clerk-metadata.js
// This backfills Clerk metadata for all existing onboarded users in the DB

const { PrismaClient } = require("../node_modules/@prisma/client");
require("dotenv").config({ path: "apps/web/.env" });

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY not found in apps/web/.env");
  process.exit(1);
}

async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  console.log("Fetching all admin profiles...");
  const admins = await prisma.profile.findMany({
    where: { role: "admin" },
    select: { id: true, tenantId: true, fullName: true, email: true },
  });

  console.log(`Found ${admins.length} admin profile(s) to backfill.`);

  for (const admin of admins) {
    // Skip placeholder IDs (from old broken implementation)
    if (admin.id.startsWith("pending_")) {
      console.log(`⏭️  Skipping placeholder profile: ${admin.email}`);
      continue;
    }

    try {
      const res = await fetch(`https://api.clerk.com/v1/users/${admin.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_metadata: {
            onboarded: true,
            tenantId: admin.tenantId,
            role: "admin",
          },
        }),
      });

      if (res.ok) {
        console.log(`✅ Updated Clerk metadata for: ${admin.fullName} (${admin.email})`);
      } else {
        const err = await res.text();
        console.error(`❌ Failed for ${admin.email}: ${err}`);
      }
    } catch (err) {
      console.error(`❌ Error for ${admin.email}:`, err.message);
    }
  }

  await prisma.$disconnect();
  console.log("\nDone! Your Clerk metadata has been backfilled.");
  console.log("Sign out and sign back in for the changes to take effect.");
}

main();

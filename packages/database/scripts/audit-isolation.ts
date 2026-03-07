import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runAudit() {
    console.log("Starting Tenant Isolation Audit...");

    const tables = [
        "Patient", "Appointment", "MedicalRecord", "Invoice", "Prescription",
        "LabInvestigation", "QueueTicket", "VitalSigns", "Diagnosis"
    ];

    let violations = 0;

    for (const table of tables) {
        // @ts-ignore
        const missingTenantId = await prisma[table.toLowerCase()].findMany({
            where: { tenantId: null }
        });

        if (missingTenantId.length > 0) {
            console.error(`CRITICAL: Table ${table} has ${missingTenantId.length} records with NULL tenantId!`);
            violations += missingTenantId.length;
        }

        // Add more complex checks here if needed (e.g. relation consistency)
    }

    if (violations === 0) {
        console.log("SUCCESS: All tables passed tenant isolation audit.");
    } else {
        console.error(`FAILURE: ${violations} isolation violations found.`);
        process.exit(1);
    }
}

runAudit()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

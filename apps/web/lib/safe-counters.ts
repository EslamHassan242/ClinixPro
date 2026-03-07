import { prisma } from "@clinixpro/database";

export type CounterType = "MRN" | "INVOICE";

/**
 * Atomically increments and returns the next value for a tenant-specific counter.
 * Uses Prisma upsert with increment which translates to atomic 'UPDATE ... SET count = count + 1' in Postgres.
 */
export async function getNextCounterValue(tenantId: string, type: CounterType): Promise<number> {
    const counter = await prisma.tenantCounter.upsert({
        where: {
            tenantId_type: {
                tenantId,
                type,
            },
        },
        update: {
            count: {
                increment: 1,
            },
        },
        create: {
            tenantId,
            type,
            count: 1,
        },
    });

    return counter.count;
}

/**
 * Formats a counter value into a branded identifier (e.g., CP-2026-1001).
 */
export function formatIdentifier(type: CounterType, value: number): string {
    const year = new Date().getFullYear();
    const prefix = type === "MRN" ? "CP" : "INV";
    const padded = value.toString().padStart(4, "0");
    return `${prefix}-${year}-${padded}`;
}

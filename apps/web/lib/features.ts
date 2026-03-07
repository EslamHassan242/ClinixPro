"use server";

import { prisma } from "@clinixpro/database";
import { getTenantId } from "@/lib/auth-utils";
import { cache } from "./redis";

/**
 * Checks if a specific feature is enabled for the clinic.
 */
export async function isFeatureEnabled(feature: string): Promise<boolean> {
    const tenantId = await getTenantId();

    // Try cache first
    const cachedStatus = await cache.get(tenantId, `feature:${feature}`);
    if (cachedStatus !== null) return cachedStatus;

    const record = await prisma.clinicFeature.findUnique({
        where: { tenantId_feature: { tenantId, feature } },
        select: { isEnabled: true }
    });

    const isEnabled = record?.isEnabled || false;

    // Store in cache for 1 hour
    await cache.set(tenantId, `feature:${feature}`, isEnabled, 3600);

    return isEnabled;
}

/**
 * Updates a feature's status and invalidates cache.
 */
export async function toggleFeature(feature: string, isEnabled: boolean) {
    const tenantId = await getTenantId();

    await prisma.clinicFeature.upsert({
        where: { tenantId_feature: { tenantId, feature } },
        update: { isEnabled },
        create: { tenantId, feature, isEnabled }
    });

    // Invalidate cache
    await cache.del(tenantId, `feature:${feature}`);
}

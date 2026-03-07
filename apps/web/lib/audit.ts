"use server";

import { prisma } from "@clinixpro/database";
import { getTenantId, getSessionUser, getUserProfile } from "@/lib/auth-utils";

export async function recordAuditLog(data: {
    action: "CREATE" | "UPDATE" | "DELETE" | "VIEW";
    entityType: string;
    entityId: string;
    details?: string;
    oldValues?: any;
    newValues?: any;
}) {
    const tenantId = await getTenantId();
    const user = await getSessionUser();

    // Get clinical profile ID (with identity healing)
    let profile: any;
    try {
        profile = await getUserProfile();
    } catch (e) {
        console.error("[AuditLog] Failed to get user profile:", e);
    }

    return prisma.auditLog.create({
        data: {
            ...data,
            tenantId,
            userId: profile?.id || "system",
            ipAddress: "N/A",
            userAgent: "Server Action",
        }
    });
}

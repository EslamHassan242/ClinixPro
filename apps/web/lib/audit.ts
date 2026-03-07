"use server";

import { prisma } from "@clinixpro/database";
import { getTenantId, getSessionUser } from "@/lib/auth-utils";

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

    // Get clinical profile ID
    let profile = await prisma.profile.findUnique({
        where: { clerkId_tenantId: { clerkId: user.id, tenantId } }
    });

    // Fallback: Link existing profiles by email if clerkId is missing
    if (!profile && user.email) {
        const existingProfile = await prisma.profile.findFirst({
            where: { email: user.email, tenantId, clerkId: null },
            select: { id: true }
        });

        if (existingProfile) {
            profile = await prisma.profile.update({
                where: { id: existingProfile.id },
                data: { clerkId: user.id }
            });
        }
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

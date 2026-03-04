"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";

async function getTenantId() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const profile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { tenantId: true },
    });

    if (!profile) throw new Error("No profile found");
    return profile.tenantId;
}

export async function getLookups(type?: string) {
    const tenantId = await getTenantId();
    return prisma.lookup.findMany({
        where: {
            tenantId,
            type: type || undefined,
            isActive: true,
        },
        orderBy: { name: "asc" },
    });
}

export async function createLookup(data: { type: string; name: string; description?: string; category?: string }) {
    const tenantId = await getTenantId();
    const lookup = await prisma.lookup.create({
        data: {
            ...data,
            tenantId,
        },
    });
    revalidatePath("/dashboard/settings/lookups");
    return lookup;
}

export async function updateLookup(id: string, data: any) {
    const tenantId = await getTenantId();
    const lookup = await prisma.lookup.update({
        where: { id, tenantId },
        data,
    });
    revalidatePath("/dashboard/settings/lookups");
    return lookup;
}

export async function deleteLookup(id: string) {
    const tenantId = await getTenantId();
    await prisma.lookup.delete({
        where: { id, tenantId },
    });
    revalidatePath("/dashboard/settings/lookups");
}

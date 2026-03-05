"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";

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

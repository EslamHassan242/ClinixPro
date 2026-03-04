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

export async function getServices() {
    const tenantId = await getTenantId();

    return prisma.service.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
    });
}

export async function createService(data: { name: string; description?: string; duration: number; price: number; taxRate?: number }) {
    const tenantId = await getTenantId();

    const service = await prisma.service.create({
        data: {
            ...data,
            tenantId,
        },
    });

    revalidatePath("/dashboard/settings/services");
    return service;
}

export async function updateService(id: string, data: { name: string; description?: string; duration: number; price: number; taxRate?: number; isActive?: boolean }) {
    const tenantId = await getTenantId();

    const service = await prisma.service.update({
        where: { id, tenantId },
        data,
    });

    revalidatePath("/dashboard/settings/services");
    return service;
}

export async function deleteService(id: string) {
    const tenantId = await getTenantId();

    const service = await prisma.service.delete({
        where: { id, tenantId },
    });

    revalidatePath("/dashboard/settings/services");
    return service;
}

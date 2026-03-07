"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";

/**
 * Working Hours
 */
export async function getWorkingHours() {
    const tenantId = await getTenantId();
    return prisma.workingHour.findMany({
        where: { tenantId },
        orderBy: { dayOfWeek: "asc" },
    });
}

export async function updateWorkingHours(data: { dayOfWeek: number; isOpen: boolean; startTime?: string; endTime?: string }[]) {
    const tenantId = await getTenantId();

    const updates = data.map(wh =>
        prisma.workingHour.upsert({
            where: {
                tenantId_dayOfWeek: {
                    tenantId,
                    dayOfWeek: wh.dayOfWeek
                }
            },
            update: {
                isWorking: wh.isOpen,
                startTime: wh.startTime,
                endTime: wh.endTime,
            },
            create: {
                tenantId,
                dayOfWeek: wh.dayOfWeek,
                isWorking: wh.isOpen,
                startTime: wh.startTime,
                endTime: wh.endTime,
            }
        })
    );

    await prisma.$transaction(updates);
    revalidatePath("/dashboard/settings/clinic");
    return { success: true };
}

/**
 * Holidays
 */
export async function getHolidays() {
    const tenantId = await getTenantId();
    return prisma.holiday.findMany({
        where: { tenantId },
        orderBy: { date: "asc" },
    });
}

export async function createHoliday(data: { name: string; date: Date; isRecurring?: boolean }) {
    const tenantId = await getTenantId();
    const holiday = await prisma.holiday.create({
        data: {
            ...data,
            tenantId,
        }
    });
    revalidatePath("/dashboard/settings/clinic");
    return holiday;
}

export async function deleteHoliday(id: string) {
    const tenantId = await getTenantId();
    await prisma.holiday.delete({
        where: { id, tenantId }
    });
    revalidatePath("/dashboard/settings/clinic");
}

/**
 * Clinic Profile
 */
export async function updateClinicProfile(data: { name: string; email?: string; phone?: string; address?: string }) {
    const tenantId = await getTenantId();
    const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
        }
    });
    revalidatePath("/dashboard/settings/clinic");
    return tenant;
}

export async function getClinicProfile() {
    const tenantId = await getTenantId();
    return prisma.tenant.findUnique({
        where: { id: tenantId }
    });
}

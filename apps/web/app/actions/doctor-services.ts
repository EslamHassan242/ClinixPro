"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";

/**
 * Assigns a service to a doctor with a custom price and duration.
 */
export async function upsertDoctorService(data: {
    doctorId: string;
    serviceId: string;
    price: number;
    duration: number;
}) {
    const tenantId = await getTenantId();

    const ds = await prisma.doctorService.upsert({
        where: {
            tenantId_doctorId_serviceId: {
                tenantId,
                doctorId: data.doctorId,
                serviceId: data.serviceId,
            }
        },
        update: {
            price: data.price,
            duration: data.duration,
        },
        create: {
            ...data,
            tenantId,
        },
    });

    revalidatePath("/dashboard/settings/services");
    return ds;
}

/**
 * Records a system metric for SaaS analytics.
 */
export async function recordMetric(type: string, value: number) {
    const tenantId = await getTenantId();

    return prisma.systemMetric.create({
        data: {
            tenantId,
            metricType: type,
            metricValue: value,
        }
    });
}

/**
 * Gets metrics for a tenant over a period.
 */
export async function getTenantMetrics(type: string, days: number = 30) {
    const tenantId = await getTenantId();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.systemMetric.findMany({
        where: {
            tenantId,
            metricType: type,
            recordedAt: { gte: startDate }
        },
        orderBy: { recordedAt: "asc" }
    });
}

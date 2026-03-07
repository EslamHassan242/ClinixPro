"use server";

import { prisma } from "@clinixpro/database";
import { getTenantId } from "@/lib/auth-utils";
import { cache } from "./redis";

/**
 * Gets revenue summary by doctor for a specific date range.
 */
export async function getDoctorRevenue(startDate: Date, endDate: Date) {
    const tenantId = await getTenantId();
    const cacheKey = `analytics:doctor-revenue:${startDate.toISOString()}-${endDate.toISOString()}`;

    const cached = await cache.get(tenantId, cacheKey);
    if (cached) return cached;

    const report = await prisma.payment.groupBy({
        by: ["createdBy"], // creation identity
        where: {
            tenantId,
            paidAt: { gte: startDate, lte: endDate },
            status: "completed"
        },
        _sum: { amount: true },
        _count: { id: true }
    });

    // TODO: Map profile names to IDs

    await cache.set(tenantId, cacheKey, report, 3600); // 1-hour cache
    return report;
}

/**
 * Gets patient retention metrics (New vs Returning)
 */
export async function getPatientRetention(startDate: Date, endDate: Date) {
    const tenantId = await getTenantId();

    const [totalPatients, newPatients] = await Promise.all([
        prisma.patient.count({ where: { tenantId } }),
        prisma.patient.count({
            where: {
                tenantId,
                createdAt: { gte: startDate, lte: endDate }
            }
        })
    ]);

    return {
        total: totalPatients,
        new: newPatients,
        returning: totalPatients - newPatients,
        retentionRate: ((totalPatients - newPatients) / totalPatients) * 100
    };
}

/**
 * Gets no-show analytics for appointments (Phase G3)
 */
export async function getNoShowAnalytics(startDate: Date, endDate: Date) {
    const tenantId = await getTenantId();

    const appointments = await prisma.appointment.groupBy({
        by: ["status"],
        where: {
            tenantId,
            appointmentDate: { gte: startDate, lte: endDate }
        },
        _count: { id: true }
    });

    const total = appointments.reduce((sum, a) => sum + a._count.id, 0);
    const noShows = appointments.find(a => a.status === "no-show")?._count.id || 0;

    return {
        total,
        noShows,
        noShowRate: (noShows / total) * 100
    };
}

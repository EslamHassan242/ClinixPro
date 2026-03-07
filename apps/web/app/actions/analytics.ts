"use server";

import { prisma } from "@clinixpro/database";
import { getTenantId } from "@/lib/auth-utils";
import { startOfDay, endOfDay, subDays } from "date-fns";

/**
 * Gets financial analytics for a tenant.
 */
export async function getFinancialAnalytics(range: "7d" | "30d" | "90d" = "30d") {
    const tenantId = await getTenantId();
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const startDate = subDays(new Date(), days);

    const [revenueByDoctor, revenueByService, dailyRevenue] = await Promise.all([
        // Revenue by Doctor
        prisma.invoice.groupBy({
            by: ["tenantId", "status"],
            where: {
                tenantId,
                status: "paid",
                issueDate: { gte: startDate }
            },
            _sum: { total: true }
        }),
        // Revenue by Service (from Invoice Items JSON)
        // Since it's JSON, we might need a more complex query or aggregate manually
        prisma.invoice.findMany({
            where: { tenantId, status: "paid", issueDate: { gte: startDate } },
            select: { items: true, total: true }
        }),
        // Daily Revenue Trend
        prisma.invoice.groupBy({
            by: ["issueDate"],
            where: { tenantId, status: "paid", issueDate: { gte: startDate } },
            _sum: { total: true },
            orderBy: { issueDate: "asc" }
        })
    ]);

    // Manual aggregation for items (JSON) if needed
    // For now, let's keep it simple

    return {
        dailyRevenue,
        totalRevenue: dailyRevenue.reduce((sum, day) => sum + (day._sum.total || 0), 0)
    };
}

/**
 * Gets operational analytics (Wait times, etc.)
 */
export async function getOperationalAnalytics() {
    const tenantId = await getTenantId();
    const startDate = subDays(new Date(), 30);

    const tickets = await prisma.queueTicket.findMany({
        where: {
            tenantId,
            status: "completed",
            registeredAt: { gte: startDate }
        },
        select: {
            registeredAt: true,
            calledAt: true,
            startedAt: true,
            completedAt: true
        }
    });

    if (tickets.length === 0) return { avgWaitTime: 0, avgConsultationTime: 0 };

    let totalWaitTime = 0; // Registration to Called
    let totalConsultationTime = 0; // Started to Completed

    tickets.forEach(ticket => {
        if (ticket.calledAt) {
            totalWaitTime += ticket.calledAt.getTime() - ticket.registeredAt.getTime();
        }
        if (ticket.startedAt && ticket.completedAt) {
            totalConsultationTime += ticket.completedAt.getTime() - ticket.startedAt.getTime();
        }
    });

    return {
        avgWaitTime: (totalWaitTime / tickets.length) / (1000 * 60), // in minutes
        avgConsultationTime: (totalConsultationTime / tickets.length) / (1000 * 60), // in minutes
        totalPatients: tickets.length
    };
}

/**
 * Cron-ready action to record daily metrics into SystemMetric table
 */
export async function recordDailyMetrics() {
    const tenantId = await getTenantId();
    const yesterday = subDays(new Date(), 1);
    const start = startOfDay(yesterday);
    const end = endOfDay(yesterday);

    const [patientCount, revenue] = await Promise.all([
        prisma.patient.count({
            where: { tenantId, createdAt: { gte: start, lte: end } }
        }),
        prisma.invoice.aggregate({
            where: { tenantId, status: "paid", issueDate: { gte: start, lte: end } },
            _sum: { total: true }
        })
    ]);

    await prisma.systemMetric.createMany({
        data: [
            { tenantId, metricType: "daily_new_patients", metricValue: patientCount },
            { tenantId, metricType: "daily_revenue", metricValue: revenue._sum.total || 0 }
        ]
    });

    return { success: true };
}

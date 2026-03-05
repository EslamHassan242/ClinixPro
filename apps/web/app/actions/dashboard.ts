"use server";

import { prisma } from "@clinixpro/database";
import { redirect } from "next/navigation";
import { getTenantId } from "@/lib/auth-utils";

export async function getDashboardStats() {
    const tenantId = await getTenantId();

    const [patientCount, appointmentCount, revenue] = await Promise.all([
        prisma.patient.count({ where: { tenantId } }),
        prisma.appointment.count({ where: { tenantId } }),
        prisma.invoice.aggregate({
            where: {
                tenantId,
                status: "paid"
            },
            _sum: {
                total: true
            }
        })
    ]);

    // Fetch recent activities (e.g., last 5 appointments)
    const recentAppointments = await prisma.appointment.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { patient: true }
    });

    return {
        patientCount,
        appointmentCount,
        revenue: (revenue._sum?.total as number) ?? 0,
        recentAppointments
    };
}

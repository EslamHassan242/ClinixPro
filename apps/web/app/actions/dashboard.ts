"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@clinixpro/database";
import { redirect } from "next/navigation";

async function getTenantId() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const profile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { tenantId: true },
    });

    if (!profile) {
        redirect("/onboarding");
    }
    return profile.tenantId;
}

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

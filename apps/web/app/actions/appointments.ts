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

export async function getAppointments(date?: Date) {
    const tenantId = await getTenantId();

    const appointments = await prisma.appointment.findMany({
        where: {
            tenantId,
            appointmentDate: date ? {
                gte: new Date(date.setHours(0, 0, 0, 0)),
                lt: new Date(date.setHours(23, 59, 59, 999)),
            } : undefined,
        },
        include: {
            patient: true,
            doctor: true,
        },
        orderBy: { startTime: "asc" },
    });

    return appointments;
}

export async function createAppointment(data: any) {
    const tenantId = await getTenantId();

    const appointmentData = { ...data };
    if (!appointmentData.doctorId) {
        appointmentData.doctorId = null;
    }

    const appointment = await prisma.appointment.create({
        data: {
            ...appointmentData,
            tenantId,
        },
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard");
    return appointment;
}

export async function updateAppointmentStatus(id: string, status: string) {
    const tenantId = await getTenantId();

    const appointment = await prisma.appointment.update({
        where: { id, tenantId },
        data: { status },
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard/queue");
    revalidatePath("/dashboard");
    return appointment;
}

export async function getActiveQueue() {
    const tenantId = await getTenantId();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // Use a wider window (24h before, 48h after) to capture all potentially active appointments
    // across all timezones (especially midnight-normalized ones)
    const startWindow = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const endWindow = new Date(today.getTime() + 48 * 60 * 60 * 1000);

    return prisma.appointment.findMany({
        where: {
            tenantId,
            appointmentDate: {
                gte: startWindow,
                lt: endWindow,
            },
            status: {
                in: ["scheduled", "waiting", "called", "ready", "in-progress"]
            }
        },
        include: {
            patient: true,
            doctor: true,
        },
        orderBy: {
            updatedAt: "asc"
        }
    });
}

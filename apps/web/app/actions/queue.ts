"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";

/**
 * Registers a patient into the daily queue.
 */
export async function registerForQueue(data: {
    patientId: string;
    doctorId?: string;
    serviceId?: string;
    appointmentId?: string;
    notes?: string;
}) {
    const tenantId = await getTenantId();

    // Generate daily queue number for the doctor (or general if no doctor)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.queueTicket.count({
        where: {
            tenantId,
            doctorId: data.doctorId || null,
            registeredAt: {
                gte: today
            }
        }
    });

    const ticket = await prisma.queueTicket.create({
        data: {
            ...data,
            tenantId,
            queueNumber: count + 1,
            status: "waiting",
        }
    });

    // If there's an appointment, link it
    if (data.appointmentId) {
        await prisma.appointment.update({
            where: { id: data.appointmentId, tenantId },
            data: { status: "waiting" }
        });
    }

    revalidatePath("/dashboard/queue");
    return ticket;
}

/**
 * Updates queue ticket status (called, in_progress, completed, etc.)
 */
export async function updateQueueStatus(ticketId: string, status: string) {
    const tenantId = await getTenantId();

    const updateData: any = { status };

    if (status === "called") updateData.calledAt = new Date();
    if (status === "in_progress") updateData.startedAt = new Date();
    if (status === "completed") updateData.completedAt = new Date();

    const ticket = await prisma.queueTicket.update({
        where: { id: ticketId, tenantId },
        data: updateData,
        include: { appointment: true }
    });

    // Sync status back to appointment if linked
    if (ticket.appointmentId) {
        await prisma.appointment.update({
            where: { id: ticket.appointmentId, tenantId },
            data: { status }
        });
    }

    revalidatePath("/dashboard/queue");
    revalidatePath("/dashboard/doctor"); // Revalidate doctor dashboard
    return ticket;
}

/**
 * Fetches the active queue for a specific clinic, optionally filtered by doctor.
 */
export async function getQueue(doctorId?: string) {
    const tenantId = await getTenantId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.queueTicket.findMany({
        where: {
            tenantId,
            doctorId: doctorId || undefined,
            registeredAt: { gte: today },
            status: { notIn: ["completed", "cancelled", "absent"] }
        },
        include: {
            patient: true,
            doctor: true,
            appointment: true
        },
        orderBy: [
            { status: "desc" }, // Put 'in_progress' and 'called' at top
            { queueNumber: "asc" }
        ]
    });
}

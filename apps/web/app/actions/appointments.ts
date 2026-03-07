"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";
import { registerForQueue } from "./queue";
import { format } from "date-fns";

export async function getAppointments(date?: Date) {
    const tenantId = await getTenantId();

    const appointments = await prisma.appointment.findMany({
        where: {
            tenantId,
            deletedAt: null,
            appointmentDate: date ? {
                gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
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

    // 1. Enforce Overlap Prevention (Phase B4)
    if (appointmentData.doctorId) {
        const overlap = await prisma.appointment.findFirst({
            where: {
                tenantId,
                doctorId: appointmentData.doctorId,
                appointmentDate: appointmentData.appointmentDate,
                deletedAt: null,
                status: { notIn: ["cancelled", "no-show"] },
                AND: [
                    { startTime: { lt: appointmentData.endTime } },
                    { endTime: { gt: appointmentData.startTime } }
                ]
            }
        });

        if (overlap) {
            throw new Error("This doctor already has an appointment during this time slot.");
        }
    }

    // 2. Enforce Clinic Working Hours & Holidays (Phase C1)
    const appointmentDate = new Date(appointmentData.appointmentDate);
    const dayOfWeek = appointmentDate.getDay(); // 0-6
    const dateStr = format(appointmentDate, "yyyy-MM-dd");

    const [workingHour, holiday] = await Promise.all([
        prisma.workingHour.findUnique({
            where: { tenantId_dayOfWeek: { tenantId, dayOfWeek } }
        }),
        prisma.holiday.findFirst({
            where: {
                tenantId,
                OR: [
                    { date: new Date(dateStr) },
                    { date: new Date(dateStr), isRecurring: true }
                ]
            }
        })
    ]);

    if (holiday) {
        throw new Error(`The clinic is closed for holiday: ${holiday.name}`);
    }

    if (!workingHour || !workingHour.isWorking) {
        throw new Error("The clinic is closed on this day.");
    }

    if (workingHour.startTime && workingHour.endTime) {
        const appointmentTime = format(appointmentDate, "HH:mm");
        if (appointmentTime < workingHour.startTime || appointmentTime > workingHour.endTime) {
            throw new Error(`Appointment time must be between ${workingHour.startTime} and ${workingHour.endTime}.`);
        }
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

    const startWindow = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const endWindow = new Date(today.getTime() + 48 * 60 * 60 * 1000);

    return prisma.appointment.findMany({
        where: {
            tenantId,
            deletedAt: null,
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

export async function deleteAppointment(id: string) {
    const tenantId = await getTenantId();

    await prisma.appointment.update({
        where: { id, tenantId },
        data: { deletedAt: new Date() }
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Checks in an appointment, converting it to a Queue Ticket (Phase C1)
 */
export async function checkInAppointment(appointmentId: string) {
    const tenantId = await getTenantId();

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId, tenantId },
        include: { patient: true }
    });

    if (!appointment) throw new Error("Appointment not found");
    if (appointment.status !== "scheduled") throw new Error("Only scheduled appointments can be checked in");

    // Convert to queue ticket
    const ticket = await registerForQueue({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId || undefined,
        appointmentId: appointment.id,
        notes: "Checked in from appointment"
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard/queue");
    revalidatePath("/dashboard");

    return ticket;
}

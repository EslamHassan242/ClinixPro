"use server";

import { prisma } from "@clinixpro/database";
import { backgroundQueue } from "./queue";
import { addHours, startOfHour, endOfHour } from "date-fns";

/**
 * Scans for upcoming appointments and enqueues reminders.
 * This should be called by a cron job every hour.
 */
export async function scheduleUpcomingReminders() {
    const now = new Date();
    const targetTime = addHours(now, 24); // Remind 24 hours in advance

    const windowStart = startOfHour(targetTime);
    const windowEnd = endOfHour(targetTime);

    const appointments = await prisma.appointment.findMany({
        where: {
            reminderSent: false,
            status: "scheduled",
            appointmentDate: {
                gte: windowStart,
                lte: windowEnd
            }
        },
        include: {
            patient: true,
            tenant: true
        }
    });

    console.log(`Scheduling ${appointments.length} reminders for ${targetTime.toISOString()}`);

    for (const app of appointments) {
        await backgroundQueue.add("SEND_REMINDER", {
            type: "SEND_REMINDER",
            data: {
                appointmentId: app.id,
                tenantId: app.tenantId,
                patientName: app.patient.fullName,
                patientPhone: app.patient.phone,
                appointmentDate: app.appointmentDate
            }
        });

        // Mark as scheduled for reminder
        await prisma.appointment.update({
            where: { id: app.id },
            data: { reminderSent: true }
        });
    }

    return { scheduled: appointments.length };
}

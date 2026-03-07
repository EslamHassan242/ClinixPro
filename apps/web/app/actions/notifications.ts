"use server";

import { backgroundQueue } from "@/lib/queue";

export type NotificationChannel = "sms" | "email" | "whatsapp";

interface NotificationPayload {
    tenantId: string;
    userId: string;
    type: "appointment_reminder" | "lab_ready" | "payment_confirmed";
    channel: NotificationChannel[];
    content: string;
    metadata?: any;
}

/**
 * Enqueues a notification job for asynchronous processing.
 */
export async function sendNotification(payload: NotificationPayload) {
    await backgroundQueue.add("SEND_NOTIFICATION", {
        type: "SEND_NOTIFICATION",
        data: payload,
    });

    return { success: true, message: "Notification enqueued." };
}

/**
 * Specialized helper for appointment reminders
 */
export async function sendAppointmentReminder(data: {
    tenantId: string;
    patientPhone: string;
    patientEmail?: string;
    appointmentTime: string;
}) {
    return sendNotification({
        tenantId: data.tenantId,
        userId: "system",
        type: "appointment_reminder",
        channel: ["sms", "whatsapp"],
        content: `Reminder: Your appointment is scheduled for ${data.appointmentTime}.`,
        metadata: {
            phone: data.patientPhone,
            email: data.patientEmail,
        }
    });
}

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

export async function createMedicalRecord(data: any) {
    const tenantId = await getTenantId();
    const { prescriptions, labRequests, radiologyRequests, appointmentId, ...recordData } = data;

    const record = await prisma.$transaction(async (tx) => {
        // 1. Create the medical record
        const newRecord = await tx.medicalRecord.create({
            data: {
                ...recordData,
                tenantId,
                appointmentId,
                visitDate: new Date(),
                prescriptions: {
                    create: (prescriptions || []).map((p: any) => ({
                        medicineName: p.name,
                        dosage: p.dosage,
                        frequency: p.frequency,
                        duration: p.duration,
                        instructions: p.instructions,
                        lookupId: p.lookupId,
                    })),
                },
                labRequests: {
                    create: (labRequests || []).map((l: any) => ({
                        testName: l.name,
                        type: l.type || 'LAB',
                        targetOrgan: l.targetOrgan,
                        priority: l.priority,
                        notes: l.notes,
                    })),
                },
            },
        });

        // 2. If it's linked to an appointment, mark appointment as completed
        if (appointmentId) {
            await tx.appointment.update({
                where: { id: appointmentId },
                data: { status: 'completed' }
            });
        }

        return newRecord;
    });

    revalidatePath(`/dashboard/patients/${data.patientId}`);
    revalidatePath("/dashboard/medical-records");
    if (appointmentId) revalidatePath("/dashboard/appointments");
    return record;
}

export async function getMedicalRecords(patientId?: string) {
    const tenantId = await getTenantId();

    return prisma.medicalRecord.findMany({
        where: {
            tenantId,
            patientId: patientId || undefined,
        },
        include: {
            patient: true,
            doctor: true,
            prescriptions: true,
            labRequests: true,
        },
        orderBy: { visitDate: "desc" },
    });
}

export async function getMedicalRecordById(id: string) {
    const tenantId = await getTenantId();

    return prisma.medicalRecord.findUnique({
        where: {
            id,
            tenantId,
        },
        include: {
            patient: true,
            doctor: true,
            prescriptions: true,
            labRequests: true,
        },
    });
}

export async function updateInvestigationResult(id: string, result: string, resultImageUrls: string[]) {
    const tenantId = await getTenantId();

    const updated = await prisma.labInvestigation.update({
        where: { id },
        data: {
            results: result,
            resultImageUrls: resultImageUrls,
            status: 'completed',
            updatedAt: new Date()
        }
    });

    return updated;
}

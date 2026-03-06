"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";

export async function createMedicalRecord(data: any) {
    const tenantId = await getTenantId();
    const { prescriptions, labRequests, radiologyRequests, appointmentId, ...recordData } = data;

    const record = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
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
    revalidatePath("/dashboard/queue");
    revalidatePath("/dashboard");
    if (appointmentId) revalidatePath("/dashboard/appointments");
    return record;
}

export async function updateMedicalRecord(id: string, data: any) {
    const tenantId = await getTenantId();
    const { prescriptions, labRequests, radiologyRequests, ...recordData } = data;

    const record = await prisma.$transaction(async (tx) => {
        // 1. Update the medical record
        const updatedRecord = await tx.medicalRecord.update({
            where: { id, tenantId },
            data: {
                ...recordData,
                updatedAt: new Date(),
            },
        });

        // 2. Handle prescriptions (Delete old ones and create new ones for simplicity in this MVP, 
        // or more complex sync if needed. Let's do a simple sync: delete all linked and recreate)
        await tx.prescription.deleteMany({ where: { medicalRecordId: id } });
        if (prescriptions && prescriptions.length > 0) {
            await tx.prescription.createMany({
                data: prescriptions.map((p: any) => ({
                    medicalRecordId: id,
                    medicineName: p.medicineName || p.name,
                    dosage: p.dosage,
                    frequency: p.frequency,
                    duration: p.duration,
                    instructions: p.instructions,
                    lookupId: p.lookupId,
                })),
            });
        }

        // 3. Handle lab/radiology requests (Syncing investigations)
        // For simplicity, we'll keep existing ones and add new ones or update. 
        // But usually, medical records are snapshots. If we edit, we update the note part.
        // Let's just update the core record fields for now as requested for "adding details".

        return updatedRecord;
    });

    revalidatePath(`/dashboard/patients/${data.patientId}`);
    revalidatePath(`/dashboard/medical-records/${id}`);
    revalidatePath("/dashboard/medical-records");
    revalidatePath("/dashboard/queue");
    revalidatePath("/dashboard");
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

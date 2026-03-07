"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";
import { recordAuditLog } from "@/lib/audit";

export async function createMedicalRecord(data: any) {
    const tenantId = await getTenantId();
    const { prescriptions, labRequests, radiologyRequests, appointmentId, diagnoses, vitalSigns, ...recordData } = data;

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
                        tenantId: tenantId,
                    })),
                },
                labRequests: {
                    create: (labRequests || []).map((l: any) => ({
                        testName: l.name,
                        type: l.type || 'LAB',
                        targetOrgan: l.targetOrgan,
                        priority: l.priority,
                        notes: l.notes,
                        tenantId: tenantId,
                    })),
                },
                diagnoses: {
                    create: (diagnoses || []).map((d: any) => ({
                        description: d.description,
                        icd10Code: d.icd10Code,
                        isMain: d.isMain || false,
                        tenantId: tenantId,
                    })),
                },
                vitalSigns: vitalSigns ? {
                    create: {
                        ...vitalSigns,
                        tenantId: tenantId,
                    }
                } : undefined,
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
    const { prescriptions, labRequests, radiologyRequests, diagnoses, vitalSigns, ...recordData } = data;

    const record = await prisma.$transaction(async (tx) => {
        // 1. Update the medical record
        const updatedRecord = await tx.medicalRecord.update({
            where: { id, tenantId },
            data: {
                ...recordData,
                updatedAt: new Date(),
            },
        });

        // 2. Handle prescriptions (Sync)
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
                    tenantId: tenantId,
                })),
            });
        }

        // 3. Handle Diagnoses (Sync)
        await tx.diagnosis.deleteMany({ where: { medicalRecordId: id } });
        if (diagnoses && diagnoses.length > 0) {
            await tx.diagnosis.createMany({
                data: diagnoses.map((d: any) => ({
                    medicalRecordId: id,
                    description: d.description,
                    icd10Code: d.icd10Code,
                    isMain: d.isMain || false,
                    tenantId: tenantId,
                })),
            });
        }

        // 4. Handle Vital Signs (Upsert)
        if (vitalSigns) {
            await tx.vitalSigns.upsert({
                where: { medicalRecordId: id },
                update: { ...vitalSigns },
                create: {
                    ...vitalSigns,
                    medicalRecordId: id,
                    tenantId: tenantId,
                },
            });
        }

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
            deletedAt: null
        },
        include: {
            patient: true,
            doctor: true,
            prescriptions: true,
            labRequests: true,
            diagnoses: true,
            vitalSigns: true,
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
            diagnoses: true,
            vitalSigns: true,
        },
    });
}

export async function updateInvestigationResult(id: string, result: string, resultImageUrls: string[]) {
    const tenantId = await getTenantId();

    const updated = await prisma.labInvestigation.update({
        where: { id, tenantId },
        data: {
            results: result,
            resultImageUrls: resultImageUrls,
            status: 'completed',
            updatedAt: new Date()
        }
    });

    return updated;
}

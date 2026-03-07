"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";
import { getNextCounterValue, formatIdentifier } from "@/lib/safe-counters";
import { recordAuditLog } from "@/lib/audit";

export async function getPatients(query?: string) {
    const tenantId = await getTenantId();

    return prisma.patient.findMany({
        where: {
            tenantId,
            deletedAt: null,
            OR: query ? [
                { fullName: { contains: query, mode: "insensitive" } },
                { phone: { contains: query } },
                { mrn: { contains: query, mode: "insensitive" } },
            ] : undefined,
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createPatient(data: any) {
    const tenantId = await getTenantId();

    // 1. Check if phone exists (extra safety before db constraint)
    if (data.phone) {
        const existing = await prisma.patient.findFirst({
            where: { tenantId, phone: data.phone, deletedAt: null }
        });
        if (existing) {
            throw new Error(`A patient with phone number ${data.phone} already exists.`);
        }
    }

    const patient = await prisma.$transaction(async (tx) => {
        // 2. Generate MRN using Tenant-Scoped counter for SaaS isolation
        const nextValue = await getNextCounterValue(tenantId, "MRN");
        const mrn = formatIdentifier("MRN", nextValue);

        // 3. Create Patient
        const p = await tx.patient.create({
            data: {
                ...data,
                tenantId,
                mrn,
            },
        });

        // 4. Record Audit Log
        await recordAuditLog({
            action: "CREATE",
            entityType: "Patient",
            entityId: p.id,
            details: `Created patient ${p.fullName} with MRN ${mrn}`
        });

        return p;
    });

    revalidatePath("/dashboard/patients");
    return patient;
}

export async function getPatientById(id: string) {
    const tenantId = await getTenantId();

    const patient = await prisma.patient.findFirst({
        where: { id, tenantId, deletedAt: null },
        include: {
            appointments: {
                where: { deletedAt: null },
                orderBy: { startTime: "desc" },
                take: 5,
            },
            medicalRecords: {
                where: { deletedAt: null },
                include: {
                    prescriptions: true,
                    labRequests: true,
                    diagnoses: true,
                    vitalSigns: true,
                },
                orderBy: { visitDate: "desc" },
                take: 10,
            },
        },
    });

    return patient;
}

export async function checkPatientExists(phone: string, fullName: string) {
    const tenantId = await getTenantId();

    const conditions: any[] = [
        { fullName: { equals: fullName, mode: "insensitive" } }
    ];

    if (phone && phone.trim()) {
        conditions.push({ phone });
    }

    const existing = await prisma.patient.findFirst({
        where: {
            tenantId,
            deletedAt: null,
            OR: conditions
        },
        select: { id: true, fullName: true, phone: true }
    });

    return existing;
}

export async function deletePatient(id: string) {
    const tenantId = await getTenantId();

    await prisma.patient.update({
        where: { id, tenantId },
        data: { deletedAt: new Date() }
    });

    await recordAuditLog({
        action: "DELETE",
        entityType: "Patient",
        entityId: id,
        details: `Soft deleted patient ${id}`
    });

    revalidatePath("/dashboard/patients");
    return { success: true };
}

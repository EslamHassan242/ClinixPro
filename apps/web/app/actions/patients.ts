"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";

export async function getPatients(query?: string) {
    const tenantId = await getTenantId();

    return prisma.patient.findMany({
        where: {
            tenantId,
            OR: query
                ? [
                    { fullName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                    { mrn: { contains: query, mode: "insensitive" } },
                    { phone: { contains: query, mode: "insensitive" } },
                ]
                : undefined,
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createPatient(data: any) {
    const tenantId = await getTenantId();

    // 1. Check if phone exists (extra safety before db constraint)
    if (data.phone) {
        const existing = await prisma.patient.findFirst({
            where: { tenantId, phone: data.phone }
        });
        if (existing) {
            throw new Error(`A patient with phone number ${data.phone} already exists.`);
        }
    }

    const patient = await prisma.$transaction(async (tx) => {
        // 2. Generate MRN
        const count = await tx.patient.count({ where: { tenantId } });
        const year = new Date().getFullYear();
        const mrn = `CP-${year}-${(count + 1).toString().padStart(4, "0")}`;

        // 3. Create Patient
        return tx.patient.create({
            data: {
                ...data,
                tenantId,
                mrn,
            },
        });
    });

    revalidatePath("/dashboard/patients");
    return patient;
}

export async function getPatientById(id: string) {
    const tenantId = await getTenantId();

    const patient = await prisma.patient.findFirst({
        where: { id, tenantId },
        include: {
            appointments: {
                orderBy: { startTime: "desc" },
                take: 5,
            },
            medicalRecords: {
                include: {
                    prescriptions: true,
                    labRequests: true,
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
            OR: conditions
        },
        select: { id: true, fullName: true, phone: true }
    });

    return existing;
}

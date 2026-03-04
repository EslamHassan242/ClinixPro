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

export async function createInvoice(data: any) {
    const tenantId = await getTenantId();

    // Generate Invoice Number (e.g., INV-2026-0001)
    const count = await prisma.invoice.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, "0")}`;

    const invoice = await prisma.invoice.create({
        data: {
            ...data,
            tenantId,
            invoiceNumber,
            issueDate: new Date(),
        },
    });

    revalidatePath("/dashboard/billing");
    return invoice;
}

export async function getInvoices() {
    const tenantId = await getTenantId();

    const invoices = await prisma.invoice.findMany({
        where: { tenantId },
        include: {
            patient: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return invoices;
}

export async function updateInvoiceStatus(id: string, status: string) {
    const tenantId = await getTenantId();

    const invoice = await prisma.invoice.update({
        where: { id, tenantId },
        data: { status },
    });

    revalidatePath("/dashboard/billing");
    return invoice;
}

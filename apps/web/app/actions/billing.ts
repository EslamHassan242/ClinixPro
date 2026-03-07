"use server";

import { prisma } from "@clinixpro/database";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/auth-utils";
import { getNextCounterValue, formatIdentifier } from "@/lib/safe-counters";
import { recordAuditLog } from "@/lib/audit";

export async function createInvoice(data: any) {
    const tenantId = await getTenantId();

    // Generate Invoice Number using Tenant-Scoped counter for SaaS isolation
    const nextValue = await getNextCounterValue(tenantId, "INVOICE");
    const invoiceNumber = formatIdentifier("INVOICE", nextValue);

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

export async function addPayment(data: {
    invoiceId: string;
    amount: number;
    method: string;
    reference?: string;
    createdBy?: string;
}) {
    const tenantId = await getTenantId();

    return await prisma.$transaction(async (tx) => {
        // 1. Create payment
        await tx.payment.create({
            data: {
                ...data,
                tenantId,
                status: "completed",
                paidAt: new Date(),
            },
        });

        // 2. Update invoice paid amount and status
        const invoice = await tx.invoice.findUnique({
            where: { id: data.invoiceId, tenantId },
            include: { payments: true }
        });

        if (invoice) {
            const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
            const newStatus = totalPaid >= invoice.total ? "paid" : "partially_paid";

            await tx.invoice.update({
                where: { id: data.invoiceId, tenantId },
                data: {
                    paidAmount: totalPaid,
                    status: newStatus,
                },
            });
        }

        revalidatePath("/dashboard/billing");
        return { success: true };
    });
}

export async function getInvoices() {
    const tenantId = await getTenantId();

    const invoices = await prisma.invoice.findMany({
        where: { tenantId, deletedAt: null },
        include: {
            patient: true,
            payments: true,
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

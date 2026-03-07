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
    type?: string; // payment, refund
    reference?: string;
    createdBy?: string;
}) {
    const tenantId = await getTenantId();

    return await prisma.$transaction(async (tx) => {
        // 1. Create payment record
        const payment = await tx.payment.create({
            data: {
                ...data,
                tenantId,
                type: data.type || "payment",
                status: "completed",
                paidAt: new Date(),
            },
        });

        // 2. Update invoice summaries
        const invoice = await tx.invoice.findUnique({
            where: { id: data.invoiceId, tenantId },
            include: { payments: true }
        });

        if (invoice) {
            const totalPaid = (invoice.payments || []).reduce((sum, p) => {
                if (p.type === "refund") return sum - p.amount;
                return sum + p.amount;
            }, 0);

            const balance = (invoice.total + invoice.adjustmentAmount) - totalPaid;
            let newStatus = invoice.status;

            if (balance <= 0) newStatus = "paid";
            else if (totalPaid > 0) newStatus = "partially_paid";
            else newStatus = "sent";

            await tx.invoice.update({
                where: { id: data.invoiceId, tenantId },
                data: {
                    paidAmount: totalPaid,
                    balance: balance,
                    status: newStatus,
                },
            });

            // 3. Audit Log
            await recordAuditLog({
                action: "UPDATE",
                entityType: "Invoice",
                entityId: invoice.id,
                newValues: { paidAmount: totalPaid, balance, status: newStatus }
            });
        }

        revalidatePath("/dashboard/billing");
        return { success: true };
    });
}

/**
 * Adjusts an invoice amount (Phase G2)
 */
export async function adjustInvoice(id: string, amount: number, notes: string) {
    const tenantId = await getTenantId();

    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findUnique({
            where: { id, tenantId }
        });

        if (!invoice) throw new Error("Invoice not found");

        const newAdjustment = invoice.adjustmentAmount + amount;
        const newBalance = (invoice.total + newAdjustment) - invoice.paidAmount;
        const newStatus = newBalance <= 0 ? "paid" : (invoice.paidAmount > 0 ? "partially_paid" : "sent");

        await tx.invoice.update({
            where: { id, tenantId },
            data: {
                adjustmentAmount: newAdjustment,
                balance: newBalance,
                status: newStatus,
                notes: invoice.notes ? `${invoice.notes}\nAdjustment: ${notes}` : notes
            }
        });

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

/**
 * Insurance Claim Management (Phase G2)
 */
export async function createInsuranceClaim(data: {
    patientId: string;
    insurerName: string;
    policyNumber: string;
    amountClaimed: number;
    invoiceIds: string[];
}) {
    const tenantId = await getTenantId();

    return await prisma.$transaction(async (tx) => {
        const claim = await tx.insuranceClaim.create({
            data: {
                tenantId,
                patientId: data.patientId,
                insurerName: data.insurerName,
                policyNumber: data.policyNumber,
                status: "pending",
                amountClaimed: data.amountClaimed,
                invoices: {
                    connect: data.invoiceIds.map(id => ({ id }))
                }
            }
        });

        // Update invoices to link to this claim
        await tx.invoice.updateMany({
            where: { id: { in: data.invoiceIds }, tenantId },
            data: { status: "sent", paymentMethod: "insurance" } // Mark as sent to insurance
        });

        revalidatePath("/dashboard/billing");
        return claim;
    });
}

export async function getInsuranceClaims() {
    const tenantId = await getTenantId();

    return prisma.insuranceClaim.findMany({
        where: { tenantId },
        include: {
            patient: true,
            invoices: true
        },
        orderBy: { createdAt: "desc" }
    });
}

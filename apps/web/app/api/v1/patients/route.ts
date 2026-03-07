import { NextResponse } from "next/server";
import { prisma } from "@clinixpro/database";
import { getTenantId } from "@/lib/auth-utils";

/**
 * GET /api/v1/patients
 * Supports search via ?q=
 */
export async function GET(request: Request) {
    try {
        const tenantId = await getTenantId();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        const patients = await prisma.patient.findMany({
            where: {
                tenantId,
                deletedAt: null,
                OR: query ? [
                    { fullName: { contains: query, mode: "insensitive" } },
                    { phone: { contains: query } },
                    { mrn: { contains: query, mode: "insensitive" } },
                ] : undefined,
            },
            select: {
                id: true,
                mrn: true,
                fullName: true,
                phone: true,
                email: true,
                dateOfBirth: true,
                createdAt: true,
            },
            take: 50,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            status: "success",
            data: patients,
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 401 }
        );
    }
}

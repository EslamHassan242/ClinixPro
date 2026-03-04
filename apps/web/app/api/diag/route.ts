import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@clinixpro/database";

export async function GET() {
    const diag: any = {
        timestamp: new Date().toISOString(),
        env: {
            has_db_url: !!process.env.DATABASE_URL,
            has_clerk_pub: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            has_clerk_secret: !!process.env.CLERK_SECRET_KEY,
            node_env: process.env.NODE_ENV,
        }
    };

    try {
        const { userId } = await auth();
        diag.clerk = { status: "ok", userId };
    } catch (e: any) {
        diag.clerk = { status: "error", message: e.message };
    }

    try {
        // Try a simple query
        await prisma.$queryRaw`SELECT 1`;
        diag.database = { status: "ok" };
    } catch (e: any) {
        diag.database = { status: "error", message: e.message, code: e.code };
    }

    return NextResponse.json(diag);
}

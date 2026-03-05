import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";

export async function GET() {
    const diag: any = {
        timestamp: new Date().toISOString(),
        env: {
            has_db_url: !!process.env.DATABASE_URL,
            has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            has_supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            has_supabase_service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            node_env: process.env.NODE_ENV,
        }
    };

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        diag.supabase_auth = { status: "ok", userId: user?.id || null };
    } catch (e: any) {
        diag.supabase_auth = { status: "error", message: e.message };
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

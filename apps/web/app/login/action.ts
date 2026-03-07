"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";

export async function getPostLoginRedirect() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return "/login";

    let profile = await prisma.profile.findFirst({
        where: { clerkId: user.id },
        select: { id: true },
    });

    // Fallback: Link existing profiles by email if clerkId is missing
    if (!profile && user.email) {
        profile = await prisma.profile.findFirst({
            where: { email: user.email, clerkId: null },
            select: { id: true },
        });

        if (profile) {
            await prisma.profile.update({
                where: { id: profile.id },
                data: { clerkId: user.id },
            });
        }
    }

    if (!profile) return "/onboarding";

    return "/dashboard";
}

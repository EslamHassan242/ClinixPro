"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";

export async function getPostLoginRedirect() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return "/login";

    const profile = await prisma.profile.findFirst({
        where: { clerkId: user.id },
        select: { id: true },
    });

    if (!profile) return "/onboarding";

    return "/dashboard";
}

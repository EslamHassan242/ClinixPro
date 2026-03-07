"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";
import { getUserProfile } from "@/lib/auth-utils";

export async function getPostLoginRedirect() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return "/login";

    try {
        const profile = await getUserProfile();
        if (profile) return "/dashboard";
    } catch (error) {
        console.log("[Login] No profile found, redirecting to onboarding");
    }

    return "/onboarding";
}

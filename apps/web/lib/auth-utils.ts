import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";

export async function getSessionUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return user;
}

export async function getTenantId() {
    const profile = await getUserProfile();
    return profile.tenantId;
}

export async function getUserProfile() {
    const user = await getSessionUser();

    // 1. Try primary identity link (clerkId)
    let profile = await prisma.profile.findFirst({
        where: { clerkId: user.id },
        include: { tenant: true },
    });

    // 2. Identity Healing: Fallback to email if clerkId is missing
    if (!profile && user.email) {
        const existing = await prisma.profile.findFirst({
            where: { email: user.email, clerkId: null },
            include: { tenant: true },
        });

        if (existing) {
            console.log(`[AuthUtils] Healing profile ${existing.id} with clerkId ${user.id}`);
            profile = await prisma.profile.update({
                where: { id: existing.id },
                data: { clerkId: user.id },
                include: { tenant: true },
            });
        }
    }

    if (!profile) {
        console.error(`[AuthUtils] No profile found for user ${user.id} (${user.email})`);
        throw new Error("No clinical profile linked to this account.");
    }

    return profile;
}

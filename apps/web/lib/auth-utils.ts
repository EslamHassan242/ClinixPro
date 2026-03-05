import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";

export async function getSessionUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return user;
}

export async function getTenantId() {
    const user = await getSessionUser();

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { tenantId: true },
    });

    if (!profile) throw new Error("No profile found");
    return profile.tenantId;
}

export async function getUserProfile() {
    const user = await getSessionUser();

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        include: { tenant: true },
    });

    if (!profile) throw new Error("No profile found");
    return profile;
}

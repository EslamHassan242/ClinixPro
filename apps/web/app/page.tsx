import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Not signed in → middleware will handle sign-in redirect
    if (!user) {
        return redirect("/login");
    }

    // Check if user already has a clinic profile (Absolute Source of Truth)
    let profile = await prisma.profile.findFirst({
        where: { clerkId: user.id },
        select: { id: true, tenantId: true },
    });

    // Fallback: Link existing profiles by email if clerkId is missing
    if (!profile && user.email) {
        profile = await prisma.profile.findFirst({
            where: { email: user.email, clerkId: null },
            select: { id: true, tenantId: true },
        });

        if (profile) {
            await prisma.profile.update({
                where: { id: profile.id },
                data: { clerkId: user.id },
            });
        }
    }

    if (profile?.tenantId) {
        console.log(`[Root] User ${user.id} has profile, redirecting to /dashboard`);
        return redirect("/dashboard");
    } else {
        console.log(`[Root] User ${user.id} has NO profile, redirecting to /onboarding`);
        return redirect("/onboarding");
    }
}

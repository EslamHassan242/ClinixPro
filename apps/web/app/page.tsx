import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";
import { getUserProfile } from "@/lib/auth-utils";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Not signed in → middleware will handle sign-in redirect
    if (!user) {
        return redirect("/login");
    }

    // Check if user already has a clinic profile (Absolute Source of Truth)
    try {
        const profile = await getUserProfile();
        if (profile.tenantId) {
            console.log(`[Root] User ${user.id} has profile, redirecting to /dashboard`);
            return redirect("/dashboard");
        }
    } catch (error) {
        console.log(`[Root] User ${user.id} has NO profile or error, redirecting to /onboarding`, error);
    }

    return redirect("/onboarding");
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";
import { getUserProfile } from "@/lib/auth-utils";
import OnboardingForm from "./form";

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Not signed in → go to login
    if (!user) redirect("/login");

    // Already onboarded → go straight to dashboard
    try {
        const profile = await getUserProfile();
        if (profile?.tenantId) {
            return redirect("/dashboard");
        }
    } catch (error) {
        // Not onboarded yet or other error, stay on this page
        console.log("[Onboarding] No profile found, proceeding with onboarding form");
    }

    return <OnboardingForm />;
}

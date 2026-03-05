import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";
import OnboardingForm from "./form";

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Not signed in → go to login
    if (!user) redirect("/login");

    // Already onboarded → go straight to dashboard
    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { tenantId: true },
    });

    if (profile?.tenantId) {
        redirect("/dashboard");
    }

    return <OnboardingForm />;
}

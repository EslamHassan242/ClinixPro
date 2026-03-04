import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@clinixpro/database";
import OnboardingForm from "./form";

export default async function OnboardingPage() {
    const { userId } = await auth();

    // Not signed in → go to sign-in
    if (!userId) redirect("/sign-in");

    // Already onboarded → force metadata sync for the session and go straight to dashboard
    const profile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { tenantId: true },
    });

    if (profile?.tenantId) {
        // Force sync metadata so middleware recognizes the user immediately
        // We wrap this in try-catch because it's a "best-effort" sync; 
        // the DB is the source of truth and the app will work even if this fails.
        try {
            const { clerkClient } = await import("@clerk/nextjs/server");
            const clerk = await clerkClient();
            await clerk.users.updateUser(userId, {
                publicMetadata: {
                    onboarded: true,
                    tenantId: profile.tenantId,
                    role: "admin",
                },
            });
        } catch (e) {
            console.error("Failed to sync Clerk metadata in onboarding:", e);
        }
        
        redirect("/dashboard");
    }

    return <OnboardingForm />;
}

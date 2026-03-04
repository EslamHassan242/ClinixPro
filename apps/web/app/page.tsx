import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@clinixpro/database";

export default async function Home() {
    const { userId } = await auth();

    // Not signed in → middleware will handle sign-in redirect
    if (!userId) {
        return redirect("/sign-in");
    }

    // Check if user already has a clinic profile (Absolute Source of Truth)
    const profile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { tenantId: true },
    });

    if (profile?.tenantId) {
        console.log(`[Root] User ${userId} has profile, redirecting to /dashboard`);
        return redirect("/dashboard");
    } else {
        console.log(`[Root] User ${userId} has NO profile, redirecting to /onboarding`);
        return redirect("/onboarding");
    }
}

"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";
import { getUserProfile } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { z } from "zod";

const onboardingSchema = z.object({
    clinicName: z.string().min(3, "Clinic name must be at least 3 characters"),
    subdomain: z.string().min(3, "Subdomain must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
});

export async function onboardClinic(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: { _form: ["You must be signed in to complete onboarding."] } };
    }

    const rawData = {
        clinicName: formData.get("clinicName") as string,
        subdomain: formData.get("subdomain") as string,
    };

    const validation = onboardingSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    const { clinicName, subdomain } = validation.data;

    try {
        // 1. Check if subdomain is available
        const existingTenant = await prisma.tenant.findUnique({
            where: { subdomain },
        });

        if (existingTenant) {
            return { error: { subdomain: ["Subdomain is already taken"] } };
        }

        // 2. Create Tenant and Profile in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: clinicName,
                    subdomain: subdomain,
                    subscriptionPlan: "basic",
                },
            });

            const profile = await tx.profile.create({
                data: {
                    clerkId: user.id,
                    tenantId: tenant.id,
                    role: "admin",
                    email: user.email!,
                    fullName: user.user_metadata.full_name || user.email?.split('@')[0] || "Admin",
                },
            });

            return { tenant, profile }; // Return tenant and profile from the transaction
        }); // End Prisma transaction

        // 3. Update Supabase User Metadata (JWT Claims)
        const adminClient = await createAdminClient();
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
            user.id,
            { app_metadata: { tenant_id: result.tenant.id } }
        );

        if (updateError) {
            console.error("Failed to sync tenantId to JWT claims:", updateError);
            // We don't block the whole process, but log it
        }

        console.log("Clinic onboarded:", result);

        redirect("/dashboard");
    } catch (error) {
        console.error("Onboarding error:", error);
        return { error: { _form: ["Something went wrong during onboarding"] } };
    }
}

export async function checkOnboardingStatus() {
    try {
        return await getUserProfile();
    } catch (error) {
        return null;
    }
}

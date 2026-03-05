"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@clinixpro/database";
import { z } from "zod";

const signupSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    clinicName: z.string().min(3, "Clinic name must be at least 3 characters"),
    subdomain: z.string().min(3, "Subdomain must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
});

export async function signupWithClinic(formData: FormData) {
    const rawData = {
        fullName: formData.get("fullName") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        clinicName: formData.get("clinicName") as string,
        subdomain: formData.get("subdomain") as string,
    };

    const validation = signupSchema.safeParse(rawData);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    const { fullName, email, password, clinicName, subdomain } = validation.data;

    try {
        // 1. Check if subdomain is available
        const existingTenant = await prisma.tenant.findUnique({
            where: { subdomain },
        });

        if (existingTenant) {
            return { error: { subdomain: ["Subdomain is already taken"] } };
        }

        const supabase = await createClient();

        // 2. Sign up user in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (authError) {
            return { error: { _form: [authError.message] } };
        }

        if (!authData.user) {
            return { error: { _form: ["Failed to create user account"] } };
        }

        // 3. Create Tenant and Profile in Database
        // We do this in a try-catch, if it fails user might need to retry or we might need to cleanup
        // Note: In a production app, you might use a webhook or background job to ensure consistency
        await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: clinicName,
                    subdomain: subdomain,
                    subscriptionPlan: "basic",
                },
            });

            await tx.profile.create({
                data: {
                    id: authData.user!.id,
                    tenantId: tenant.id,
                    role: "admin",
                    email: email,
                    fullName: fullName,
                },
            });
        });

        return { success: true };
    } catch (error: any) {
        console.error("Signup with clinic error:", error);
        return { error: { _form: ["An unexpected error occurred during registration."] } };
    }
}

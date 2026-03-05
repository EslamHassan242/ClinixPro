"use server";

import { prisma } from "@clinixpro/database";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth-utils";

function generatePassword() {
    // Generate a strong 12-char password: letters + numbers + symbol
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
}

export async function createStaffMember(formData: FormData) {
    try {
        const adminProfile = await getUserProfile();

        if (adminProfile.role !== "admin") throw new Error("Only admins can add staff members");

        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const phone = (formData.get("phone") as string) || null;
        const role = formData.get("role") as string;
        const specialization = (formData.get("specialization") as string) || null;

        if (!fullName || !email || !role) {
            throw new Error("Full name, email, and role are required");
        }

        // Check for duplicate email in this tenant
        const existing = await prisma.profile.findFirst({
            where: { email, tenantId: adminProfile.tenantId },
        });
        if (existing) {
            throw new Error("A staff member with this email already exists");
        }

        const tempPassword = generatePassword();

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in .env. Automated user creation requires the Service Role Key.");
        }

        // Create real Supabase user account
        const supabaseAdmin = await createAdminClient();
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: role,
            }
        });

        if (authError) throw authError;

        // Create DB profile linked to the Supabase user ID
        await prisma.profile.create({
            data: {
                id: authUser.user.id,
                tenantId: adminProfile.tenantId,
                role: role as any,
                fullName,
                email,
                phone,
                specialization,
            },
        });

        // Return credentials to be handled by the client
        return {
            success: true,
            credentials: {
                email,
                password: tempPassword,
                fullName
            }
        };
    } catch (error: any) {
        console.error("Create staff error:", error);
        return { error: error.message || "Failed to create staff member" };
    }
}

export async function updateStaffMember(id: string, data: { fullName: string; role: string; phone?: string; specialization?: string; isActive: boolean }) {
    const adminProfile = await getUserProfile();

    if (adminProfile.role !== "admin") throw new Error("Only admins can edit staff members");

    const updated = await prisma.profile.update({
        where: { id, tenantId: adminProfile.tenantId },
        data: {
            fullName: data.fullName,
            role: data.role as any,
            phone: data.phone || null,
            specialization: data.specialization || null,
            isActive: data.isActive,
        },
    });

    try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabaseAdmin = await createAdminClient();
            await supabaseAdmin.auth.admin.updateUserById(id, {
                user_metadata: { full_name: data.fullName }
            });
        }
    } catch (e) {
        console.error("Failed to sync name to Supabase, but DB was updated", e);
    }

    return updated;
}

export async function getDoctors() {
    const profile = await getUserProfile();

    return await prisma.profile.findMany({
        where: {
            tenantId: profile.tenantId,
            role: "doctor",
            isActive: true
        },
        orderBy: { fullName: "asc" },
    });
}

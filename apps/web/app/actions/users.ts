"use server";

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@clinixpro/database";
import { redirect } from "next/navigation";

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
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const adminProfile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true },
    });

    if (!adminProfile) throw new Error("No admin profile found");
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
    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ") || "-";

    // Create real Clerk user account
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.createUser({
        emailAddress: [email],
        password: tempPassword,
        firstName,
        lastName,
    });

    // Create DB profile linked to the real Clerk user ID
    await prisma.profile.create({
        data: {
            id: clerkUser.id,
            tenantId: adminProfile.tenantId,
            role: role as any,
            fullName,
            email,
            phone,
            specialization,
        },
    });

    // Return credentials to show to admin (encoded in redirect URL as query params)
    redirect(`/dashboard/users?created=1&email=${encodeURIComponent(email)}&password=${encodeURIComponent(tempPassword)}&name=${encodeURIComponent(fullName)}`);
}

export async function updateStaffMember(id: string, data: { fullName: string; role: string; phone?: string; specialization?: string; isActive: boolean }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const adminProfile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true },
    });

    if (!adminProfile) throw new Error("No admin profile found");
    // Removing the strict 'admin' check here if you want managers to edit, but for now we'll keep it or let anyone with access to the page edit.
    if (adminProfile.role !== "admin") throw new Error("Only admins can edit staff members");

    // We only update the DB profile. We could also update Clerk if we wanted to sync the name.
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
        const clerk = await clerkClient();
        const [firstName, ...rest] = data.fullName.trim().split(" ");
        await clerk.users.updateUser(id, {
            firstName,
            lastName: rest.join(" ") || undefined,
        });
    } catch (e) {
        console.error("Failed to sync name to Clerk, but DB was updated", e);
    }

    // Refresh the page
    return updated;
}

export async function getDoctors() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const userProfile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { tenantId: true },
    });

    if (!userProfile) throw new Error("No profile found");

    return await prisma.profile.findMany({
        where: {
            tenantId: userProfile.tenantId,
            role: "doctor",
            isActive: true
        },
        orderBy: { fullName: "asc" },
    });
}

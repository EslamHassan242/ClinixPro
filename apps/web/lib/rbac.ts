"use server";

import { getTenantId, getSessionUser, getUserProfile } from "@/lib/auth-utils";
import { prisma } from "@clinixpro/database";

export type UserRole = "admin" | "doctor" | "receptionist" | "nurse" | "lab" | "scan";

/**
 * Checks if the current user has one of the allowed roles.
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
    try {
        const profile = await getUserProfile();
        return allowedRoles.includes(profile.role as UserRole);
    } catch (error) {
        console.error("[RBAC] Role check failed:", error);
        return false;
    }
}

/**
 * Higher-order function to protect server actions with RBAC.
 */
export async function enforceRBAC(allowedRoles: UserRole[]) {
    const isAllowed = await hasRole(allowedRoles);
    if (!isAllowed) {
        throw new Error("Unauthorized: Insufficient permissions.");
    }
}

/**
 * Specific permission checks for shorthand use.
 */
export const permissions = {
    canManageSettings: () => hasRole(["admin"]),
    canViewClinicalData: () => hasRole(["admin", "doctor", "nurse"]),
    canManageBilling: () => hasRole(["admin", "receptionist"]),
    canOrderLabs: () => hasRole(["admin", "doctor"]),
    canPerformLabs: () => hasRole(["admin", "lab"]),
};

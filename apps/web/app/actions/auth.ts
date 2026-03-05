"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePassword(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 6) {
        return { error: "Password must be at least 6 characters long." };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Password update error:", error);
        return { error: error.message || "Failed to update password." };
    }
}

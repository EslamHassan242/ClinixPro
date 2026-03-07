"use server";

import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth-utils";

/**
 * Uploads a file to Supabase Storage with tenant-based partitioning.
 */
export async function uploadFile(
    bucket: "lab-results" | "medical-scans" | "patient-docs",
    path: string,
    file: File | Blob
) {
    const supabase = await createClient();
    const tenantId = await getTenantId();

    const fullPath = `${tenantId}/${path}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
            upsert: true,
            contentType: file.type,
        });

    if (error) throw error;

    // Return the public URL or signed URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    return urlData.publicUrl;
}

/**
 * Generates a signed URL for secure document access.
 */
export async function getSecureUrl(
    bucket: string,
    path: string,
    expiresIn = 3600
) {
    const supabase = await createClient();
    const tenantId = await getTenantId();

    const fullPath = `${tenantId}/${path}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(fullPath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
}

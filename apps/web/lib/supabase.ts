import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Strict validation to ensure placeholders aren't used
const isPlaceholder = (val: string | undefined) =>
    !val || val.includes('your_supabase_') || val.includes('here');

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseKey);

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseKey!)
    : null;

export async function uploadMedicalFile(file: File, path: string) {
    if (!supabase) {
        if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseKey)) {
            throw new Error("CRITICAL: You are still using placeholder values in your .env file. Please replace 'your_supabase_url_here' and 'your_supabase_anon_key_here' with your actual Supabase credentials.");
        }
        throw new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file.");
    }
    const { data, error } = await supabase.storage
        .from('medical-attachments')
        .upload(`${path}/${Date.now()}-${file.name}`, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('medical-attachments')
        .getPublicUrl(data.path);

    return publicUrl;
}

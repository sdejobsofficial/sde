import { createClient } from "@/supabase/client";

// ─── Image upload (to 'images' bucket) ───────────────────────────────────

export const imageUpload = async (file: File, userId: string) => {
  const supabase = createClient();
  if (!userId) throw new Error("User ID is required for image upload");

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);
  return publicUrl;
};

// ─── File upload (to 'files' bucket — PDFs, docs, etc.) ──────────────────

export const fileUpload = async (file: File, userId: string) => {
  const supabase = createClient();
  if (!userId) throw new Error("User ID is required for file upload");

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("files")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw new Error(`Failed to upload file: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from("files").getPublicUrl(fileName);
  return publicUrl;
};
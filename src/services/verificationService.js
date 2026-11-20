import { supabase } from "../lib/supabase";

const BUCKET = "verification-documents";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getProvider(userId) {
  const [profile, verification, documents] = await Promise.all([
    supabase.from("provider_profiles")
      .select("*").eq("user_id", userId).maybeSingle(),

    supabase.from("provider_verifications")
      .select("*").eq("provider_id", userId).maybeSingle(),

    supabase.from("provider_documents")
      .select("*").eq("provider_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    profile: unwrap(profile),
    verification: unwrap(verification),
    documents: unwrap(documents),
  };
}

export async function saveProvider(profile, exists) {
  const query = supabase.from("provider_profiles");

  return unwrap(await (
    exists
      ? query.update(profile).eq("user_id", profile.user_id)
      : query.insert(profile)
  ).select().single());
}

export async function uploadDocument(userId, type, file) {
  const allowed = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "application/pdf": "pdf",
  };

  if (!allowed[file.type]) {
    throw new Error("Only PDF, JPG and PNG files are allowed.");
  }

  if (!file.size || file.size > 5 * 1024 * 1024) {
    throw new Error("File must be between 1 byte and 5 MB.");
  }

  const path =
    `${userId}/${type}-${crypto.randomUUID()}.${allowed[file.type]}`;

  unwrap(await supabase.storage.from(BUCKET)
    .upload(path, file, { upsert: false }));

  try {
    return unwrap(await supabase.from("provider_documents")
      .insert({
        provider_id: userId,
        document_type: type,
        file_path: path,
      }).select().single());
  } catch (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
}

export async function submitVerification() {
  return unwrap(await supabase.rpc("submit_verification"));
}

export async function getVerificationRequests() {
  return unwrap(await supabase.from("provider_verifications")
    .select("*, provider_profiles(*)")
    .order("submitted_at", { ascending: false }));
}

export async function reviewVerification(id, status, feedback) {
  return unwrap(await supabase.rpc("review_verification", {
    p_provider_id: id,
    p_status: status,
    p_feedback: feedback,
  }));
}

export async function getDocumentUrl(path) {
  const data = unwrap(await supabase.storage
    .from(BUCKET).createSignedUrl(path, 60));

  return data.signedUrl;
}
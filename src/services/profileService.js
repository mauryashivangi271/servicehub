import { supabase } from "../lib/supabase";

const BUCKET = "profile-avatars";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error("Please login again.");

  return data.user;
}

export async function getAvatarUrl(path) {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);

  if (error) throw error;

  return data.signedUrl;
}

export async function updateProfile(fields) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", user.id)
    .select("full_name, phone, address, avatar_url")
    .single();

  if (error) throw error;

  return data;
}

export async function uploadProfilePhoto(file) {
  const user = await getCurrentUser();

  if (!file) {
    throw new Error("Please select a photo.");
  }

  const extension = ALLOWED_TYPES[file.type];

  if (!extension) {
    throw new Error("Only JPG, PNG and WEBP are allowed.");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Photo must be smaller than 2 MB.");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

  if (profileError) throw profileError;

  const oldPath = profile.avatar_url;

  const path =
    `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } =
    await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

  if (uploadError) throw uploadError;

  let updatedProfile;

  try {
    updatedProfile = await updateProfile({
      avatar_url: path,
    });
  } catch (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }

  if (oldPath && oldPath.startsWith(`${user.id}/`)) {
    await supabase.storage.from(BUCKET).remove([oldPath]);
  }

  return updatedProfile;
}

export async function removeProfilePhoto() {
  const user = await getCurrentUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  const oldPath = profile.avatar_url;

  const updatedProfile = await updateProfile({
    avatar_url: null,
  });

  if (oldPath && oldPath.startsWith(`${user.id}/`)) {
    await supabase.storage.from(BUCKET).remove([oldPath]);
  }

  return updatedProfile;
}
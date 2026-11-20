import { useRef, useState } from "react";
import { Camera, Trash2, LoaderCircle } from "lucide-react";

import ProfileAvatar from "./ProfileAvatar";

import {
  uploadProfilePhoto,
  removeProfilePhoto,
} from "../../services/profileService";

export default function PhotoUpload({
  profile,
  name,
  onUpdated,
}) {
  const inputRef = useRef(null);
  const busyRef = useRef(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const updated = await uploadProfilePhoto(file);

      onUpdated?.(updated);

      setMessage("Profile photo updated successfully.");
    } catch (err) {
      setError(err.message || "Photo upload failed.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (busyRef.current) return;

    if (!window.confirm("Remove your profile photo?")) {
      return;
    }

    busyRef.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const updated = await removeProfilePhoto();

      onUpdated?.(updated);

      setMessage("Profile photo removed.");
    } catch (err) {
      setError(err.message || "Unable to remove photo.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">

      <div className="relative w-fit">

        <ProfileAvatar
          path={profile?.avatar_url}
          name={name}
          className="h-24 w-24 border-4 border-white
          text-3xl shadow-lg"
        />

        <button
          type="button"
          disabled={busy}
          aria-label="Upload profile photo"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1
          flex h-9 w-9 items-center justify-center
          rounded-full border-2 border-white
          bg-blue-600 text-white shadow-md
          hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? (
            <LoaderCircle
              size={17}
              className="animate-spin"
            />
          ) : (
            <Camera size={17} />
          )}
        </button>

      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        hidden
      />

      <div className="flex flex-wrap gap-3">

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl
          bg-blue-600 px-4 py-2.5 text-sm
          font-semibold text-white hover:bg-blue-700
          disabled:opacity-50"
        >
          <Camera size={16} />
          {profile?.avatar_url
            ? "Change Photo"
            : "Upload Photo"}
        </button>

        {profile?.avatar_url && (
          <button
            type="button"
            disabled={busy}
            onClick={handleRemove}
            className="flex items-center gap-2 rounded-xl
            border border-red-200 px-4 py-2.5
            text-sm font-medium text-red-600
            hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Remove Photo
          </button>
        )}

      </div>

      <p className="text-xs text-slate-500">
        JPG, PNG or WEBP. Maximum size: 2 MB.
      </p>

      {message && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3
          text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3
          text-sm text-red-600"
        >
          {error}
        </p>
      )}

    </div>
  );
}
import { useEffect, useState } from "react";
import { getAvatarUrl } from "../../services/profileService";

export default function ProfileAvatar({
  path,
  name = "User",
  className = "",
}) {
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadPhoto() {
      try {
        const url = await getAvatarUrl(path);

        if (active) {
          setPhoto({ path, url });
        }
      } catch {
        if (active) setPhoto(null);
      }
    }

    if (path) loadPhoto();

    const timer = setInterval(() => {
      if (path) loadPhoto();
    }, 50 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [path]);

  const imageUrl =
    photo?.path === path ? photo.url : null;

  return (
    <div
      className={`flex shrink-0 items-center
      justify-center overflow-hidden rounded-full
      bg-blue-100 font-bold text-blue-700 ${className}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Profile photo"
          onError={() => setPhoto(null)}
          className="h-full w-full object-cover"
        />
      ) : (
        (name || "U").charAt(0).toUpperCase()
      )}
    </div>
  );
}
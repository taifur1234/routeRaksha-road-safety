import { useEffect, useState } from "react";

const avatarColors = [
  "#188038",
  "#f9ab00",
  "#167a43",
  "#101820",
  "#18a999",
  "#547065",
  "#b7791f",
  "#274c77",
];

function getDisplayName(user, fallbackName) {
  return fallbackName || user?.name?.trim() || user?.displayName?.trim() || user?.email?.split("@")[0] || "User";
}

function getInitials(name = "User") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  const initials = parts.map((part) => part[0]).join("").toUpperCase();
  return initials || "U";
}

function getAvatarColor(seed) {
  const value = String(seed || "User");
  const hash = Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function UserAvatar({
  user,
  name,
  photoURL,
  className = "size-10",
  fallbackClassName = "",
  imageClassName = "",
  textClassName = "text-sm",
  alt = "",
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const displayName = getDisplayName(user, name);
  const resolvedPhotoURL = typeof photoURL === "string" ? photoURL.trim() : String(user?.photoURL || "").trim();

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedPhotoURL]);

  if (resolvedPhotoURL && !imageFailed) {
    return (
      <img
        src={resolvedPhotoURL}
        alt={alt || `${displayName} profile`}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={`${className} shrink-0 rounded-full object-cover ${imageClassName}`}
      />
    );
  }

  return (
    <span
      className={`grid ${className} shrink-0 place-items-center rounded-full text-white ${fallbackClassName}`}
      style={{ backgroundColor: getAvatarColor(user?.email || displayName) }}
      aria-hidden={alt ? undefined : "true"}
    >
      <span className={`${textClassName} font-black leading-none`}>{getInitials(displayName)}</span>
    </span>
  );
}

export default UserAvatar;

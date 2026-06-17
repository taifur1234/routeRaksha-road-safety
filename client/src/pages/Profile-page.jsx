import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReputationCard from "../components/ReputationCard";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { getMyReputation } from "../utils/reputationApi";
import { cleanText } from "../utils/validation";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const PROFILE_PHOTO_PATTERN = /^https?:\/\/[^\s<>]+$/i;

function Icon({ name, className = "size-5", strokeWidth = 2 }) {
  const icons = {
    camera: (
      <>
        <path d="M14.5 4 16 6h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1.5-2z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
    check: (
      <>
        <path d="M20 6 9 17l-5-5" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </>
    ),
    google: (
      <>
        <path d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.52Z" />
        <path d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z" />
        <path d="M6.41 13.88A6.01 6.01 0 0 1 6.1 12c0-.65.11-1.29.31-1.88V7.53H3.07a10 10 0 0 0 0 8.94l3.34-2.59Z" />
        <path d="M12 6c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.53l3.34 2.59C7.2 7.76 9.4 6 12 6Z" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M9.5 12.5 11 14l4-4" />
      </>
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
    >
      {icons[name]}
    </svg>
  );
}

function validateProfilePhoto(file) {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Please choose a JPG, PNG, or WEBP image.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Profile photo must be under 5 MB.");
  }
}

function ProfilePage() {
  const { isLoggedIn, refreshProfile, updateProfile, user } = useAuth();
  const photoInputRef = useRef(null);
  const [reputation, setReputation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    photoURL: user?.photoURL || "",
    photoFile: null,
  });

  const isGoogleAccount = user?.provider === "google";
  const accountMethod = isGoogleAccount ? "Google sign-in" : "Email and password";
  const joinedLabel = useMemo(() => new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }), []);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      photoURL: user?.photoURL || "",
      photoFile: null,
    });
  }, [user?.name, user?.photoURL]);

  useEffect(() => () => {
    if (form.photoURL?.startsWith("blob:")) {
      URL.revokeObjectURL(form.photoURL);
    }
  }, [form.photoURL]);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    refreshProfile()
      .then(async (profileResult) => {
        if (!isMounted) {
          return;
        }

        if (profileResult?.ok === false) {
          setProfileError(profileResult.message || "Could not refresh profile.");
          return;
        }

        try {
          const nextReputation = await getMyReputation();

          if (!isMounted) {
            return;
          }

          setReputation(nextReputation);
          setError("");
        } catch (error) {
          if (isMounted) {
            setError(error.message || "Could not load reputation.");
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, refreshProfile]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setProfileError("");
    setProfileSuccess("");
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsPhotoProcessing(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      validateProfilePhoto(file);
      const photoURL = URL.createObjectURL(file);
      setForm((current) => {
        if (current.photoURL?.startsWith("blob:")) {
          URL.revokeObjectURL(current.photoURL);
        }

        return { ...current, photoURL, photoFile: file };
      });
      setProfileSuccess("Photo ready. Save profile to update it everywhere.");
    } catch (uploadError) {
      setProfileError(uploadError.message || "Could not process this photo.");
    } finally {
      setIsPhotoProcessing(false);
    }
  }

  function removePhoto() {
    setForm((current) => {
      if (current.photoURL?.startsWith("blob:")) {
        URL.revokeObjectURL(current.photoURL);
      }

      return { ...current, photoURL: "", photoFile: null };
    });
    setProfileError("");
    setProfileSuccess("Photo removed from preview. Save profile to update it everywhere.");
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    const name = cleanText(form.name);
    const isRemovingPhoto = !form.photoFile && !form.photoURL && Boolean(user?.photoURL);
    const hasExternalPhotoChange =
      !form.photoFile &&
      form.photoURL &&
      form.photoURL !== user?.photoURL &&
      !form.photoURL.startsWith("blob:");
    const photoURL = hasExternalPhotoChange ? cleanText(form.photoURL) : undefined;

    if (name.length < 2 || name.length > 60) {
      setProfileError("Name must be between 2 and 60 characters.");
      return;
    }

    if (photoURL && !PROFILE_PHOTO_PATTERN.test(photoURL)) {
      setProfileError("Profile photo must be a valid image file.");
      return;
    }

    setIsSaving(true);
    setProfileError("");
    setProfileSuccess("");

    const result = await updateProfile({
      name,
      photoURL,
      photoFile: form.photoFile,
      removePhoto: isRemovingPhoto,
    });
    setIsSaving(false);

    if (!result.ok) {
      setProfileError(result.message || "Could not update profile.");
      return;
    }

    setForm({
      name: result.user?.name || name,
      photoURL: result.user?.photoURL || "",
      photoFile: null,
    });
    setProfileSuccess("Profile updated successfully.");
  }

  if (!isLoggedIn) {
    return (
      <main className="motion-page min-h-[calc(100vh-4.75rem)] bg-[#fbfcfa] px-4 py-10 text-[#173a0b] sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-lg border border-[#d8e5d3] bg-white p-8 text-center shadow-[0_22px_70px_rgba(16,24,32,0.1)]">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#101820] text-white">
            <Icon name="lock" className="size-7" />
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-[#173a0b]">Login required</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-[#46623d]">
            Sign in to manage your profile, photo, password status, and reporter reputation.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#173a0b] px-6 text-sm font-black text-white"
          >
            Login to continue
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="motion-page min-h-[calc(100vh-4.75rem)] bg-[#fbfcfa] px-4 py-10 text-[#173a0b] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <section className="relative overflow-hidden rounded-lg bg-[#101820] p-6 text-white shadow-[0_28px_80px_rgba(16,24,32,0.22)] sm:p-8">
            <div className="absolute inset-0 rr-grid opacity-10" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7ce7b2]">
                User profile
              </p>
              <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center">
                <UserAvatar
                  user={{ ...user, photoURL: form.photoURL }}
                  className="size-20"
                  fallbackClassName="border-4 border-white shadow-[0_18px_45px_rgba(16,24,32,0.18)]"
                  imageClassName="border-4 border-white shadow-[0_18px_45px_rgba(16,24,32,0.18)]"
                  textClassName="text-2xl"
                />
                <div className="min-w-0">
                  <h1 className="truncate text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {user?.name || "RouteRaksha User"}
                  </h1>
                  <p className="mt-2 truncate text-sm font-semibold text-white/70">{user?.email}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-white">
                      {accountMethod}
                    </span>
                    <span className="rounded-full border border-[#7ce7b2]/30 bg-[#7ce7b2]/12 px-3 py-1.5 text-xs font-black text-[#baf7da]">
                      {user?.role === "admin" ? "Admin" : "Safety contributor"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["Trust level", reputation?.trustLevel || "New User"],
                  ["Reports", reputation?.reportsSubmitted ?? 0],
                  ["Joined", joinedLabel],
                ].map(([label, value]) => (
                  <div key={label} className="border border-white/10 bg-white/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
                      {label}
                    </p>
                    <p className="mt-2 text-lg font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <form
            onSubmit={handleSaveProfile}
            className="rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_22px_70px_rgba(16,24,32,0.1)] sm:p-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#18a999]">
                  Profile details
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#173a0b]">Edit your public profile</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#46623d]">
                  Name and profile photo appear on reputation, reports, and account areas.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-3 py-2 text-xs font-black text-[#46623d]">
                <Icon name="check" className="size-4 text-[#18a999]" />
                Verified session
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
              <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                Display name
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="min-h-12 rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-bold text-[#173a0b] outline-none"
                  maxLength={60}
                  placeholder="Your name"
                />
              </label>
              <div className="grid gap-2 text-sm font-black text-[#173a0b]">
                Profile photo
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="flex flex-col gap-3 rounded-lg border border-[#cddcc7] bg-white p-3 sm:flex-row sm:items-center">
                  <UserAvatar
                    user={{ ...user, photoURL: form.photoURL }}
                    className="size-14"
                    fallbackClassName="shadow-sm"
                    imageClassName="shadow-sm"
                    textClassName="text-base"
                  />
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isPhotoProcessing}
                      className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#101820] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Icon name="camera" className="size-4" />
                      {isPhotoProcessing ? "Processing..." : "Choose from gallery"}
                    </button>
                    <button
                      type="button"
                      onClick={removePhoto}
                      disabled={!form.photoURL || isPhotoProcessing}
                      className="min-h-11 rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-4 text-sm font-black text-[#173a0b] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#101820] text-white">
                  <Icon name="camera" className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-[#173a0b]">Photo upload</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#46623d]">
                    Photos are uploaded securely and shown on the navbar, profile, chat, and leaderboard.
                  </p>
                </div>
              </div>
            </div>

            {profileError && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {profileSuccess}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving || isPhotoProcessing}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#173a0b] px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Icon name="edit" className="size-4" />
                {isSaving ? "Saving..." : "Save profile"}
              </button>
              <button
                type="button"
                onClick={() => setForm({ name: user?.name || "", photoURL: user?.photoURL || "", photoFile: null })}
                className="flex min-h-12 items-center justify-center rounded-full border border-[#d8e5d3] bg-white px-6 text-sm font-black text-[#173a0b]"
              >
                Reset changes
              </button>
            </div>
          </form>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_18px_55px_rgba(16,24,32,0.08)] sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#101820] text-white">
                {isGoogleAccount ? <Icon name="google" className="size-6" /> : <Icon name="lock" className="size-6" />}
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#18a999]">
                  Password access
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#173a0b]">
                  {isGoogleAccount ? "No RouteRaksha password set" : "Password is protected"}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
                  {isGoogleAccount
                    ? "You signed in with Google, so RouteRaksha does not store a login password for this account."
                    : "For security, saved passwords are encrypted as hashes and cannot be displayed back in plain text."}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-[#d8e5d3] bg-[#f7faf6] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#78936d]">
                Login password
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xl font-black tracking-[0.18em] text-[#173a0b]">
                  {isGoogleAccount ? "Not set" : "••••••••••••"}
                </p>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
                  {isGoogleAccount ? "Google controlled" : "Hidden by design"}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled
                className="min-h-12 rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-5 text-sm font-black text-[#78936d] disabled:cursor-not-allowed"
              >
                {isGoogleAccount ? "Set password upcoming" : "Change password upcoming"}
              </button>
              <button
                type="button"
                disabled
                className="min-h-12 rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-5 text-sm font-black text-[#78936d] disabled:cursor-not-allowed"
              >
                Recovery options upcoming
              </button>
            </div>
          </article>

          <article className="rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_18px_55px_rgba(16,24,32,0.08)] sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#101820] text-white">
                <Icon name="mail" className="size-6" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#18a999]">
                  Email identity
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#173a0b]">Email change is upcoming</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
                  Email changes need OTP verification and duplicate account checks, so this action is intentionally paused for a future release.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                Current email
                <input
                  value={user?.email || ""}
                  readOnly
                  className="min-h-12 rounded-lg border border-[#cddcc7] bg-[#f7faf6] px-4 text-sm font-bold text-[#46623d] outline-none"
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                New email
                <input
                  disabled
                  placeholder="Coming soon"
                  className="min-h-12 rounded-lg border border-[#cddcc7] bg-[#f7faf6] px-4 text-sm font-bold text-[#78936d] outline-none disabled:cursor-not-allowed"
                />
              </label>
            </div>
          </article>
        </section>

        <section className="mt-6">
          <ReputationCard reputation={reputation} isLoading={isLoading} error={error} />
        </section>
      </section>
    </main>
  );
}

export default ProfilePage;

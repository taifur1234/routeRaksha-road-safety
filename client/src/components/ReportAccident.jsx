import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Footer from "./home/Footer";
import { useAuth } from "../context/AuthContext";
import { readAccidentReports, saveAccidentReport } from "../utils/reportStore";
import { loadLeaflet } from "../utils/leafletLoader";
import { KHARGONE_CENTER, isDuplicateRiskReport } from "../utils/safetyData";
import { cleanText, isValidCoordinate } from "../utils/validation";

function Icon({ name, className = "size-5", strokeWidth = 2 }) {
  const icons = {
    alert: (
      <>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
    mapPin: (
      <>
        <path d="M20 10c0 4.5-8 12-8 12S4 14.5 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    crosshair: (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M9.5 12.5 11 14l4-4" />
      </>
    ),
    spark: <path d="M13 2 4 14h7l-1 8 10-13h-7z" />,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

const incidentTypes = ["Road accident", "Near miss", "Dangerous turn", "Pothole or bad road"];
const severityOptions = ["High", "Medium", "Low"];
const lightOptions = ["Day", "Night", "Unknown"];

const checklist = [
  "Road name or nearest landmark",
  "What happened or nearly happened",
  "Severity and repeated risk clues",
];

const reviewSteps = [
  {
    title: "Submit context",
    text: "Add the location, incident type, severity, and the reason the spot is risky.",
    icon: "file",
  },
  {
    title: "Admin review",
    text: "The report enters a review queue before it is used as public blackspot data.",
    icon: "shield",
  },
  {
    title: "Safer routes",
    text: "Approved reports strengthen future route risk checks for other users.",
    icon: "check",
  },
];

function ReportAccident() {
  const { isLoggedIn, user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [mapStatus, setMapStatus] = useState("Click the map to auto-fill accident coordinates.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessPopupClosing, setIsSuccessPopupClosing] = useState(false);
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const imageInputRef = useRef(null);
  const successPopupTimerRef = useRef(null);
  const [form, setForm] = useState({
    location: "",
    type: "Road accident",
    severity: "High",
    description: "",
    accidentTime: "",
    lightCondition: "Unknown",
    notes: "",
    imageData: "",
    imageName: "",
    imageFile: null,
    latitude: null,
    longitude: null,
  });

  useEffect(() => () => {
    if (form.imageData?.startsWith("blob:")) {
      URL.revokeObjectURL(form.imageData);
    }
  }, [form.imageData]);

  useEffect(() => {
    if (!submitted) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [submitted]);

  useEffect(() => () => {
    if (successPopupTimerRef.current) {
      window.clearTimeout(successPopupTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    loadLeaflet()
      .then((L) => {
        if (!isMounted || !mapElementRef.current || mapRef.current) {
          return;
        }

        mapRef.current = L.map(mapElementRef.current, {
          center: KHARGONE_CENTER,
          zoom: 12,
          zoomControl: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapRef.current);
        mapRef.current.on("click", (event) => {
          const lat = Number(event.latlng.lat.toFixed(5));
          const lng = Number(event.latlng.lng.toFixed(5));
          const location = `${lat}, ${lng}`;

          if (markerRef.current) {
            markerRef.current.setLatLng(event.latlng);
          } else {
            markerRef.current = L.marker(event.latlng).addTo(mapRef.current);
          }

          markerRef.current.bindPopup("Selected accident location").openPopup();
          setForm((current) => ({
            ...current,
            location,
            latitude: lat,
            longitude: lng,
          }));
          setMapStatus("Coordinates captured from map click.");
          setSubmitted(false);
          setError("");
        });
      })
      .catch(() => setMapStatus("Map is unavailable. You can still type the location manually."));

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "location" ? { latitude: null, longitude: null } : {}),
    }));
    setSubmitted(false);
    setError("");
    if (field === "location") {
      setLocationStatus("");
    }
  }

  function useCurrentLocation() {
    setSubmitted(false);
    setError("");

    if (!navigator.geolocation) {
      setLocationStatus("Location access is not supported in this browser.");
      return;
    }

    setLocationStatus("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        setForm((current) => ({
          ...current,
          location: `${lat}, ${lng}`,
          latitude: Number(lat),
          longitude: Number(lng),
        }));
        setLocationStatus("Current location added to the report.");
        if (window.L && mapRef.current) {
          const latLng = [Number(lat), Number(lng)];
          mapRef.current.setView(latLng, 15);
          if (markerRef.current) {
            markerRef.current.setLatLng(latLng);
          } else {
            markerRef.current = window.L.marker(latLng).addTo(mapRef.current);
          }
        }
      },
      () => {
        setLocationStatus("Location permission denied. You can enter the location manually.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  function validateReportForm() {
    const location = cleanText(form.location);
    const description = cleanText(form.description);
    const notes = cleanText(form.notes);

    if (location.length < 5 || location.length > 180) {
      return "Location must be between 5 and 180 characters.";
    }

    if (description.length < 20 || description.length > 1000) {
      return "Description must be between 20 and 1000 characters.";
    }

    if (!incidentTypes.includes(form.type) || !severityOptions.includes(form.severity)) {
      return "Please choose a valid incident type and severity.";
    }

    if (!lightOptions.includes(form.lightCondition)) {
      return "Please choose a valid light condition.";
    }

    if (notes.length > 500) {
      return "Optional notes must be under 500 characters.";
    }

    if (
      (form.latitude !== null || form.longitude !== null) &&
      !isValidCoordinate(form.latitude, form.longitude)
    ) {
      return "Selected accident coordinates are invalid.";
    }

    return "";
  }

  async function submitReport(event) {
    event.preventDefault();

    const validationError = validateReportForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const existingReports = await readAccidentReports().catch(() => []);

      if (isDuplicateRiskReport(form, existingReports)) {
        setError("A similar report already exists near this area. Add more specific details or choose a different spot.");
        setIsSubmitting(false);
        return;
      }

      await saveAccidentReport({
        location: cleanText(form.location),
        latitude: form.latitude,
        longitude: form.longitude,
        type: form.type,
        severity: form.severity,
        description: cleanText(form.description),
        accidentTime: form.accidentTime,
        lightCondition: form.lightCondition,
        notes: cleanText(form.notes),
        imageFile: form.imageFile,
      });

      setIsSuccessPopupClosing(false);
      setSubmitted(true);
      setError("");
      setForm({
        location: "",
        type: "Road accident",
        severity: "High",
        description: "",
        accidentTime: "",
        lightCondition: "Unknown",
        notes: "",
        imageData: "",
        imageName: "",
        imageFile: null,
        latitude: null,
        longitude: null,
      });
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } catch (saveError) {
      setError(saveError.message || "Could not submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Please keep the image under 1 MB for fast mobile uploads.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setForm((current) => {
      if (current.imageData?.startsWith("blob:")) {
        URL.revokeObjectURL(current.imageData);
      }

      return {
        ...current,
        imageData: previewUrl,
        imageName: file.name,
        imageFile: file,
      };
    });
    setError("");
  }

  function closeSuccessPopup() {
    if (isSuccessPopupClosing) {
      return;
    }

    setIsSuccessPopupClosing(true);
    successPopupTimerRef.current = window.setTimeout(() => {
      setSubmitted(false);
      setIsSuccessPopupClosing(false);
      successPopupTimerRef.current = null;
    }, 220);
  }

  function removeImage() {
    setForm((current) => {
      if (current.imageData?.startsWith("blob:")) {
        URL.revokeObjectURL(current.imageData);
      }

      return {
        ...current,
        imageData: "",
        imageName: "",
        imageFile: null,
      };
    });
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    setError("");
  }

  if (!isLoggedIn) {
    return (
      <main className="motion-page min-h-[calc(100vh-4.75rem)] bg-[#fbfcfa] px-4 py-12 text-[#173a0b] sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#e5eedf] shadow-[0_24px_60px_rgba(16,47,0,0.1)] lg:grid-cols-[1fr_0.86fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="mb-6 grid size-12 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
              <Icon name="lock" className="size-6" strokeWidth={2.4} />
            </span>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
              Verified reporting access
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#173a0b] sm:text-5xl">
              Login required to report an accident.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#46623d]">
              Accident reports are linked to your account so submissions can be reviewed,
              verified, and added to the road-safety layer responsibly.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Verified identity", "Admin review", "Safer map updates"].map((item) => (
                <div key={item} className="rounded-lg bg-[#fbfcfa] p-4">
                  <span className="mb-3 block size-2 rounded-full bg-[#9cec6d]" />
                  <p className="text-sm font-black text-[#173a0b]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid content-center bg-[#fbfcfa] p-6 sm:p-8 lg:p-10">
            <div className="rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_18px_42px_rgba(16,47,0,0.08)]">
              <span className="grid size-11 place-items-center rounded-lg bg-[#f1f6f0] text-[#173a0b]">
                <Icon name="file" className="size-5" strokeWidth={2.4} />
              </span>
              <h2 className="mt-5 text-2xl font-black text-[#173a0b]">Submit with context</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
                Once logged in, add the location, severity, and what makes the spot risky.
              </p>

              <div className="mt-6 grid gap-3">
                <Link
                  to="/login"
                  className="flex min-h-12 items-center justify-center rounded-full bg-[#173a0b] px-5 text-sm font-black text-white transition hover:bg-[#102f00]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex min-h-12 items-center justify-center rounded-full border border-[#173a0b] bg-white px-5 text-sm font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
                >
                  Create account
                </Link>
              </div>
            </div>
            <Link
              to="/contact"
              className="mt-4 text-center text-sm font-black text-[#173a0b] underline decoration-[#9cec6d] decoration-4 underline-offset-4"
            >
              Need help instead?
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="motion-page bg-[#fbfcfa] text-[#173a0b]">
      <section className="bg-[#e5eedf] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
                Community safety reporting
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-[#173a0b] sm:text-5xl lg:text-6xl">
                Report a risky road before it becomes someone else's route.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#46623d]">
                Add accident-prone locations, near misses, bad turns, or pothole zones. Your report
                enters review and can improve future blackspot-aware routing.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Pending", "Admin review"],
                ["Verified", "Safer data"],
                ["Useful", "Route alerts"],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className={`rounded-lg border border-[#d8e5d3] p-4 shadow-[0_12px_28px_rgba(16,47,0,0.07)] ${
                    index === 1 ? "bg-[#9cec6d]" : "bg-[#fbfcfa]"
                  }`}
                >
                  <p className="text-xl font-black text-[#173a0b]">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#46623d]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-lg bg-[#173a0b] p-7 text-white shadow-[0_24px_60px_rgba(16,47,0,0.16)] sm:p-8">
              <span className="grid size-14 place-items-center rounded-2xl bg-[#9cec6d] text-[#102f00]">
                <Icon name="alert" className="size-7" strokeWidth={2.4} />
              </span>
              <h2 className="mt-6 text-3xl font-black leading-tight">
                Good reports make safer maps.
              </h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-white/75">
                A clear report helps reviewers understand the location, severity, and repeated
                risk. Keep it specific and practical.
              </p>

              <div className="mt-7 grid gap-4">
                {checklist.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#9cec6d] text-[#102f00]">
                      <Icon name="check" className="size-4" strokeWidth={2.6} />
                    </span>
                    <p className="text-sm font-bold text-white/85">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9cec6d]">
                  Example context
                </p>
                <p className="mt-2 text-lg font-black text-white">
                  Sharp turn near market crossing
                </p>
              </div>
          </aside>

          <form
            onSubmit={submitReport}
            className="h-fit rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_24px_60px_rgba(16,47,0,0.1)] sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                <Icon name="file" className="size-6" strokeWidth={2.4} />
              </span>
              <div>
                <h2 className="text-3xl font-black leading-tight text-[#173a0b]">
                  Accident report details
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
                  Submitted by {user?.name}. Your report will be stored as pending until admin
                  review.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5">
              <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                Accident location
                <div className="flex gap-2">
                  <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#f1f6f0] text-[#173a0b]">
                    <Icon name="mapPin" className="size-5" strokeWidth={2.3} />
                  </span>
                  <input
                    value={form.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    placeholder="Area, landmark, road name, or coordinates"
                    maxLength={180}
                    className="min-h-12 w-full rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478] focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  />
                </div>
              </label>

              <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#173a0b] bg-white px-5 text-sm font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
                >
                  <Icon name="crosshair" className="size-4" />
                  Use current location
                </button>
                {locationStatus && (
                  <p className="rounded-lg bg-[#f1f6f0] px-4 py-3 text-sm font-bold text-[#46623d]">
                    {locationStatus}
                  </p>
                )}
              </div>

              <div className="overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#f1f6f0]">
                <div className="flex items-center justify-between gap-3 border-b border-[#d8e5d3] px-4 py-3">
                  <p className="text-sm font-black text-[#173a0b]">Map location picker</p>
                  <p className="text-xs font-bold text-[#46623d]">{mapStatus}</p>
                </div>
                <div className="relative h-72">
                  <div ref={mapElementRef} className="absolute inset-0" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                  Incident type
                  <select
                    value={form.type}
                    onChange={(event) => updateField("type", event.target.value)}
                    className="min-h-12 rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  >
                    {incidentTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                  Severity
                  <select
                    value={form.severity}
                    onChange={(event) => updateField("severity", event.target.value)}
                    className="min-h-12 rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  >
                    {severityOptions.map((severity) => (
                      <option key={severity}>{severity}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                  Time of accident
                  <input
                    type="time"
                    value={form.accidentTime}
                    onChange={(event) => updateField("accidentTime", event.target.value)}
                    className="min-h-12 rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  />
                </label>

                <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                  Day or night
                  <select
                    value={form.lightCondition}
                    onChange={(event) => updateField("lightCondition", event.target.value)}
                    className="min-h-12 rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  >
                    {lightOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Describe what happened, when it happens often, and what makes this place risky."
                  rows="5"
                  maxLength={1000}
                  className="min-h-[9.2rem] resize-none rounded-lg border border-[#cddcc7] bg-white px-4 py-3 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478] focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                Optional notes
                <textarea
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Add weather, visibility, repeated timing, traffic direction, or reviewer hints."
                  rows="3"
                  maxLength={500}
                  className="resize-none rounded-lg border border-[#cddcc7] bg-white px-4 py-3 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478] focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                />
              </label>

              <div className="grid gap-2 text-sm font-black text-[#173a0b]">
                <p>
                  Accident image <span className="text-xs font-bold text-[#46623d]">(optional)</span>
                </p>
                <div className="flex flex-col gap-3 rounded-lg border border-dashed border-[#cddcc7] bg-[#f1f6f0] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-[#173a0b]">
                      <Icon name="image" className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-black text-[#173a0b]">
                        {form.imageName || "Add supporting photo"}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#46623d]">
                        Optional JPG, PNG, or WebP, under 1 MB
                      </p>
                    </div>
                  </div>
                  <input
                    ref={imageInputRef}
                    aria-label="Optional accident image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="text-sm font-bold text-[#46623d] file:mr-3 file:rounded-full file:border-0 file:bg-[#173a0b] file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
                  />
                </div>
                {form.imageData && (
                  <div className="overflow-hidden rounded-lg border border-[#d8e5d3] bg-white">
                    <img
                      src={form.imageData}
                      alt="Accident report preview"
                      className="h-36 w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-3 px-3 py-2">
                      <p className="truncate text-xs font-bold text-[#46623d]">{form.imageName}</p>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="min-h-9 rounded-full border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700"
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173a0b] px-6 text-sm font-black text-white shadow-[0_12px_26px_rgba(16,47,0,0.18)] hover:bg-[#102f00] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Icon name="spark" className="size-4" />
              {isSubmitting ? "Submitting..." : "Submit accident report"}
            </button>
          </form>
        </div>
      </section>

      <section className="bg-[#f1f6f0] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
              Review pipeline
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-[#173a0b]">
              What happens after you submit?
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {reviewSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-lg border border-[#d8e5d3] bg-[#fbfcfa] p-5 shadow-[0_12px_30px_rgba(16,47,0,0.06)]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                    <Icon name={step.icon} className="size-5" strokeWidth={2.3} />
                  </span>
                  <span className="text-sm font-black text-[#46623d]">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-black text-[#173a0b]">{step.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#46623d]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      </main>

      {submitted && (
        <div
          className={`report-success-backdrop fixed left-0 top-0 z-[100] grid h-screen w-screen place-items-center overflow-hidden bg-[#102f00]/45 p-4 backdrop-blur-sm ${
            isSuccessPopupClosing ? "is-closing" : ""
          }`}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-success-title"
            className={`report-success-panel max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-[#d8e5d3] bg-[#fbfcfa] p-6 text-[#173a0b] shadow-[0_32px_90px_rgba(16,47,0,0.28)] ${
              isSuccessPopupClosing ? "is-closing" : ""
            }`}
          >
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#9cec6d] text-[#102f00]">
              <Icon name="check" className="size-7" strokeWidth={2.6} />
            </span>
            <h2 id="report-success-title" className="mt-5 text-center text-2xl font-black leading-tight">
              Report submitted successfully
            </h2>
            <p className="mt-3 text-center text-sm font-semibold leading-6 text-[#46623d]">
              Your accident report is now pending admin review.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                to="/report-history"
                className="flex min-h-11 items-center justify-center rounded-full bg-[#173a0b] px-5 text-sm font-black text-white transition hover:bg-[#102f00]"
              >
                View history
              </Link>
              <button
                type="button"
                onClick={closeSuccessPopup}
                className="min-h-11 rounded-full border border-[#173a0b] bg-white px-5 text-sm font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportAccident;

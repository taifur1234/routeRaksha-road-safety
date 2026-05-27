const LEAFLET_SCRIPT_ID = "leaflet-js";
const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_SCRIPT_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (!document.getElementById(LEAFLET_CSS_ID)) {
    const link = document.createElement("link");
    link.id = LEAFLET_CSS_ID;
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS_URL;
    document.head.appendChild(link);
  }

  const existingScript = document.getElementById(LEAFLET_SCRIPT_ID);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(window.L), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Map library failed to load.")), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.src = LEAFLET_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Map library failed to load."));
    document.head.appendChild(script);
  });
}

export { loadLeaflet };

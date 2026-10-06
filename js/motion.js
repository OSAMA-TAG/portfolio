const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const storageKey = "portfolio-motion";

function readOverride() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "on") return true;
    if (stored === "off") return false;
  } catch (error) {
    console.warn("The saved motion preference could not be read.", error);
  }
  return null;
}

let override = readOverride();

export function isMotionEnabled() {
  return override ?? !motionPreference.matches;
}

function applyPreference() {
  const enabled = isMotionEnabled();
  document.documentElement.classList.toggle("motion-enabled", enabled);
  document.documentElement.classList.toggle("motion-reduced", !enabled);
  document.dispatchEvent(new CustomEvent("motionpreferencechange"));
}

export function setMotionEnabled(enabled) {
  override = enabled;
  applyPreference();
  try {
    window.localStorage.setItem(storageKey, enabled ? "on" : "off");
  } catch (error) {
    console.warn("The motion preference could not be saved for future visits.", error);
  }
}

motionPreference.addEventListener("change", () => {
  if (override === null) applyPreference();
});

applyPreference();

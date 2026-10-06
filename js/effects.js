import { isMotionEnabled } from "./motion.js";
import { projects, skills } from "./data.js";

function prefersFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function initScrollProgress() {
  const bar = document.querySelector(".scroll-progress span");
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

export function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 16);
  window.addEventListener("scroll", update, { passive: true });
  update();
}

export function initSmoothAnchors() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 88;
    if (!isMotionEnabled()) {
      window.scrollTo(0, top);
      return;
    }
    const start = window.scrollY;
    const distance = top - start;
    const duration = Math.min(1100, Math.max(420, Math.abs(distance) * 0.42));
    const begin = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - begin) / duration);
      const eased = 1 - (1 - t) ** 3;
      window.scrollTo(0, start + distance * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function initSplitText() {
  const title = document.querySelector("[data-split]");
  if (!title) return;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? "";
        if (!text.trim() && !text.includes(" ")) return;
        const wrap = document.createDocumentFragment();
        [...text].forEach((char) => {
          const span = document.createElement("span");
          span.className = "char";
          span.textContent = char === " " ? "\u00a0" : char;
          wrap.append(span);
        });
        child.replaceWith(wrap);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(title);
  title.querySelectorAll(".char").forEach((char, index) => {
    char.style.setProperty("--char-index", String(index));
  });
}

export function initParallax() {
  const nodes = [...document.querySelectorAll("[data-parallax]")];
  const blobs = [...document.querySelectorAll(".ambient-blob")];
  let pointerX = 0.5;
  let pointerY = 0.5;
  let frame = 0;

  const render = () => {
    frame = 0;
    if (!isMotionEnabled()) {
      nodes.forEach((node) => { node.style.translate = "0 0"; });
      return;
    }
    const y = window.scrollY;
    nodes.forEach((node) => {
      const speed = Number.parseFloat(node.dataset.parallax || "0.08");
      const offset = (node.getBoundingClientRect().top + y) * 0.02;
      node.style.translate = `0 ${((y - offset) * speed).toFixed(1)}px`;
    });
    blobs.forEach((blob, index) => {
      const drift = (index + 1) * 18;
      blob.style.translate = `${(pointerX - 0.5) * drift}px ${(pointerY - 0.5) * drift * 0.7}px`;
    });
  };

  const request = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX / window.innerWidth;
    pointerY = event.clientY / window.innerHeight;
    const spotlight = document.querySelector(".pointer-glow");
    if (spotlight) {
      spotlight.style.setProperty("--x", `${event.clientX}px`);
      spotlight.style.setProperty("--y", `${event.clientY}px`);
    }
    request();
  }, { passive: true });
  document.addEventListener("motionpreferencechange", request);
  request();
}

export function initStackViz() {
  const host = document.querySelector("#stack-viz");
  if (!host) return;
  const groups = projects.reduce((acc, project) => {
    acc[project.category] = (acc[project.category] ?? 0) + 1;
    return acc;
  }, {});
  const total = projects.length || 1;
  const palette = {
    WordPress: "var(--lime)",
    Shopify: "var(--coral)",
    "HTML / CSS / JS": "var(--blue)",
    Recent: "#e4b959"
  };
  host.innerHTML = "";
  const track = document.createElement("div");
  track.className = "stack-track";
  const legend = document.createElement("div");
  legend.className = "stack-legend";
  Object.entries(groups).forEach(([label, count]) => {
    const slice = document.createElement("span");
    slice.className = "stack-slice";
    slice.style.flexGrow = String(count);
    slice.style.background = palette[label] ?? "#c9d8e0";
    slice.title = `${label}: ${count}`;
    track.append(slice);
  const item = document.createElement("span");
    item.className = "stack-legend-item";
    const swatch = document.createElement("i");
    swatch.style.background = palette[label] ?? "#c9d8e0";
    const countLabel = document.createElement("b");
    countLabel.textContent = `${Math.round((count / total) * 100)}%`;
    item.append(swatch, `${label} `, countLabel);
    legend.append(item);
  });
  host.append(track, legend);
}

export function initSkillMeters() {
  document.querySelectorAll(".skill-meter span").forEach((meter) => {
    const level = meter.style.getPropertyValue("--level") || meter.dataset.level;
    meter.style.width = "0%";
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        meter.style.width = level || "80%";
        current.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    observer.observe(meter);
  });
}

export function initRoleCycle() {
  const node = document.querySelector("[data-roles]");
  if (!node) return;
  const roles = node.dataset.roles.split("|").map((item) => item.trim()).filter(Boolean);
  if (roles.length < 2) return;
  let index = 0;
  const swap = () => {
    if (!isMotionEnabled()) {
      node.textContent = roles[0];
      return;
    }
    index = (index + 1) % roles.length;
    node.classList.add("is-swapping");
    window.setTimeout(() => {
      node.textContent = roles[index];
      node.classList.remove("is-swapping");
    }, 280);
  };
  window.setInterval(swap, 2800);
}

export function initFilterGestures(applyFilterByValue) {
  const toolbar = document.querySelector(".work-toolbar");
  const grid = document.querySelector("#project-grid");
  if (!toolbar || !grid) return;
  let startX = 0;
  const onStart = (event) => {
    const touch = event.changedTouches?.[0];
    if (touch) startX = touch.clientX;
  };
  const onEnd = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const delta = touch.clientX - startX;
    if (Math.abs(delta) < 56) return;
    const buttons = [...document.querySelectorAll(".filter-button")];
    const current = buttons.findIndex((button) => button.getAttribute("aria-pressed") === "true");
    const next = (current + (delta < 0 ? 1 : -1) + buttons.length) % buttons.length;
    applyFilterByValue(buttons[next].dataset.filter, buttons[next]);
  };
  [toolbar, grid].forEach((element) => {
    element.addEventListener("touchstart", onStart, { passive: true });
    element.addEventListener("touchend", onEnd, { passive: true });
  });

  window.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const work = document.querySelector("#work");
    if (!work) return;
    const rect = work.getBoundingClientRect();
    if (rect.bottom < 80 || rect.top > window.innerHeight - 80) return;
    const buttons = [...document.querySelectorAll(".filter-button")];
    const current = buttons.findIndex((button) => button.getAttribute("aria-pressed") === "true");
    const next = (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    applyFilterByValue(buttons[next].dataset.filter, buttons[next]);
  });
}

export function initTiltArt() {
  if (!prefersFinePointer()) return;
  const art = document.querySelector(".hero-art");
  const card = document.querySelector(".hero-art-card");
  if (!art || !card) return;
  art.addEventListener("pointermove", (event) => {
    if (!isMotionEnabled()) return;
    const rect = art.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    art.style.setProperty("--tilt-x", `${y * -8}deg`);
    art.style.setProperty("--tilt-y", `${x * 10}deg`);
    card.style.transform = `translateY(-50%) rotate(${4 + x * 6}deg) translate3d(${x * 12}px, ${y * 10}px, 40px)`;
  });
  art.addEventListener("pointerleave", () => {
    art.style.setProperty("--tilt-x", "0deg");
    art.style.setProperty("--tilt-y", "0deg");
    card.style.transform = "";
  });
}

export function initServiceExpand() {
  document.querySelectorAll(".service-row").forEach((row) => {
    row.addEventListener("pointerenter", () => row.classList.add("is-hot"));
    row.addEventListener("pointerleave", () => row.classList.remove("is-hot"));
  });
}

export function skillLevel(name) {
  const match = skills.find((skill) => skill.name === name);
  return match?.level ?? 80;
}

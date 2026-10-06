import { education, experience, profile, projectFilters, projects, services, skills } from "./data.js";
import {
  initFilterGestures,
  initHeaderScroll,
  initParallax,
  initRoleCycle,
  initScrollProgress,
  initServiceExpand,
  initSkillMeters,
  initSmoothAnchors,
  initSplitText,
  initStackViz,
  initTiltArt
} from "./effects.js";
import { isMotionEnabled, setMotionEnabled } from "./motion.js";
import { initHeroScene } from "./scene.js";

const projectGrid = document.querySelector("#project-grid");

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderSkills() {
  const list = document.querySelector("#skill-list");
  const fragment = document.createDocumentFragment();
  skills.forEach((skill, index) => {
    const item = createElement("div", "skill-item reveal");
    const copy = createElement("div", "skill-copy");
    copy.append(createElement("span", "skill-name", skill.name));
    copy.append(createElement("span", "skill-index", String(index + 1).padStart(2, "0")));
    const meter = createElement("div", "skill-meter");
    const fill = createElement("span");
    fill.style.setProperty("--level", `${skill.level}%`);
    fill.dataset.level = `${skill.level}%`;
    meter.append(fill);
    const value = createElement("span", "skill-value", `${skill.level}`);
    item.append(copy, value, meter);
    fragment.append(item);
  });
  list.append(fragment);
}

function renderServices() {
  const list = document.querySelector("#service-list");
  const fragment = document.createDocumentFragment();
  services.forEach((service, index) => {
    const row = createElement("article", "service-row reveal");
    row.append(createElement("span", "service-index", String(index + 1).padStart(2, "0")));
    row.append(createElement("h3", "service-title", service.title));
    row.append(createElement("p", "service-description", service.detail));
    row.append(createElement("span", "service-arrow", "↗"));
    fragment.append(row);
  });
  list.append(fragment);
}

function renderExperience() {
  const list = document.querySelector("#experience-list");
  const fragment = document.createDocumentFragment();
  experience.forEach((job) => {
    const item = createElement("article", "timeline-item reveal");
    item.append(createElement("span", "timeline-dates", job.dates));
    const body = createElement("div", "timeline-body");
    body.append(createElement("h3", "timeline-role", job.role));
    body.append(createElement("p", "timeline-company", job.company));
    item.append(body);
    item.append(createElement("span", "timeline-location", job.location));
    item.append(createElement("p", "timeline-details", job.detail));
    fragment.append(item);
  });
  list.append(fragment);
}

function renderEducation() {
  const list = document.querySelector("#education-list");
  const fragment = document.createDocumentFragment();
  education.forEach((item) => {
    const card = createElement("article", "education-card reveal");
    const icon = createElement("span", "education-icon", "✳");
    icon.setAttribute("aria-hidden", "true");
    const details = createElement("div", "education-details");
    details.append(createElement("p", "eyebrow", "Education"));
    details.append(createElement("h3", "", item.degree));
    details.append(createElement("p", "", `${item.institution} · ${item.location}`));
    card.append(icon, details, createElement("span", "education-dates", item.dates));
    fragment.append(card);
  });
  list.append(fragment);
}

function renderProfile() {
  document.title = `${profile.name} — Web Developer & E-commerce Strategist`;
  document.querySelectorAll(".brand-name").forEach((node) => { node.textContent = profile.name; });
  document.querySelectorAll(".brand").forEach((brand) => { brand.setAttribute("aria-label", `${profile.name}, home`); });
  document.querySelector("#hero-intro").textContent = profile.heroIntro;
  document.querySelector("#about-lead").textContent = profile.aboutLead;
  document.querySelectorAll(".about-columns p").forEach((paragraph, index) => {
    if (profile.aboutParagraphs[index]) paragraph.textContent = profile.aboutParagraphs[index];
  });
  document.querySelectorAll(".profile-location").forEach((node) => { node.textContent = profile.location; });
  document.querySelector(".contact .button--light").href = `mailto:${profile.email}`;
  document.querySelector(".contact-details a[href^='mailto:']").href = `mailto:${profile.email}`;
  document.querySelector(".contact-details a[href^='mailto:']").textContent = profile.email;
  document.querySelector(".contact-details a[href^='tel:']").href = `tel:${profile.phone.replace(/[^\d+]/g, "")}`;
  document.querySelector(".contact-details a[href^='tel:']").textContent = profile.phone;
  document.querySelector(".contact-details > span").textContent = profile.location;
  document.querySelector('meta[name="description"]').content = `${profile.name} is a WordPress and Shopify developer, e-commerce strategist, and SEO specialist with 5+ years of experience.`;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = `A portfolio of WordPress, Shopify, and web projects by ${profile.name}.`;
  document.querySelector('[data-count="sites"]').textContent = profile.wordpressSites;
}

function createProjectCard(project, index) {
  const article = createElement("article", "project-card is-entering");
  article.style.setProperty("--card-index", String(index));
  article.style.setProperty("--tile", ["#dde1c8", "#c8d9d0", "#ead2bd", "#c9d8e0", "#e9d7ac", "#d8d1e4"][index % 6]);
  article.style.setProperty("--tile-ink", ["#2e4238", "#27443f", "#53392d", "#263c48", "#4b4329", "#42384f"][index % 6]);
  article.style.setProperty("--tile-accent", ["#a8c85b", "#87b6a4", "#ec9277", "#87b7ce", "#e4b959", "#ad9cc8"][index % 6]);
  article.dataset.category = project.category;
  article.dataset.recent = String(project.recent);
  article.dataset.featured = String(project.featured);

  const visual = createElement("div", "project-visual");
  visual.setAttribute("aria-hidden", "true");
  const browser = createElement("div", "project-browser");
  const browserBar = createElement("div", "browser-bar");
  browserBar.append(createElement("i"), createElement("i"), createElement("i"), createElement("span", "browser-url"));
  const page = createElement("div", "browser-page");
  const copy = createElement("div", "browser-copy");
  copy.append(createElement("div", "browser-heading"), createElement("div", "browser-line"), createElement("div", "browser-line browser-line--short"), createElement("div", "browser-cta"));
  page.append(copy, createElement("div", "browser-art", project.mark));
  browser.append(browserBar, page);
  visual.append(browser, createElement("span", "project-watermark", project.mark));

  if (project.image) {
    const image = createElement("img", "project-image");
    image.src = project.image;
    image.alt = `${project.title} project preview`;
    image.loading = "lazy";
    image.addEventListener("error", () => image.remove(), { once: true });
    visual.append(image);
  }

  const link = createElement("a", "project-open");
  link.href = project.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `Visit ${project.title} website (opens in a new tab)`);
  link.append(createElement("span", "", "↗"));
  visual.append(link);

  const info = createElement("div", "project-info");
  const top = createElement("div", "project-info-top");
  const titleBlock = createElement("div", "project-copy");
  titleBlock.append(createElement("h3", "project-title", project.title));
  const domain = new URL(project.url).hostname.replace(/^www\./, "");
  titleBlock.append(createElement("p", "project-domain", domain));
  top.append(titleBlock, createElement("span", "project-category", project.category));
  const description = createElement("p", "project-description", project.description);
  const meta = createElement("div", "project-meta");
  const tags = createElement("div", "project-tags");
  project.tags.forEach((tag) => tags.append(createElement("span", "project-tag", tag)));
  const visit = createElement("a", "project-visit", "Visit website ↗");
  visit.href = project.url;
  visit.target = "_blank";
  visit.rel = "noopener noreferrer";
  visit.setAttribute("aria-label", `Visit ${project.title} website (opens in a new tab)`);
  meta.append(tags, visit);
  info.append(top, description, meta);
  article.append(visual, info);
  return article;
}

function renderProjects() {
  const fragment = document.createDocumentFragment();
  projects.forEach((project, index) => fragment.append(createProjectCard(project, index)));
  projectGrid.append(fragment);
  document.querySelectorAll("[data-project-count]").forEach((node) => { node.textContent = String(projects.length); });
  document.querySelector('[data-count="projects"]').textContent = String(projects.length);
  renderFilters();
}

function renderFilters() {
  const container = document.querySelector("#project-filters");
  const fragment = document.createDocumentFragment();
  projectFilters.forEach((filter, index) => {
    const button = createElement("button", "filter-button", filter.label);
    button.type = "button";
    button.dataset.filter = filter.value;
    button.setAttribute("aria-pressed", String(index === 0));
    button.addEventListener("click", () => applyFilter(filter.value, button));
    fragment.append(button);
  });
  container.append(fragment);
  updateProjectCount();
}

function applyFilter(filter, selectedButton) {
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button === selectedButton));
  });
  let visibleIndex = 0;
  projectGrid.querySelectorAll(".project-card").forEach((card) => {
    const matches = filter === "all"
      || (filter === "featured" && card.dataset.featured === "true")
      || (filter === "recent" && card.dataset.recent === "true")
      || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !matches);
    if (matches) {
      card.style.setProperty("--card-index", String(visibleIndex));
      card.classList.remove("is-entering");
      void card.offsetWidth;
      card.classList.add("is-entering");
      visibleIndex += 1;
    }
  });
  updateProjectCount();
}

function updateProjectCount() {
  const count = projectGrid.querySelectorAll(".project-card:not(.is-hidden)").length;
  document.querySelector("#project-result").textContent = `${count} ${count === 1 ? "project" : "projects"}`;
}

function initCursor() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const dot = document.querySelector(".cursor--dot");
  const ring = document.querySelector(".cursor--ring");
  const label = document.querySelector(".cursor--label");
  let x = -50;
  let y = -50;
  let ringX = x;
  let ringY = y;
  let frame = 0;
  const tick = () => {
    ringX += (x - ringX) * 0.18;
    ringY += (y - ringY) * 0.18;
    const ringSize = ring.classList.contains("is-active") ? 26.5 : 16.5;
    dot.style.transform = `translate3d(${x - 2.5}px, ${y - 2.5}px, 0)`;
    ring.style.transform = `translate3d(${ringX - ringSize}px, ${ringY - ringSize}px, 0)`;
    if (label) label.style.transform = `translate3d(${x + 18}px, ${y + 18}px, 0)`;
    if (isMotionEnabled() && (Math.abs(x - ringX) > 0.2 || Math.abs(y - ringY) > 0.2)) frame = requestAnimationFrame(tick);
    else frame = 0;
  };
  const syncMotion = () => {
    document.body.classList.toggle("has-custom-cursor", isMotionEnabled());
    if (!isMotionEnabled()) {
      cancelAnimationFrame(frame);
      frame = 0;
      ring.classList.remove("is-active");
    }
  };
  document.addEventListener("motionpreferencechange", syncMotion);
  syncMotion();
  window.addEventListener("pointermove", (event) => {
    x = event.clientX;
    y = event.clientY;
    if (isMotionEnabled() && !frame) frame = requestAnimationFrame(tick);
  }, { passive: true });
  document.addEventListener("pointerover", (event) => {
    const hot = event.target.closest("a, button, .service-row, .project-card, .filter-button");
    if (!isMotionEnabled() || !hot) return;
    ring.classList.add("is-active");
    if (label) {
      label.textContent = hot.matches(".project-card, .project-open, .project-visit") ? "Open" : "Go";
      label.classList.toggle("is-visible", Boolean(hot.closest("a, .project-card")));
    }
  });
  document.addEventListener("pointerout", (event) => {
    const hot = event.target.closest("a, button, .service-row, .project-card, .filter-button");
    if (!hot) return;
    ring.classList.remove("is-active");
    label?.classList.remove("is-visible");
  });
}

function initMagneticButtons() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (!isMotionEnabled()) return;
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    button.addEventListener("pointerleave", () => { button.style.transform = ""; });
  });
}

function initCardTilt() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  projectGrid.addEventListener("pointermove", (event) => {
    if (!isMotionEnabled()) return;
    const card = event.target.closest(".project-card");
    if (!card || card.classList.contains("is-hidden")) return;
    const rect = card.querySelector(".project-visual").getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 5;
    const rotateX = (0.5 - y) * 5;
    card.classList.add("is-tilting");
    card.querySelector(".project-visual").style.transform = `perspective(750px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, { passive: true });
  projectGrid.addEventListener("pointerout", (event) => {
    const card = event.target.closest(".project-card");
    if (!card || card.contains(event.relatedTarget)) return;
    card.classList.remove("is-tilting");
    card.querySelector(".project-visual").style.transform = "";
  });
}

function initReveals() {
  const targets = document.querySelectorAll(".hero-copy, .hero-art, .intro-band-inner, .marquee, .section-heading, .about-lead, .about-columns, .about-content .text-link, .about-illustration, .expertise-orb, .skill-item, .services-top, .service-row, .work-heading, .work-toolbar, .project-card, .work-endnote, .stack-viz, .timeline-item, .education-card, .fact, .facts-note, .contact-inner, .site-footer");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((item) => item.classList.remove("reveal"));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  const update = () => {
    observer.disconnect();
    if (!isMotionEnabled()) {
      targets.forEach((item) => item.classList.remove("reveal", "is-visible"));
      return;
    }
    targets.forEach((item) => {
      item.classList.add("reveal");
      item.classList.remove("is-visible");
      observer.observe(item);
    });
  };
  document.addEventListener("motionpreferencechange", update);
  update();
}

function initFactCounters() {
  if (!("IntersectionObserver" in window)) return;
  const counters = [...document.querySelectorAll(".fact strong[data-count]")];
  const values = new Map(counters.map((counter) => [counter, counter.textContent.trim()]));
  const completed = new WeakSet();
  const activeFrames = new Map();
  const animate = (counter) => {
    if (!isMotionEnabled() || completed.has(counter) || activeFrames.has(counter)) return;
    const finalText = values.get(counter);
    const target = Number.parseInt(finalText, 10);
    if (!Number.isFinite(target)) return;
    const suffix = finalText.slice(String(target).length);
    const start = performance.now();
    const duration = 950;
    const tick = (now) => {
      if (!isMotionEnabled()) {
        activeFrames.delete(counter);
        counter.textContent = finalText;
        completed.add(counter);
        return;
      }
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      counter.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) activeFrames.set(counter, requestAnimationFrame(tick));
      else {
        activeFrames.delete(counter);
        completed.add(counter);
      }
    };
    counter.textContent = `0${suffix}`;
    activeFrames.set(counter, requestAnimationFrame(tick));
  };
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && isMotionEnabled()) {
        currentObserver.unobserve(entry.target);
        animate(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach((counter) => observer.observe(counter));
  document.addEventListener("motionpreferencechange", () => {
    if (!isMotionEnabled()) {
      activeFrames.forEach((frame, counter) => {
        cancelAnimationFrame(frame);
        activeFrames.delete(counter);
        counter.textContent = values.get(counter);
        completed.add(counter);
      });
      return;
    }
    counters.forEach((counter) => {
      if (completed.has(counter)) return;
      const rect = counter.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) animate(counter);
    });
  });
}

function initMotionControl() {
  const toggle = document.querySelector("#motion-toggle");
  const update = () => {
    const enabled = isMotionEnabled();
    toggle.textContent = `Motion: ${enabled ? "On" : "Off"}`;
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.setAttribute("aria-label", `${enabled ? "Disable" : "Enable"} motion animations`);
  };
  toggle.addEventListener("click", () => setMotionEnabled(!isMotionEnabled()));
  document.addEventListener("motionpreferencechange", update);
  update();
}

function initNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  window.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });

  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      links.forEach((link) => {
        if (link.hash === `#${active.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -65% 0px", threshold: [0, .2, .5] });
    sections.forEach((section) => observer.observe(section));
  }
}

function initPreloader() {
  const loader = document.querySelector(".preloader");
  let done = false;
  const dismiss = () => {
    if (done) return;
    done = true;
    loader.classList.add("is-done");
    document.body.classList.remove("is-loading");
  };
  document.body.classList.add("is-loading");
  const finish = () => window.setTimeout(dismiss, isMotionEnabled() ? 350 : 0);
  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish, { once: true });
  window.setTimeout(dismiss, 2400);
}

renderProfile();
renderSkills();
renderServices();
renderExperience();
renderEducation();
renderProjects();
document.querySelector("#current-year").textContent = String(new Date().getFullYear());
initPreloader();
initNavigation();
initMotionControl();
initCursor();
initMagneticButtons();
initCardTilt();
initReveals();
initFactCounters();
initSplitText();
initSmoothAnchors();
initScrollProgress();
initHeaderScroll();
initParallax();
initStackViz();
initSkillMeters();
initRoleCycle();
initTiltArt();
initServiceExpand();
initFilterGestures((value, button) => applyFilter(value, button));
initHeroScene(document.querySelector("#hero-canvas"));

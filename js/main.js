const ASCII_BG_CONFIG = {
  cellSize: 9,
  speed: 0.00135,
  characters: ".,:;!~*+=-",
  opacity: 0.32,
  maxFps: 12,
  reducedFps: 4,
  maxCells: 4000,
  pulseStrength: 0.75,
  adaptiveSize: false
};

function initAsciiBackground() {
  const chars = Array.from(ASCII_BG_CONFIG.characters);
  if (!chars.length) return;

  const existing = document.getElementById("ascii-bg-text");
  const textLayer = existing || document.createElement("pre");
  textLayer.id = "ascii-bg-text";
  textLayer.className = "ascii-bg-text";
  textLayer.setAttribute("aria-hidden", "true");
  if (!existing) document.body.prepend(textLayer);
  textLayer.style.opacity = String(ASCII_BG_CONFIG.opacity);

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = mediaQuery.matches;

  let viewportWidth = 0;
  let viewportHeight = 0;
  let cellSize = Math.max(4, ASCII_BG_CONFIG.cellSize);
  let activeCellSize = cellSize;
  let activeMaxFps = ASCII_BG_CONFIG.maxFps;
  let activeMaxCells = ASCII_BG_CONFIG.maxCells;
  let charWidth = cellSize * 0.62;
  let lineHeight = cellSize;
  let cols = 0;
  let rows = 0;
  let seeds = new Uint16Array(0);
  let phases = new Float32Array(0);
  let speeds = new Float32Array(0);
  let rafId = 0;
  let running = false;
  let lastFrame = 0;
  let resizeTimer = 0;
  let frameInterval = 1000 / ASCII_BG_CONFIG.maxFps;

  const updateDeviceProfile = () => {
    const isPhone = window.matchMedia("(max-width: 768px)").matches;
    const isTablet = window.matchMedia("(max-width: 1024px)").matches;
    if (isPhone) {
      activeCellSize = Math.max(10, ASCII_BG_CONFIG.cellSize);
      activeMaxFps = 8;
      activeMaxCells = 2600;
      return;
    }
    if (isTablet) {
      activeCellSize = Math.max(9, ASCII_BG_CONFIG.cellSize);
      activeMaxFps = 10;
      activeMaxCells = 3200;
      return;
    }
    activeCellSize = Math.max(4, ASCII_BG_CONFIG.cellSize);
    activeMaxFps = ASCII_BG_CONFIG.maxFps;
    activeMaxCells = ASCII_BG_CONFIG.maxCells;
  };

  const updateMotionProfile = () => {
    frameInterval = 1000 / (reducedMotion ? ASCII_BG_CONFIG.reducedFps : activeMaxFps);
  };

  const measureGlyph = () => {
    const probe = document.createElement("span");
    probe.textContent = "M";
    probe.style.position = "fixed";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.whiteSpace = "pre";
    probe.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    probe.style.fontSize = `${cellSize}px`;
    probe.style.lineHeight = "1";
    document.body.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    document.body.removeChild(probe);
    charWidth = Math.max(1, rect.width);
    lineHeight = Math.max(1, rect.height);
  };

  const fitGridToBudget = () => {
    let nextSize = Math.max(4, activeCellSize);
    let estimatedCharWidth = nextSize * 0.62;
    let estimatedCols = Math.ceil(viewportWidth / estimatedCharWidth);
    let estimatedRows = Math.ceil(viewportHeight / nextSize);
    const estimatedCells = estimatedCols * estimatedRows;
    if (ASCII_BG_CONFIG.adaptiveSize && estimatedCells > activeMaxCells) {
      const scale = Math.sqrt(estimatedCells / activeMaxCells);
      nextSize = Math.ceil(nextSize * scale);
      estimatedCharWidth = nextSize * 0.62;
      estimatedCols = Math.ceil(viewportWidth / estimatedCharWidth);
      estimatedRows = Math.ceil(viewportHeight / nextSize);
    }
    cellSize = Math.max(4, nextSize);
    textLayer.style.fontSize = `${cellSize}px`;
    measureGlyph();
    cols = Math.ceil(viewportWidth / charWidth);
    rows = Math.ceil(viewportHeight / lineHeight);
  };

  const rebuildField = () => {
    fitGridToBudget();
    const total = cols * rows;
    seeds = new Uint16Array(total);
    phases = new Float32Array(total);
    speeds = new Float32Array(total);
    for (let i = 0; i < total; i += 1) {
      seeds[i] = Math.floor(Math.random() * chars.length);
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.65 + Math.random() * 0.8;
    }
  };

  const resize = (timeMs = performance.now()) => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    updateDeviceProfile();
    updateMotionProfile();
    rebuildField();
    draw(timeMs);
  };

  const draw = (timeMs) => {
    const lines = new Array(rows);
    let index = 0;
    const motionFactor = reducedMotion ? 0.18 : 1;
    const time = timeMs * ASCII_BG_CONFIG.speed * motionFactor;
    const pulse = 0.5 + 0.5 * Math.sin(timeMs * 0.0022);
    for (let y = 0; y < rows; y += 1) {
      const line = new Array(cols);
      for (let x = 0; x < cols; x += 1) {
        const distance = Math.hypot(x - cols * 0.5, y - rows * 0.5);
        const waveA = Math.sin(distance * 0.38 - time * 8.0 + phases[index]);
        const waveB = Math.sin(x * 0.24 + y * 0.2 + time * 5.0 * speeds[index]);
        const mixed = waveA * (0.55 + pulse * ASCII_BG_CONFIG.pulseStrength) + waveB * 0.45;
        const normalized = Math.max(0, Math.min(1, (mixed + 2) / 4));
        const band = Math.floor(normalized * (chars.length - 1));
        line[x] = chars[(seeds[index] + band) % chars.length];
        index += 1;
      }
      lines[y] = line.join("");
    }
    textLayer.textContent = lines.join("\n");
  };

  const tick = (timeMs) => {
    if (!running) return;
    if (timeMs - lastFrame >= frameInterval) {
      lastFrame = timeMs;
      draw(timeMs);
    }
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    lastFrame = 0;
    rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const onReduceMotionChange = (event) => {
    reducedMotion = event.matches;
    updateMotionProfile();
    if (!running) {
      draw(performance.now());
      return;
    }
    lastFrame = 0;
  };

  const onVisibility = () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  };

  const onResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resize(performance.now()), 140);
  };

  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", onReduceMotionChange);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(onReduceMotionChange);
  }

  updateDeviceProfile();
  updateMotionProfile();
  resize();
  start();
}

initAsciiBackground();

const drawerToggle = document.querySelector(".drawer-toggle");
const sideDrawer = document.querySelector(".side-drawer");
const drawerOverlay = document.querySelector(".drawer-overlay");
const drawerClose = document.querySelector(".drawer-close");
const drawerLinks = document.querySelectorAll(".drawer-nav a");

const setDrawerState = (open) => {
  if (!drawerToggle || !sideDrawer || !drawerOverlay) return;

  sideDrawer.classList.toggle("open", open);
  drawerOverlay.classList.toggle("open", open);
  document.body.classList.toggle("drawer-open", open);
  drawerToggle.setAttribute("aria-expanded", String(open));
  sideDrawer.setAttribute("aria-hidden", String(!open));
};

if (drawerToggle && sideDrawer && drawerOverlay) {
  drawerToggle.addEventListener("click", () => {
    setDrawerState(!sideDrawer.classList.contains("open"));
  });

  drawerOverlay.addEventListener("click", () => setDrawerState(false));

  if (drawerClose) {
    drawerClose.addEventListener("click", () => setDrawerState(false));
  }

  drawerLinks.forEach((link) => {
    link.addEventListener("click", () => setDrawerState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setDrawerState(false);
  });
}

if ("IntersectionObserver" in window) {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  const action = contactForm.getAttribute("action") || "";
  const isExternalPost = /^https?:\/\//i.test(action);
  const isPlaceholderFormspree = /formspree\.io\/f\/your_form_id/i.test(action);

  if (isPlaceholderFormspree) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Set your Formspree form ID in contact.html to enable email delivery.");
    });
  } else if (!isExternalPost) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Thanks. Your inquiry has been captured. We will follow up within 1 business day.");
      contactForm.reset();
    });
  }
}

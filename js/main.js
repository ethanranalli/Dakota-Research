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

const warmInstagramEmbed = (() => {
  let warmed = false;
  return () => {
    if (warmed) return;
    warmed = true;

    const preconnectHosts = [
      "https://www.instagram.com",
      "https://static.cdninstagram.com",
    ];

    preconnectHosts.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });

    // Start fetching the embed document before navigation.
    const preloadFrame = document.createElement("iframe");
    preloadFrame.src = "https://www.instagram.com/dakotaresearch/embed";
    preloadFrame.loading = "eager";
    preloadFrame.setAttribute("aria-hidden", "true");
    preloadFrame.tabIndex = -1;
    preloadFrame.style.position = "fixed";
    preloadFrame.style.width = "1px";
    preloadFrame.style.height = "1px";
    preloadFrame.style.opacity = "0";
    preloadFrame.style.pointerEvents = "none";
    preloadFrame.style.left = "-9999px";
    preloadFrame.style.top = "-9999px";
    document.body.appendChild(preloadFrame);
  };
})();

const isInstagramPage = window.location.pathname.endsWith("/instagram.html") || window.location.pathname.endsWith("instagram.html");
if (!isInstagramPage) {
  const instagramLinks = document.querySelectorAll('a[href="instagram.html"]');
  instagramLinks.forEach((link) => {
    link.addEventListener("mouseenter", warmInstagramEmbed, { once: true });
    link.addEventListener("focus", warmInstagramEmbed, { once: true });
    link.addEventListener("touchstart", warmInstagramEmbed, { once: true, passive: true });
  });
}

const galleryNodes = document.querySelectorAll("[data-gallery]");
let activeGallery = null;

const setupGallery = (galleryNode) => {
  const slides = Array.from(galleryNode.querySelectorAll("[data-gallery-slide]"));
  if (slides.length < 2) return null;

  const counter = galleryNode.parentElement?.querySelector(".gallery-counter");
  let currentIndex = 0;

  const setSlide = (nextIndex) => {
    currentIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.hidden = !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    if (counter) {
      counter.textContent = `< ${currentIndex + 1}/${slides.length} >`;
    }
  };

  const controls = {
    element: galleryNode,
    previous: () => setSlide(currentIndex - 1),
    next: () => setSlide(currentIndex + 1),
  };

  const prevButton = galleryNode.querySelector(".gallery-prev");
  const nextButton = galleryNode.querySelector(".gallery-next");

  if (prevButton) {
    prevButton.addEventListener("click", (event) => {
      event.stopPropagation();
      controls.previous();
      activeGallery = controls;
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      controls.next();
      activeGallery = controls;
    });
  }

  galleryNode.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest(".gallery-hit")) return;

    const bounds = galleryNode.getBoundingClientRect();
    const midpoint = bounds.left + bounds.width / 2;
    if (event.clientX < midpoint) {
      controls.previous();
    } else {
      controls.next();
    }
    activeGallery = controls;
  });

  galleryNode.addEventListener("mouseenter", () => {
    activeGallery = controls;
  });

  galleryNode.addEventListener("focusin", () => {
    activeGallery = controls;
  });

  setSlide(0);
  return controls;
};

const galleryControls = Array.from(galleryNodes)
  .map((node) => setupGallery(node))
  .filter(Boolean);

if (galleryControls.length) {
  document.addEventListener("keydown", (event) => {
    const targetTag = event.target && event.target.tagName ? event.target.tagName : "";
    if (targetTag === "INPUT" || targetTag === "TEXTAREA") return;
    if (!activeGallery || !document.body.contains(activeGallery.element)) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      activeGallery.previous();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      activeGallery.next();
    }
  });
}

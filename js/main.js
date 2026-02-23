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

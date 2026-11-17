/* ParcelPro homepage interactions: hero slider */
(() => {
  "use strict";

  function initialiseSlider() {
    const slides = Array.from(document.querySelectorAll(".pp-slide"));
    const dots = Array.from(document.querySelectorAll("#slideDots button"));
    const previous = document.getElementById("slidePrev");
    const next = document.getElementById("slideNext");

    if (!slides.length) {
      console.info("ParcelPro homepage: no hero slides found; slider skipped.");
      return;
    }

    let active = Math.max(0, slides.findIndex(slide => slide.classList.contains("active")));
    let timer = null;
    const reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === active);
        slide.setAttribute("aria-hidden", i === active ? "false" : "true");
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === active);
        dot.setAttribute("aria-current", i === active ? "true" : "false");
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = null;
      if (!reducedMotion && slides.length > 1) {
        timer = window.setInterval(() => show(active + 1), 5000);
      }
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        const requested = Number(dot.dataset.slide);
        show(Number.isInteger(requested) ? requested : i);
        restart();
      });
    });
    previous?.addEventListener("click", () => { show(active - 1); restart(); });
    next?.addEventListener("click", () => { show(active + 1); restart(); });

    show(active);
    restart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseSlider, { once: true });
  } else {
    initialiseSlider();
  }
})();
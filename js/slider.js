/**
 * Slider module: hero dual-axis, school-type cards, exhibition carousel.
 *
 * Hero dual-axis behaviour:
 * - Desktop: vertical infinite scroll of logo rows (Y axis)
 * - Mobile: horizontal slide groups with pagination (X axis)
 * Both axes share pause-on-hover/focus and visibility pause logic.
 */

(function initSliders() {
  "use strict";

  const MOBILE_BP = 767;
  const TABLET_BP = 991;
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ utils */

  function announce(message) {
    const live = document.createElement("div");
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    live.className = "sr-only";
    live.textContent = message;
    document.body.appendChild(live);
    setTimeout(() => live.remove(), 1000);
  }

  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  function isCarouselViewport() {
    return window.innerWidth <= TABLET_BP;
  }

  /* ---------------------------------------------------------- Hero slider */

  /**
   * Dual-axis hero slider:
   * vertical marquee on desktop, horizontal paginated slides on mobile.
   */
  function initHeroSlider() {
    const region = document.querySelector(".hero__slider");
    const track = document.querySelector("[data-hero-track]");
    const viewport = document.querySelector(".hero__slider-viewport");
    const rows = track ? Array.from(track.querySelectorAll(".hero__slider-row")) : [];
    const dots = document.querySelectorAll(".hero__slider-dot");
    const status = document.getElementById("hero-slider-status");

    if (!region || !track || rows.length === 0) {
      return;
    }

    const ROW_HEIGHT = 150;
    const VERTICAL_SPEED = 0.3;
    const AUTOPLAY_MS = 5000;

    let verticalPos = 0;
    let verticalAnimId = null;
    let horizontalIndex = 0;
    let horizontalTimer = null;
    let isPaused = false;
    let touchStartX = 0;
    let touchStartY = 0;

    /* Clone rows for seamless vertical loop (desktop) */
    rows.forEach((row) => {
      track.appendChild(row.cloneNode(true));
    });

    const originalRowCount = rows.length;
    const totalVerticalHeight = ROW_HEIGHT * originalRowCount;

    function setHorizontalSlide(index) {
      horizontalIndex = index;
      track.style.transform = `translateX(-${index * 25}%)`;

      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("hero__slider-dot--active", active);
        dot.setAttribute("aria-selected", String(active));
        dot.setAttribute("tabindex", active ? "0" : "-1");
      });

      if (status) {
        status.textContent = `Showing slide ${index + 1} of ${originalRowCount}`;
      }
    }

    function verticalTick() {
      if (!isPaused && !REDUCED_MOTION && !isMobile()) {
        verticalPos -= VERTICAL_SPEED;
        if (verticalPos <= -totalVerticalHeight) {
          verticalPos = 0;
        }
        track.style.transform = `translateY(${verticalPos}px)`;
      }
      verticalAnimId = requestAnimationFrame(verticalTick);
    }

    function startHorizontalAutoplay() {
      stopHorizontalAutoplay();
      if (REDUCED_MOTION || !isMobile()) {
        return;
      }
      horizontalTimer = setInterval(() => {
        if (!isPaused) {
          setHorizontalSlide((horizontalIndex + 1) % originalRowCount);
        }
      }, AUTOPLAY_MS);
    }

    function stopHorizontalAutoplay() {
      clearInterval(horizontalTimer);
    }

    function pause() {
      isPaused = true;
    }

    function resume() {
      isPaused = false;
    }

    function applyMode() {
      track.style.transform = "";
      track.style.flexDirection = "";
      const allRows = track.querySelectorAll(".hero__slider-row");

      if (isMobile()) {
        cancelAnimationFrame(verticalAnimId);
        track.style.flexDirection = "row";
        allRows.forEach((row, i) => {
          row.style.display = i >= originalRowCount ? "none" : "";
        });
        setHorizontalSlide(horizontalIndex);
        startHorizontalAutoplay();
      } else {
        stopHorizontalAutoplay();
        track.style.flexDirection = "column";
        allRows.forEach((row) => {
          row.style.display = "";
          row.style.minWidth = "";
          row.style.flex = "";
        });
        verticalPos = 0;
        verticalTick();
      }
    }

    region.addEventListener("mouseenter", pause);
    region.addEventListener("mouseleave", resume);
    region.addEventListener("focusin", pause);
    region.addEventListener("focusout", resume);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        pause();
        stopHorizontalAutoplay();
        cancelAnimationFrame(verticalAnimId);
      } else {
        resume();
        applyMode();
      }
    });

    region.addEventListener("keydown", (event) => {
      if (!isMobile()) {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        pause();
        setHorizontalSlide((horizontalIndex + 1) % originalRowCount);
        setTimeout(resume, 3000);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        pause();
        setHorizontalSlide(horizontalIndex === 0 ? originalRowCount - 1 : horizontalIndex - 1);
        setTimeout(resume, 3000);
      }
    });

    region.addEventListener(
      "touchstart",
      (event) => {
        if (!isMobile()) {
          return;
        }
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        pause();
      },
      { passive: true }
    );

    region.addEventListener(
      "touchend",
      (event) => {
        if (!isMobile()) {
          return;
        }
        const dx = touchStartX - event.changedTouches[0].clientX;
        const dy = touchStartY - event.changedTouches[0].clientY;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
          if (dx > 0) {
            setHorizontalSlide((horizontalIndex + 1) % originalRowCount);
          } else {
            setHorizontalSlide(horizontalIndex === 0 ? originalRowCount - 1 : horizontalIndex - 1);
          }
        }
        setTimeout(resume, 3000);
      },
      { passive: true }
    );

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        pause();
        setHorizontalSlide(Number(dot.dataset.heroSlide));
        setTimeout(resume, 3000);
      });
    });

    window.addEventListener("resize", applyMode);
    applyMode();
  }

  /* ---------------------------------------------------- School types slider */

  function initSchoolTypesSlider() {
    const track = document.querySelector("[data-school-types-track]");
    const cards = document.querySelectorAll(".school-types__card");
    const dots = document.querySelectorAll(".school-types__dot");
    const region = document.querySelector(".school-types__slider");

    if (!track || cards.length === 0) {
      return;
    }

    let current = 0;
    let autoTimer = null;
    let interacting = false;
    let touchStartX = 0;

    function update() {
      if (!isMobile()) {
        track.style.transform = "";
        cards.forEach((card) => card.removeAttribute("aria-hidden"));
        return;
      }

      track.style.transform = `translateX(-${current * 100}%)`;

      dots.forEach((dot, index) => {
        const active = index === current;
        dot.classList.toggle("school-types__dot--active", active);
        dot.setAttribute("aria-selected", String(active));
        dot.setAttribute("tabindex", active ? "0" : "-1");
      });

      cards.forEach((card, index) => {
        card.setAttribute("aria-hidden", String(index !== current));
      });

      const title = cards[current].querySelector(".school-types__card-title");
      announce(`Now showing: ${title ? title.textContent : `Slide ${current + 1}`}`);
    }

    function goTo(index) {
      current = index;
      update();
    }

    function next() {
      goTo((current + 1) % cards.length);
    }

    function prev() {
      goTo(current === 0 ? cards.length - 1 : current - 1);
    }

    function startAuto() {
      clearInterval(autoTimer);
      if (isMobile() && !interacting && !REDUCED_MOTION) {
        autoTimer = setInterval(next, 5000);
      }
    }

    function stopAuto() {
      clearInterval(autoTimer);
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        interacting = true;
        stopAuto();
        goTo(index);
        setTimeout(() => {
          interacting = false;
          startAuto();
        }, 3000);
      });

      dot.addEventListener("keydown", (event) => {
        let target = index;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          target = (index + 1) % dots.length;
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          target = index === 0 ? dots.length - 1 : index - 1;
        } else if (event.key === "Home") {
          event.preventDefault();
          target = 0;
        } else if (event.key === "End") {
          event.preventDefault();
          target = dots.length - 1;
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goTo(index);
          return;
        } else {
          return;
        }
        dots[target].focus();
        goTo(target);
      });
    });

    track.addEventListener("keydown", (event) => {
      if (!isMobile()) {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
    });

    track.addEventListener(
      "touchstart",
      (event) => {
        if (!isMobile()) {
          return;
        }
        touchStartX = event.touches[0].clientX;
        interacting = true;
        stopAuto();
      },
      { passive: true }
    );

    track.addEventListener(
      "touchend",
      (event) => {
        if (!isMobile()) {
          return;
        }
        const diff = touchStartX - event.changedTouches[0].clientX;
        if (Math.abs(diff) > 80) {
          diff > 0 ? next() : prev();
        }
        setTimeout(() => {
          interacting = false;
          startAuto();
        }, 3000);
      },
      { passive: true }
    );

    if (region) {
      region.addEventListener("mouseenter", stopAuto);
      region.addEventListener("mouseleave", startAuto);
    }

    window.addEventListener("resize", () => {
      stopAuto();
      current = 0;
      update();
      startAuto();
    });

    update();
    startAuto();
  }

  /* --------------------------------------------------- Exhibition carousel */

  function initExhibitionCarousel() {
    const track = document.querySelector("[data-exhibition-track]");
    const cards = document.querySelectorAll(".exhibition__card");
    const prevBtn = document.getElementById("exhibition-prev");
    const nextBtn = document.getElementById("exhibition-next");
    const pagination = document.querySelector(".exhibition__pagination");
    const status = document.getElementById("exhibition-status");
    const region = document.querySelector(".exhibition__carousel");

    if (!track || cards.length === 0) {
      return;
    }

    let current = 0;
    let autoTimer = null;
    const AUTOPLAY_MS = 6000;

    function buildPagination() {
      if (!pagination) {
        return;
      }
      pagination.innerHTML = "";
      cards.forEach((_, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "exhibition__pagination-dot";
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-label", `Exhibition feature ${index + 1} of ${cards.length}`);
        btn.dataset.slide = String(index);
        if (index === 0) {
          btn.classList.add("exhibition__pagination-dot--active");
          btn.setAttribute("aria-selected", "true");
        }
        btn.addEventListener("click", () => goTo(index));
        pagination.appendChild(btn);
      });
    }

    function updatePagination() {
      pagination?.querySelectorAll(".exhibition__pagination-dot").forEach((dot, index) => {
        const active = index === current;
        dot.classList.toggle("exhibition__pagination-dot--active", active);
        dot.setAttribute("aria-selected", String(active));
      });
    }

    function update() {
      const carouselMode = isCarouselViewport();

      if (carouselMode) {
        const cardWidth = cards[0].offsetWidth;
        const gap = 20;
        track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;

        cards.forEach((card, index) => {
          card.setAttribute("aria-hidden", String(index !== current));
        });

        const title = cards[current].querySelector(".exhibition__card-title");
        if (status) {
          status.textContent = `Slide ${current + 1} of ${cards.length}: ${title?.textContent || ""}`;
        }
      } else {
        track.style.transform = "none";
        cards.forEach((card) => card.removeAttribute("aria-hidden"));
        if (status) {
          status.textContent = "All exhibition features are visible";
        }
      }

      if (prevBtn && nextBtn) {
        const disableNav = !carouselMode;
        prevBtn.disabled = disableNav || current === 0;
        nextBtn.disabled = disableNav || current === cards.length - 1;
        prevBtn.setAttribute("aria-disabled", String(prevBtn.disabled));
        nextBtn.setAttribute("aria-disabled", String(nextBtn.disabled));
      }

      updatePagination();
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, cards.length - 1));
      update();
    }

    function next() {
      if (current < cards.length - 1) {
        goTo(current + 1);
      }
    }

    function prev() {
      if (current > 0) {
        goTo(current - 1);
      }
    }

    function startAuto() {
      clearInterval(autoTimer);
      if (isCarouselViewport() && !REDUCED_MOTION) {
        autoTimer = setInterval(() => {
          goTo(current >= cards.length - 1 ? 0 : current + 1);
        }, AUTOPLAY_MS);
      }
    }

    function stopAuto() {
      clearInterval(autoTimer);
    }

    prevBtn?.addEventListener("click", prev);
    nextBtn?.addEventListener("click", next);

    prevBtn?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        prev();
      }
    });

    nextBtn?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        next();
      }
    });

    region?.addEventListener("keydown", (event) => {
      if (!isCarouselViewport()) {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(cards.length - 1);
      }
    });

    region?.addEventListener("mouseenter", stopAuto);
    region?.addEventListener("mouseleave", startAuto);
    region?.addEventListener("focusin", stopAuto);
    region?.addEventListener("focusout", startAuto);

    let touchStartX = 0;
    region?.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.touches[0].clientX;
        stopAuto();
      },
      { passive: true }
    );

    region?.addEventListener(
      "touchend",
      (event) => {
        const diff = touchStartX - event.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? next() : prev();
        }
        startAuto();
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      current = 0;
      stopAuto();
      update();
      startAuto();
    });

    buildPagination();
    update();
    startAuto();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeroSlider();
    initSchoolTypesSlider();
    initExhibitionCarousel();
  });
})();

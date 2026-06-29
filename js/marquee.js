/**
 * Participating schools logo marquee.
 * Top row scrolls left; bottom row scrolls right.
 * Pauses on hover and keyboard focus; respects prefers-reduced-motion.
 */

(function initMarquee() {
  "use strict";

  const IMAGE_WIDTH = 270;
  const SPEED = 0.5;
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Clone logo images once so the track can loop seamlessly.
   */
  function duplicateImages(row) {
    const images = row.querySelectorAll("img");
    images.forEach((img) => {
      row.appendChild(img.cloneNode(true));
    });
    return images.length;
  }

  /**
   * Drive one marquee row with requestAnimationFrame.
   */
  function animateRow(row, index, container) {
    const count = duplicateImages(row);
    if (count === 0) {
      return;
    }

    const totalWidth = IMAGE_WIDTH * count;
    let position = index === 1 ? -totalWidth : 0;
    let animationId = null;
    let isPaused = false;

    row.style.transform = `translateX(${position}px)`;

    function tick() {
      if (!isPaused && !REDUCED_MOTION) {
        if (index === 0) {
          position -= SPEED;
          if (position <= -totalWidth) {
            position = 0;
          }
        } else {
          position += SPEED;
          if (position >= 0) {
            position = -totalWidth;
          }
        }
        row.style.transform = `translateX(${position}px)`;
      }
      animationId = requestAnimationFrame(tick);
    }

    function pause() {
      isPaused = true;
    }

    function resume() {
      isPaused = false;
    }

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);
    container.addEventListener("focusin", pause);
    container.addEventListener("focusout", resume);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        tick();
      }
    });

    tick();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".schools__marquee");
    if (!container) {
      return;
    }

    container.querySelectorAll("[data-marquee-row]").forEach((row, index) => {
      animateRow(row, index, container);
    });
  });
})();

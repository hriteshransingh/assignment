/**
 * Main application bootstrap: header, navigation, form validation, accessibility.
 */

(function initApp() {
  "use strict";

  /* -------------------------------------------------------------- Header */

  function initHeaderScroll() {
    const header = document.querySelector(".header");
    if (!header) {
      return;
    }

    const onScroll = () => {
      header.classList.toggle("header--scrolled", window.scrollY > 60);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initMobileNav() {
    const toggle = document.querySelector(".header__menu-toggle");
    const nav = document.querySelector(".header__nav");
    if (!toggle || !nav) {
      return;
    }

    const closeNav = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
      nav.classList.remove("header__nav--open");
      document.body.style.overflow = "";
    };

    const openNav = () => {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation menu");
      nav.classList.add("header__nav--open");
      document.body.style.overflow = "hidden";
      nav.querySelector(".header__nav-link")?.focus();
    };

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? closeNav() : openNav();
    });

    nav.querySelectorAll(".header__nav-link").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* -------------------------------------------------------- Form handling */

  function announce(message, priority) {
    const live = document.createElement("div");
    live.setAttribute("aria-live", priority || "polite");
    live.setAttribute("aria-atomic", "true");
    live.className = "sr-only";
    live.textContent = message;
    document.body.appendChild(live);
    setTimeout(() => live.remove(), 1000);
  }

  function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent : field.placeholder || field.name || "Field";
  }

  function showFieldError(field, message) {
    let errorEl = document.getElementById(`${field.id}-error`);
    if (!errorEl) {
      errorEl = document.createElement("span");
      errorEl.id = `${field.id}-error`;
      errorEl.className = "field-error";
      errorEl.setAttribute("role", "alert");
      field.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", errorEl.id);
    field.classList.add("error");
  }

  function clearFieldError(field) {
    const errorEl = document.getElementById(`${field.id}-error`);
    if (errorEl) {
      errorEl.textContent = "";
    }
    field.setAttribute("aria-invalid", "false");
    field.classList.remove("error");
  }

  function validateField(field) {
    const value = field.value.trim();
    let valid = true;
    let message = "";

    if (field.hasAttribute("required") && !value) {
      valid = false;
      message = `${getFieldLabel(field)} is required`;
    }

    if (field.type === "tel" && value) {
      const digits = value.replace(/[\s\-()]/g, "");
      if (!/^[+]?[1-9]\d{6,15}$/.test(digits)) {
        valid = false;
        message = "Please enter a valid phone number";
      }
    }

    valid ? clearFieldError(field) : showFieldError(field, message);
    return valid;
  }

  function initForm() {
    const form = document.querySelector(".hero__form");
    if (!form) {
      return;
    }

    const fields = form.querySelectorAll("input, textarea");

    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.classList.contains("error")) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;

      fields.forEach((field) => {
        if (!validateField(field)) {
          valid = false;
        }
      });

      if (valid) {
        announce("Form submitted successfully");
      } else {
        announce("Please correct the errors in the form", "assertive");
        form.querySelector(".error")?.focus();
      }
    });
  }

  /* ---------------------------------------------------- Button accessibility */

  function initButtons() {
    document.querySelectorAll(".btn").forEach((button) => {
      if (button.tagName === "BUTTON") {
        return;
      }
      button.setAttribute("role", "button");
      button.setAttribute("tabindex", "0");
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          button.click();
        }
      });
    });
  }

  /* ----------------------------------------------------------- Lazy images */

  function initLazyImages() {
    if (!("loading" in HTMLImageElement.prototype)) {
      const images = document.querySelectorAll('img[loading="lazy"]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            observer.unobserve(img);
          }
        });
      });
      images.forEach((img) => observer.observe(img));
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeaderScroll();
    initMobileNav();
    initForm();
    initButtons();
    initLazyImages();
  });
})();

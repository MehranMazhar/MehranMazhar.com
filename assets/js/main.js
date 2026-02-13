/* ============================================
   MEHRAN MAZHAR — PORTFOLIO
   Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // ---------- Navigation Scroll Effect ----------
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ---------- Mobile Navigation Toggle ----------
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- Scroll Reveal (Intersection Observer) ----------
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      reveals.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // ---------- Active Navigation Link Highlight ----------
  function initActiveNav() {
    var sections = document.querySelectorAll('.section, .hero');
    var navLinksAll = document.querySelectorAll('.nav__link');

    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinksAll.forEach(function (link) {
              link.style.color = '';
              if (link.getAttribute('href') === '#' + id) {
                link.style.color = 'var(--accent-primary)';
              }
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px',
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ---------- Typing Effect for Hero (subtle) ----------
  function animateHeroOnLoad() {
    var heroElements = document.querySelectorAll('.hero .reveal');
    heroElements.forEach(function (el, index) {
      setTimeout(function () {
        el.classList.add('visible');
      }, 200 + index * 150);
    });
  }

  // ---------- Initialize Everything ----------
  document.addEventListener('DOMContentLoaded', function () {
    // Trigger hero animations immediately
    animateHeroOnLoad();

    // Initialize scroll-based reveals
    initScrollReveal();

    // Initialize active nav highlighting
    initActiveNav();

    // Run nav scroll check on load
    handleNavScroll();
  });
})();

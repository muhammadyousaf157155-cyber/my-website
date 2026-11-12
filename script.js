/**
 * MYK — Muhammad Yousaf Personal Portfolio (V4)
 * Handles theme persistence, mobile navigation, scroll reveals,
 * animated counters, project modal previews, and contact form validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. AUTOMATIC FOOTER YEAR
  ------------------------------------------------------------------------ */
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------------
     2. DARK / LIGHT MODE TOGGLE WITH LOCALSTORAGE
  ------------------------------------------------------------------------ */
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const THEME_KEY = 'myk_portfolio_theme';

  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    htmlEl.setAttribute('data-theme', savedTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);
    });
  }

  /* ------------------------------------------------------------------------
     3. STICKY HEADER & ACTIVE NAV LINK HIGHLIGHTING
  ------------------------------------------------------------------------ */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  const handleScroll = () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }

    const scrollPos = window.scrollY + 160;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ------------------------------------------------------------------------
     4. RESPONSIVE MOBILE HAMBURGER MENU
  ------------------------------------------------------------------------ */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    const closeMenu = () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    };

    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (event) => {
      if (!navMenu.contains(event.target) && !hamburger.contains(event.target)) {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. SCROLL REVEAL & ANIMATED STATISTICS COUNTERS
  ------------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.reveal');
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const animateCounters = () => {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach((counter) => {
      const target = Number(counter.getAttribute('data-target')) || 0;
      const duration = 1500;
      const startTime = performance.now();

      const updateCounter = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(eased * target);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            if (entry.target.classList.contains('about-stats-panel')) {
              animateCounters();
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
    animateCounters();
  }

  /* ------------------------------------------------------------------------
     6. PROJECT DETAILS MODAL
  ------------------------------------------------------------------------ */
  const modal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDesc = document.getElementById('modal-desc');
  const modalHighlights = document.getElementById('modal-highlights');
  const modalTech = document.getElementById('modal-tech');
  const closeButtons = [
    document.getElementById('modal-close'),
    document.getElementById('modal-close-btn'),
    document.getElementById('modal-inquire-btn')
  ];

  document.querySelectorAll('.view-project-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!modal) return;

      modalTitle.textContent = btn.dataset.title || '';
      modalCategory.textContent = btn.dataset.category || '';
      modalDesc.textContent = btn.dataset.desc || '';

      modalHighlights.innerHTML = '';
      (btn.dataset.highlights || '').split(';').forEach((item) => {
        if (item.trim()) {
          const li = document.createElement('li');
          li.textContent = item.trim();
          modalHighlights.appendChild(li);
        }
      });

      modalTech.innerHTML = '';
      (btn.dataset.tech || '').split(',').forEach((tech) => {
        if (tech.trim()) {
          const span = document.createElement('span');
          span.className = 'badge';
          span.textContent = tech.trim();
          modalTech.appendChild(span);
        }
      });

      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  closeButtons.forEach((btn) => {
    if (btn) btn.addEventListener('click', closeModal);
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
      closeModal();
    }
  });

  /* ------------------------------------------------------------------------
     7. CONTACT FORM HANDLING (WHATSAPP HANDOFF + VALIDATION)
  ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !subject || !message) {
        formStatus.textContent = 'Please complete all required fields before sending.';
        formStatus.className = 'form-status error';
        return;
      }

      if (!emailRegex.test(email)) {
        formStatus.textContent = 'Please enter a valid email address.';
        formStatus.className = 'form-status error';
        return;
      }

      formStatus.textContent = `Thank you, ${name}! Your message is ready—opening WhatsApp to connect directly with Muhammad Yousaf.`;
      formStatus.className = 'form-status success';

      const composedText = encodeURIComponent(
        `Hello Muhammad Yousaf,\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
      );

      window.open(`https://wa.me/923348719463?text=${composedText}`, '_blank', 'noopener,noreferrer');
      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     8. BACK TO TOP BUTTON
  ------------------------------------------------------------------------ */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
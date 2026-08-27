/* =========================================================
   RECETAS SALUDABLES +300 — script.js
   JavaScript puro. Sin dependencias además de Bootstrap.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------
     0. CONFIGURACIÓN — enlaces de checkout y precios
     Reemplaza estos valores por los definitivos antes de publicar.
  --------------------------------------------------------- */
  const CHECKOUT_LINKS = {
    'plan-completo': 'https://checkout.applyfy.com.br/checkout/cmsxsxk3403p801pqhz0uwjde?offer=9LBRM7C',        // 167 MXN
    'plan-basico': 'https://checkout.applyfy.com.br/checkout/cmsxsxk3403p801pqhz0uwjde?offer=LM8KM2P',            // 99 MXN
    'plan-completo-upsell': 'https://checkout.applyfy.com.br/checkout/cmsxsxk3403p801pqhz0uwjde?offer=W3PVFZT', // 137 MXN
    'garantia-30': 'https://checkout.applyfy.com.br/checkout/cmsxsxk3403p801pqhz0uwjde?offer=W3PVFZT'
  };

  // Precio de la garantía extendida en MXN. Fácil de ajustar aquí.
  const EXTENDED_GUARANTEE_PRICE_MXN = 45;
  const extendPriceEl = document.getElementById('extendPrice');
  if (extendPriceEl) extendPriceEl.textContent = EXTENDED_GUARANTEE_PRICE_MXN + ' MXN';

  document.querySelectorAll('[data-checkout]').forEach(function (el) {
    const key = el.getAttribute('data-checkout');
    if (CHECKOUT_LINKS[key]) el.setAttribute('href', CHECKOUT_LINKS[key]);
  });

  /* ---------------------------------------------------------
     1. AÑO EN EL FOOTER
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     2. CONTADOR REGRESIVO — termina hoy a las 23:59:59
     Si el usuario entra después de medianoche, el contador
     apunta al final del día actual. Nunca "aumenta": cuando
     llega a 00:00:00 simplemente vuelve a apuntar al final
     del nuevo día (promoción diaria real, no un contador falso).
  --------------------------------------------------------- */
  const cdH = document.getElementById('cd-h');
  const cdM = document.getElementById('cd-m');
  const cdS = document.getElementById('cd-s');

  function getEndOfToday() {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  }

  let countdownTarget = getEndOfToday();

  function updateCountdown() {
    const now = new Date();
    let diff = countdownTarget - now;

    if (diff <= 0) {
      // El día terminó: la oferta de hoy se reinicia para el nuevo día.
      countdownTarget = getEndOfToday();
      diff = countdownTarget - now;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (cdH) cdH.textContent = String(hours).padStart(2, '0');
    if (cdM) cdM.textContent = String(minutes).padStart(2, '0');
    if (cdS) cdS.textContent = String(seconds).padStart(2, '0');
  }

  if (cdH && cdM && cdS) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ---------------------------------------------------------
     3. REVEAL ON SCROLL (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     4. MOCKUP — animación ambiental del "Menú semanal"
     Recorre suavemente los días de la semana para sugerir
     un menú que se va completando. Respeta reduced-motion.
  --------------------------------------------------------- */
  const weekDots = document.querySelectorAll('#weekDots span');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (weekDots.length && !prefersReducedMotion) {
    let dayIndex = 0;
    setInterval(function () {
      weekDots.forEach(function (dot) { dot.classList.remove('is-active'); });
      weekDots[dayIndex].classList.add('is-active');
      dayIndex = (dayIndex + 1) % weekDots.length;
    }, 1400);
  } else if (weekDots.length) {
    weekDots[0].classList.add('is-active');
  }

  /* ---------------------------------------------------------
     5. CARRUSEL DE TESTIMONIOS (WhatsApp)
     Scroll horizontal nativo + flechas + indicadores + swipe.
  --------------------------------------------------------- */
  const track = document.getElementById('testiTrack');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  const dotsWrap = document.getElementById('testiDots');

  if (track) {
    const cards = track.querySelectorAll('.testi-card');

    // Construir indicadores
    cards.forEach(function (_, i) {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', function () { scrollToCard(i); });
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('span');

    function cardWidth() {
      return cards[0] ? cards[0].getBoundingClientRect().width + 16 : 0;
    }

    function scrollToCard(index) {
      track.scrollTo({ left: index * cardWidth(), behavior: 'smooth' });
    }

    function currentIndex() {
      return Math.round(track.scrollLeft / cardWidth());
    }

    function updateDots() {
      const idx = Math.min(currentIndex(), dots.length - 1);
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    }

    prevBtn && prevBtn.addEventListener('click', function () {
      scrollToCard(Math.max(currentIndex() - 1, 0));
    });
    nextBtn && nextBtn.addEventListener('click', function () {
      scrollToCard(Math.min(currentIndex() + 1, cards.length - 1));
    });

    let scrollTimeout;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateDots, 80);
    });
  }

  /* ---------------------------------------------------------
     6. BARRA CTA FIJA INFERIOR — ocultar cerca del footer/CTA final
     para no tapar el botón principal de compra.
  --------------------------------------------------------- */
  const mobileCta = document.getElementById('mobileCta');
  const ofertaSection = document.getElementById('oferta');

  if (mobileCta && ofertaSection && 'IntersectionObserver' in window) {
    const ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        mobileCta.style.transform = entry.isIntersecting ? 'translateY(100%)' : 'translateY(0)';
      });
    }, { threshold: 0.2 });
    ctaObserver.observe(ofertaSection);
    mobileCta.style.transition = 'transform .3s ease';
  }

});

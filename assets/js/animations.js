// ============================================================
// ANIMATIONS.JS — Kairós Landing Page
// Responsável por:
// 1. Scroll Reveal — elementos animam ao entrar na viewport
// 2. Count-Up — números contam do zero ao valor real
// 3. Step Ativo — destaca o step conforme o usuário scrolla
// ============================================================


// ── 1. SCROLL REVEAL ─────────────────────────────────────────
// IntersectionObserver é a forma moderna e performática de
// detectar quando um elemento entra na viewport sem usar
// eventos de scroll que travam o thread principal.

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Para de observar após animar — economiza memória
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,   // 12% do elemento visível já dispara
    rootMargin: '0px 0px -40px 0px' // margem negativa = anima um pouco antes
  }
);

// Seleciona todas as classes de reveal e registra no observer
document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
  .forEach((el) => revealObserver.observe(el));


// ── 2. COUNT-UP ───────────────────────────────────────────────
// Anima números de 0 até o valor final quando entram na tela.
// Usa requestAnimationFrame para animação suave e eficiente,
// sem travamentos mesmo em dispositivos mais simples.

function animateCountUp(el) {
  const target   = parseFloat(el.dataset.target) || 0;
  const prefix   = el.dataset.prefix  || '';
  const suffix   = el.dataset.suffix  || '';
  const duration = 1800; // ms
  const start    = performance.now();

  // Easing ease-out: começa rápido e desacelera no final
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const current  = Math.floor(easeOut(progress) * target);

    el.textContent = prefix + current + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Garante que o valor final seja exato
      el.textContent = prefix + target + suffix;
    }
  }

  requestAnimationFrame(step);
}

// Observer separado para os números — dispara o count-up
// apenas uma vez quando o elemento entra na viewport
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCountUp(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-target]')
  .forEach((el) => countObserver.observe(el));


// ── 3. STEP ATIVO ─────────────────────────────────────────────
// Observa cada step da seção "Como funciona" e adiciona a
// classe .active quando ele está na área central da tela.
// A classe .active acende o número do step em verde via CSS.

const stepItems = document.querySelectorAll('.step-item');

if (stepItems.length > 0) {
  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Remove .active de todos e adiciona só no visível
          stepItems.forEach((s) => s.classList.remove('active'));
          entry.target.classList.add('active');
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: '-20% 0px -20% 0px' // zona central da tela
    }
  );

  stepItems.forEach((step) => stepObserver.observe(step));
}


// ── 4. PARTÍCULAS DO HERO ─────────────────────────────────────
// Cria pequenas partículas animadas no fundo do hero usando
// canvas. Leve, sem bibliotecas externas, com cleanup ao
// redimensionar a janela para evitar distorções.

(function initParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas  = document.createElement('canvas');
  const ctx     = canvas.getContext('2d');
  canvas.style.cssText = `
    position:absolute;
    inset:0;
    pointer-events:none;
    z-index:0;
    opacity:0.35;
  `;
  hero.insertBefore(canvas, hero.firstChild);

  let particles = [];
  let animId;

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function createParticle() {
    return {
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      r:      Math.random() * 1.5 + 0.5,
      dx:     (Math.random() - 0.5) * 0.3,
      dy:     (Math.random() - 0.5) * 0.3,
      alpha:  Math.random() * 0.6 + 0.1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 60 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      // Rebote nas bordas
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    animId = requestAnimationFrame(draw);
  }

  // Pausa as partículas quando a aba fica inativa
  // para economizar bateria e CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      init();
      draw();
    }, 200);
  });

  init();
  draw();
})();
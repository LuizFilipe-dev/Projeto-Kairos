// ============================================================
// MAIN.JS — Kairós Landing Page
// Responsável por:
// 1. Nav inteligente — fundo ao scrollar
// 2. Menu mobile — hamburguer + overlay
// 3. FAQ Accordion — abre/fecha com animação
// 4. Scroll suave — âncoras e botão hero
// 5. Typewriter — efeito de digitação no hero
// 6. Highlight de link ativo na nav ao scrollar
// ============================================================


// ── HELPERS ──────────────────────────────────────────────────

// Aguarda o DOM estar pronto antes de executar qualquer coisa
// Evita erros de "elemento não encontrado"
document.addEventListener('DOMContentLoaded', () => {

  // ── 1. NAV INTELIGENTE ─────────────────────────────────────
  // Adiciona classe .scrolled após 20px de scroll para
  // ativar o glassmorphism definido no CSS.
  // Usa requestAnimationFrame para não travar o scroll.

  const nav = document.getElementById('nav');
  let lastScroll = 0;
  let ticking = false;

  function updateNav() {
    const scrollY = window.scrollY;

    if (scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Oculta a nav ao scrollar para baixo rápido
    // e mostra ao scrollar para cima — padrão Apple/Notion
    if (scrollY > lastScroll && scrollY > 300) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }

    lastScroll = scrollY;
    ticking    = false;
  }

  nav.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1), background 0.25s ease, border-color 0.25s ease';

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });


  // ── 2. MENU MOBILE ─────────────────────────────────────────
  // Controla abertura/fechamento do menu fullscreen mobile.
  // Bloqueia o scroll do body quando o menu está aberto
  // para evitar que o conteúdo de fundo role.

  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  let menuOpen    = false;

  function openMenu() {
    menuOpen = true;
    hamburger.classList.add('open');
    navMobile.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    hamburger.classList.remove('open');
    navMobile.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Expõe closeMenu globalmente para uso no onclick do HTML
  window.closeMobileMenu = closeMenu;

  hamburger.addEventListener('click', () => {
    menuOpen ? closeMenu() : openMenu();
  });

  // Fecha ao clicar fora do menu (no overlay)
  navMobile.addEventListener('click', (e) => {
    if (e.target === navMobile) closeMenu();
  });

  // Fecha ao pressionar ESC — acessibilidade
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });


  // ── 3. FAQ ACCORDION ───────────────────────────────────────
  // Accordion acessível com aria-expanded para leitores de tela.
  // Apenas um item pode estar aberto por vez (accordion exclusivo).
  // A animação de altura é feita via max-height no CSS.

  const faqItems    = document.querySelectorAll('.faq-item');
  const faqButtons  = document.querySelectorAll('.faq-question');

  faqButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item      = btn.closest('.faq-item');
      const answer    = item.querySelector('.faq-answer');
      const isOpen    = item.classList.contains('open');

      // Fecha todos os outros itens
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-question')
               .setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer')
               .setAttribute('aria-hidden', 'true');
        }
      });

      // Alterna o item clicado
      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    });
  });


  // ── 4. SCROLL SUAVE ────────────────────────────────────────
  // Intercepta todos os links de âncora (#section) e aplica
  // scroll suave com offset para compensar a nav fixa.
  // Mais confiável que scroll-behavior:smooth do CSS em todos
  // os navegadores, especialmente iOS antigo.

  const NAV_HEIGHT = 76;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href   = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top
                + window.scrollY
                - NAV_HEIGHT;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Botão de scroll do hero
  window.scrollToNext = function () {
    const problema = document.getElementById('problema');
    if (!problema) return;

    const top = problema.getBoundingClientRect().top
              + window.scrollY
              - NAV_HEIGHT;

    window.scrollTo({ top, behavior: 'smooth' });
  };


  // ── 5. TYPEWRITER NO HERO ──────────────────────────────────
  // Anima o texto em destaque do hero como se estivesse sendo
  // digitado. Usa um delay inicial para esperar as animações
  // de entrada do hero terminarem.
  // Só executa uma vez — sem loop para não distrair.

  const heroEm = document.querySelector('.hero-h1 em');

  if (heroEm) {
    const finalText = heroEm.textContent;
    heroEm.textContent = '';
    heroEm.style.borderRight = '2px solid var(--green)';

    let charIndex = 0;

    // Inicia após as animações de entrada (600ms)
    setTimeout(() => {
      const typeInterval = setInterval(() => {
        heroEm.textContent = finalText.slice(0, charIndex + 1);
        charIndex++;

        if (charIndex >= finalText.length) {
          clearInterval(typeInterval);

          // Remove o cursor piscante após a digitação
          setTimeout(() => {
            heroEm.style.borderRight = 'none';
          }, 800);
        }
      }, 55); // velocidade de digitação em ms por caractere
    }, 650);
  }


  // ── 6. LINK ATIVO NA NAV ───────────────────────────────────
  // Destaca o link da nav correspondente à seção visível.
  // Usa IntersectionObserver para performance máxima.

  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');

          navLinks.forEach((link) => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${id}`) {
              link.style.color = 'var(--white)';
            }
          });
        }
      });
    },
    {
      threshold: 0.4,
      rootMargin: '-10% 0px -10% 0px'
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));


  // ── 7. CURSOR PERSONALIZADO (desktop) ─────────────────────
  // Adiciona um pequeno ponto verde que segue o mouse —
  // detalhe premium que empresas como Linear e Framer usam.
  // Só ativa em dispositivos com mouse (não em touch).

  const isTouchDevice = window.matchMedia('(pointer:coarse)').matches;

  if (!isTouchDevice) {
    const cursor = document.createElement('div');
    cursor.id    = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--green);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.15s ease, opacity 0.2s ease;
      opacity: 0;
    `;
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.opacity = '1';
    });

    // Usa lerp (interpolação linear) para movimento suave
    function lerp(a, b, t) { return a + (b - a) * t; }

    function animateCursor() {
      cursorX = lerp(cursorX, mouseX, 0.18);
      cursorY = lerp(cursorY, mouseY, 0.18);
      cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Expande o cursor ao passar em links e botões
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform += ' scale(2.5)';
        cursor.style.opacity = '0.5';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.opacity = '1';
      });
    });

    // Esconde ao sair da janela
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
  }

}); // fim do DOMContentLoaded
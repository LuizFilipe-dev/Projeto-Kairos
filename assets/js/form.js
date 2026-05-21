// ============================================================
// FORM.JS — Kairós Landing Page
// Responsável por:
// 1. Máscara automática do campo WhatsApp
// 2. Validação em tempo real dos campos
// 3. Envio — abre WhatsApp com mensagem pré-preenchida
// 4. Estados do botão — normal, loading, sucesso
// 5. Acessibilidade — foco e mensagens de erro para leitores
// ============================================================


document.addEventListener('DOMContentLoaded', () => {

  const form       = document.getElementById('lead-form');
  const formBtn    = document.getElementById('form-btn');
  const btnText    = document.getElementById('btn-text');
  const btnIcon    = document.getElementById('btn-icon');
  const formContent = document.getElementById('form-content');
  const formSuccess = document.getElementById('form-success');

  if (!form) return;


  // ── 1. MÁSCARA DO WHATSAPP ─────────────────────────────────
  // Formata automaticamente o número enquanto o usuário digita:
  // (00) 00000-0000 para celular
  // Usa apenas os dígitos digitados, sem interferir no cursor.

  const whatsappInput = document.getElementById('whatsapp');

  function maskPhone(value) {
    // Remove tudo que não for dígito
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const len    = digits.length;

    if (len === 0)  return '';
    if (len <= 2)   return `(${digits}`;
    if (len <= 7)   return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (len <= 11)  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;

    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
  }

  whatsappInput.addEventListener('input', (e) => {
    // Salva a posição do cursor antes de reformatar
    const cursor  = e.target.selectionStart;
    const raw     = e.target.value;
    const masked  = maskPhone(raw);

    e.target.value = masked;

    // Restaura cursor aproximado após formatação
    const diff = masked.length - raw.length;
    e.target.setSelectionRange(cursor + diff, cursor + diff);
  });

  // Garante que só números sejam colados
  whatsappInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    whatsappInput.value = maskPhone(pasted);
  });


  // ── 2. VALIDAÇÃO ───────────────────────────────────────────
  // Valida cada campo individualmente ao sair do foco (blur)
  // e todos juntos na submissão.
  // Retorna true se válido, false se inválido.

  function validateName() {
    const nameInput = document.getElementById('name');
    const error     = document.getElementById('name-error');
    const value     = nameInput.value.trim();
    const valid     = value.length >= 2;

    toggleError(nameInput, error, !valid);
    return valid;
  }

  function validateWhatsapp() {
    const input  = document.getElementById('whatsapp');
    const error  = document.getElementById('whatsapp-error');
    // Número válido tem no mínimo 14 chars no formato (00) 00000-0000
    const digits = input.value.replace(/\D/g, '');
    const valid  = digits.length >= 10;

    toggleError(input, error, !valid);
    return valid;
  }

  function validateSegment() {
    const select = document.getElementById('segment');
    const error  = document.getElementById('segment-error');
    const valid  = select.value !== '';

    toggleError(select, error, !valid);
    return valid;
  }

  function validateStage() {
    const select = document.getElementById('stage');
    const error  = document.getElementById('stage-error');
    const valid  = select.value !== '';

    toggleError(select, error, !valid);
    return valid;
  }

  // Helper: adiciona/remove classes de erro no campo e na mensagem
  function toggleError(field, errorEl, hasError) {
    if (hasError) {
      field.classList.add('input-error');
      errorEl.classList.add('show');
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.classList.remove('input-error');
      errorEl.classList.remove('show');
      field.setAttribute('aria-invalid', 'false');
    }
  }

  // Validação em tempo real ao sair de cada campo
  document.getElementById('name')
    .addEventListener('blur', validateName);

  document.getElementById('whatsapp')
    .addEventListener('blur', validateWhatsapp);

  document.getElementById('segment')
    .addEventListener('change', validateSegment);

  document.getElementById('stage')
    .addEventListener('change', validateStage);

  // Remove erro ao começar a digitar novamente
  document.getElementById('name').addEventListener('input', () => {
    if (document.getElementById('name').value.trim().length >= 2) {
      toggleError(
        document.getElementById('name'),
        document.getElementById('name-error'),
        false
      );
    }
  });


  // ── 3. ESTADOS DO BOTÃO ────────────────────────────────────
  // Loading: desabilita o botão e mostra shimmer (via CSS)
  // Sucesso: esconde o form e mostra a mensagem de confirmação

  function setLoading(on) {
    formBtn.disabled = on;

    if (on) {
      btnText.textContent = 'Enviando...';
      btnIcon.style.display = 'none';
      formBtn.classList.add('loading');
    } else {
      btnText.textContent = 'Quero meu diagnóstico gratuito';
      btnIcon.style.display = '';
      formBtn.classList.remove('loading');
    }
  }

  function showSuccess() {
    // Fade out do formulário
    formContent.style.transition = 'opacity 0.3s ease';
    formContent.style.opacity    = '0';

    setTimeout(() => {
      formContent.style.display = 'none';
      formSuccess.classList.add('show');

      // Foca na mensagem de sucesso para leitores de tela
      formSuccess.focus();
    }, 300);
  }


  // ── 4. MONTAGEM DA MENSAGEM WHATSAPP ───────────────────────
  // Monta uma mensagem personalizada com os dados do formulário
  // e abre o WhatsApp com ela pré-preenchida no campo de texto.
  // Substitua o número abaixo pelo número real da Kairós.

  const WHATSAPP_NUMBER = '5500000000000'; // Trocar pelo número real

  const SEGMENT_LABELS = {
    eletronicos: 'Eletrônicos e tecnologia',
    saude:       'Saúde e odontológico',
    alimentacao: 'Alimentação e nutrição',
    servicos:    'Serviços e consultoria',
    construcao:  'Construção e reformas',
    moveis:      'Móveis e escritório',
    logistica:   'Logística e transporte',
    limpeza:     'Limpeza e conservação',
    outros:      'Outros',
  };

  const STAGE_LABELS = {
    nunca:   'Nunca participei de licitações',
    conhece: 'Conheço mas nunca tentei',
    tenta:   'Já participo mas não ganho',
    ganha:   'Já ganho e quero crescer',
  };

  function buildWhatsAppURL(data) {
    const message = [
      `Olá! Vim pelo site da Kairós e gostaria de solicitar meu diagnóstico gratuito.`,
      ``,
      `*Nome:* ${data.name}`,
      `*Segmento:* ${SEGMENT_LABELS[data.segment] || data.segment}`,
      `*Situação atual:* ${STAGE_LABELS[data.stage] || data.stage}`,
      ``,
      `Aguardo o contato da equipe. Obrigado!`,
    ].join('\n');

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }


  // ── 5. SUBMISSÃO DO FORMULÁRIO ─────────────────────────────
  // Valida todos os campos, exibe loading, abre o WhatsApp
  // e mostra o estado de sucesso.
  // O timeout de 800ms simula um processamento e torna
  // a experiência mais fluida — evita a sensação de "clicou e sumiu".

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Valida todos os campos de uma vez
    const isNameValid     = validateName();
    const isPhoneValid    = validateWhatsapp();
    const isSegmentValid  = validateSegment();
    const isStageValid    = validateStage();

    if (!isNameValid || !isPhoneValid || !isSegmentValid || !isStageValid) {
      // Foca no primeiro campo com erro para acessibilidade
      const firstError = form.querySelector('.input-error');
      if (firstError) firstError.focus();
      return;
    }

    // Coleta dados do formulário
    const formData = {
      name:    document.getElementById('name').value.trim(),
      phone:   document.getElementById('whatsapp').value,
      segment: document.getElementById('segment').value,
      stage:   document.getElementById('stage').value,
    };

    setLoading(true);

    // Pequeno delay para o estado de loading ser visível
    setTimeout(() => {
      const url = buildWhatsAppURL(formData);

      // Abre o WhatsApp em nova aba
      window.open(url, '_blank', 'noopener,noreferrer');

      setLoading(false);
      showSuccess();

      // Opcional: redireciona para página de obrigado após 4s
      // Útil para rastrear conversões no Google Analytics
      // setTimeout(() => {
      //   window.location.href = 'obrigado.html';
      // }, 4000);

    }, 800);
  });


  // ── 6. TRACKING BÁSICO DE EVENTOS ─────────────────────────
  // Registra eventos de interação no console para facilitar
  // a integração futura com Google Analytics ou Meta Pixel.
  // Basta descomentar e substituir console.log pela função
  // do seu sistema de analytics.

  // Clique em qualquer CTA
  document.querySelectorAll('.btn-primary, .btn[href="#formulario"]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        // gtag('event', 'cta_click', { event_category: 'engagement' });
        console.log('[Analytics] CTA clicado:', btn.textContent.trim());
      });
    });

  // Início de preenchimento do formulário
  document.getElementById('name').addEventListener('focus', () => {
    // gtag('event', 'form_start', { event_category: 'lead' });
    console.log('[Analytics] Formulário iniciado');
  }, { once: true }); // once: true — dispara apenas na primeira interação

});
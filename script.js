document.addEventListener('DOMContentLoaded', () => {

  /* ===== Ano Dinâmico no Rodapé ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Alteração do Header na Rolagem ===== */
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 60) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ===== Menu Mobile (Hamburguer) ===== */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-active');
      nav.classList.toggle('is-open');
    });
    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('is-active');
        nav.classList.remove('is-open');
      });
    });
  }

  /* ===== Scroll Reveal (Aparecimento Dinâmico) ===== */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ===== Animação dos Números da Seção de Estatísticas ===== */
  const statNumbers = document.querySelectorAll('.stat__number');
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statNumbers.forEach(el => statsObserver.observe(el));

  /* ===== Filtro de Categorias no Portfólio ===== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-cat') === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ===== Modal Lightbox (Ampliação de Fotos do Portfólio) ===== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg) {
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
        lightboxImg.src = img.src;
        lightboxCaption.textContent = title;
        lightbox.classList.add('is-open');
      });
    });

    lightboxClose.addEventListener('click', () => lightbox.classList.remove('is-open'));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('is-open');
    });
  }

  /* ===== Carrossel de Depoimentos ===== */
  const track = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const slides = track ? Array.from(track.children) : [];
  let current = 0;
  let autoTimer;

  if (track && slides.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      if (i === 0) dot.classList.add('is-active');
      dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    function goToSlide(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    function startAuto() {
      autoTimer = setInterval(() => goToSlide(current + 1), 6000);
    }
    function stopAuto() {
      clearInterval(autoTimer);
    }

    startAuto();
    const slider = track.closest('.testi-slider');
    if (slider) {
      slider.addEventListener('mouseenter', stopAuto);
      slider.addEventListener('mouseleave', startAuto);
    }
  }

  /* ===== Botão Voltar ao Topo ===== */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== Validação e Envio do Formulário de Contato ===== */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  const validators = {
    name: (v) => v.trim().length >= 3 ? '' : 'Informe seu nome completo.',
    phone: (v) => /^[\d\s()+-]{8,}$/.test(v.trim()) ? '' : 'Informe um telefone válido.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Informe um e-mail válido.',
    service: (v) => v ? '' : 'Selecione o tipo de obra.',
    message: (v) => v.trim().length >= 10 ? '' : 'Conte um pouco mais sobre o projeto (mín. 10 caracteres).'
  };

  const setFieldError = (input, msg) => {
    const field = input.closest('.field');
    if (!field) return;
    field.classList.toggle('has-error', !!msg);
    field.querySelector('.field__error').textContent = msg;
  };

  if (form) {
    Object.keys(validators).forEach(name => {
      const input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', () => setFieldError(input, validators[name](input.value)));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      Object.keys(validators).forEach(name => {
        const input = form.elements[name];
        if (!input) return;
        const error = validators[name](input.value);
        setFieldError(input, error);
        if (error) valid = false;
      });

      if (valid) {
        const data = {
          name: form.elements['name'].value.trim(),
          phone: form.elements['phone'].value.trim(),
          email: form.elements['email'].value.trim(),
          service: form.elements['service'].options[form.elements['service'].selectedIndex].text,
          message: form.elements['message'].value.trim()
        };

        /* ===== 1) Envio via WhatsApp =====
           Abre o WhatsApp (Web ou App) já com a mensagem preenchida,
           direto no número de contato da R&F. */
        const whatsappNumber = '5511992975834'; // (11) 99297-5834 com código do país
        const whatsappText =
`Olá! Gostaria de solicitar um orçamento pelo site.

*Nome:* ${data.name}
*Telefone:* ${data.phone}
*E-mail:* ${data.email}
*Tipo de obra:* ${data.service}
*Detalhes:* ${data.message}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;
        window.open(whatsappUrl, '_blank');

        successMsg.classList.add('is-visible');
        form.reset();
        setTimeout(() => successMsg.classList.remove('is-visible'), 6000);
      } else {
        successMsg.classList.remove('is-visible');
        const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
      }
    });
  }

});
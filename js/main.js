/* ============================================================
   Móveis S. Jorge — comportamento global
   Módulos: nav · revelação ao scroll · timeline · stepnav
            galerias · formulário · cookies · voltar ao topo
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. NAVEGAÇÃO ---------- */
  function initNav() {
    var nav = $('#main-nav');
    var toggle = $('#nav-toggle');
    var panel = $('#nav-panel');

    if (nav) {
      var onScroll = function () {
        nav.classList.toggle('is-scrolled', window.scrollY > 40);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (!toggle || !panel) return;

    var setOpen = function (open) {
      panel.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.classList.toggle('is-locked', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(!panel.classList.contains('is-open'));
    });
    $$('.nav-panel-link, .nav-panel-cta', panel).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ---------- CANDEEIRO ACENDE AO SCROLL ---------- */
  function initLamp() {
    var scenes = $$('[data-lamp]');
    if (!scenes.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      scenes.forEach(function (el) { el.classList.add('is-lit'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-lit');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.35 });
    scenes.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2. REVELAÇÃO AO SCROLL ---------- */
  function initReveal() {
    var items = $$('.fade-up');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2b. CONTAGEM DOS NÚMEROS ---------- */
  function initCounters() {
    var bars = $$('.stats-bar');
    if (!bars.length) return;

    var run = function (bar) {
      bar.classList.add('is-in');
      $$('.stats-fig', bar).forEach(function (fig, i) {
        var target = parseInt(fig.dataset.count, 10);
        var suffix = fig.dataset.suffix ? '<span class="stats-plus">' + fig.dataset.suffix + '</span>' : '';
        if (isNaN(target)) return;
        if (reduced) { fig.innerHTML = target + suffix; return; }
        var duration = 1600;
        var start = null;
        var delay = i * 140;
        var step = function (now) {
          if (start === null) start = now;
          var t = Math.min(1, (now - start - delay) / duration);
          if (t < 0) { requestAnimationFrame(step); return; }
          var eased = 1 - Math.pow(1 - t, 4);           // easeOutQuart
          var value = Math.round(target * eased);
          fig.innerHTML = value + (t === 1 ? suffix : '');
          if (t < 1) requestAnimationFrame(step);
        };
        fig.innerHTML = '0';
        requestAnimationFrame(step);
      });
    };

    bars.forEach(function (bar) {
      if (!('IntersectionObserver' in window)) { run(bar); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { run(bar); io.disconnect(); }
        });
      }, { threshold: 0.35 });
      io.observe(bar);
    });
  }

  /* ---------- 4. STEPNAV DE SERVIÇOS ---------- */
  function initStepnav() {
    $$('.stepnav').forEach(function (nav) {
      var items = $$('.stepnav-item', nav);
      var img = document.getElementById(nav.dataset.imageTarget || '');
      var bar = document.getElementById(nav.dataset.progressTarget || '');
      if (!items.length) return;

      var activate = function (item) {
        items.forEach(function (i) { i.classList.toggle('active', i === item); });
        var index = items.indexOf(item);
        if (bar) bar.style.width = ((index + 1) / items.length * 100).toFixed(1) + '%';
        if (img) {
          if (item.dataset.imgBg) img.style.backgroundColor = item.dataset.imgBg;
          var ph = $('.ph', img);
          if (ph && item.dataset.imgPh) {
            ph.style.opacity = '0';
            setTimeout(function () {
              ph.innerHTML = item.dataset.imgPh;
              ph.style.opacity = '1';
            }, 180);
          }
          var isDark = /^#[0-3]/.test(item.dataset.imgBg || '');
          if (ph) ph.classList.toggle('ph--onDark', isDark);
        }
      };

      items.forEach(function (item) {
        item.addEventListener('click', function () { activate(item); });
      });
      activate($('.stepnav-item.active', nav) || items[0]);
    });
  }

  /* ---------- 4b. RÉGUAS HORIZONTAIS ---------- */
  function initRails() {
    $$('[data-rail]').forEach(function (root) {
      var track = $('[data-rail-track]', root);
      var fill = $('[data-rail-fill]', root);
      if (!track || !fill) return;

      var update = function () {
        var max = track.scrollWidth - track.clientWidth;
        var ratio = track.clientWidth / track.scrollWidth;
        fill.style.width = Math.max(12, ratio * 100) + '%';
        var travel = (1 / Math.max(ratio, .0001)) - 1;
        var p = max > 0 ? track.scrollLeft / max : 0;
        fill.style.transform = 'translateX(' + (p * travel * 100) + '%)';
      };

      update();
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);

      var down = false, startX = 0, startLeft = 0, moved = false;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        down = true; moved = false;
        startX = e.clientX; startLeft = track.scrollLeft;
        track.classList.add('is-dragging');
      });
      track.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 3) moved = true;
        track.scrollLeft = startLeft - dx;
      });
      var end = function () { down = false; track.classList.remove('is-dragging'); };
      track.addEventListener('pointerup', end);
      track.addEventListener('pointerleave', end);
      track.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); }
      }, true);
    });
  }

  /* ---------- 4c. EQUIPA EM COVERFLOW ---------- */
  function initTeam() {
    $$('[data-tm]').forEach(function (root) {
      var stage = $('[data-tm-stage]', root);
      var cards = $$('[data-tm-card]', root);
      var dotsWrap = $('[data-tm-dots]', root);
      if (!stage || !cards.length) return;

      var i = Math.floor(cards.length / 2);
      var dots = cards.map(function (_, n) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'tm-dot';
        d.setAttribute('aria-label', 'Ver membro ' + (n + 1));
        d.addEventListener('click', function () { go(n); });
        if (dotsWrap) dotsWrap.appendChild(d);
        return d;
      });

      function render() {
        cards.forEach(function (card, n) {
          var d = n - i;
          var ad = Math.abs(d);
          var state = ad === 0 ? 'active' : (ad <= 2 ? 'side' : 'far');
          var x = d * (ad === 1 ? 64 : 56);
          var scale = ad === 0 ? 1 : (ad === 1 ? 0.78 : 0.56);
          var op = ad === 0 ? 1 : (ad === 1 ? 0.62 : 0.3);
          card.dataset.state = state;
          card.style.transform = 'translate(calc(-50% + ' + x + '%), -50%) scale(' + scale + ')';
          card.style.opacity = ad > 2 ? 0 : op;
          card.style.zIndex = String(20 - ad);
          card.style.boxShadow = ad === 0 ? '0 26px 60px -28px rgba(28,22,14,.42)' : 'none';
          card.setAttribute('aria-hidden', ad > 2 ? 'true' : 'false');
        });
        dots.forEach(function (d, n) { d.setAttribute('aria-current', n === i ? 'true' : 'false'); });
      }

      function go(n) {
        i = Math.max(0, Math.min(cards.length - 1, n));
        render();
      }

      cards.forEach(function (card, n) {
        card.addEventListener('click', function () { if (n !== i && !dragged) go(n); });
      });
      var prev = $('[data-tm-prev]', root), next = $('[data-tm-next]', root);
      if (prev) prev.addEventListener('click', function () { go(i - 1); });
      if (next) next.addEventListener('click', function () { go(i + 1); });

      stage.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
      });

      var down = false, startX = 0, dragged = false;
      stage.addEventListener('pointerdown', function (e) {
        down = true; dragged = false; startX = e.clientX;
        stage.classList.add('is-dragging');
      });
      stage.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 44) {
          dragged = true; down = false;
          stage.classList.remove('is-dragging');
          go(i + (dx < 0 ? 1 : -1));
        }
      });
      var end = function () { down = false; stage.classList.remove('is-dragging'); };
      stage.addEventListener('pointerup', end);
      stage.addEventListener('pointerleave', end);

      render();
    });
  }

  /* ---------- 5. GALERIAS DE PROJETO ---------- */
  function initGalleries() {
    var galleries = $$('.gallery');
    if (!galleries.length) return;
    var active = null;

    var close = function () {
      if (!active) return;
      active.classList.remove('is-open');
      active = null;
      document.body.classList.remove('is-locked');
    };

    galleries.forEach(function (gal) {
      var slides = $$('.gallery-slide', gal);
      var count = $('.gallery-count', gal);
      var i = 0;

      var show = function (n) {
        if (!slides.length) return;
        i = (n + slides.length) % slides.length;
        slides.forEach(function (s, k) { s.style.display = k === i ? '' : 'none'; });
        if (count) count.textContent = (i + 1) + ' / ' + slides.length;
      };

      gal.__show = show;
      show(0);

      var prev = $('.gallery-prev', gal);
      var next = $('.gallery-next', gal);
      if (prev) prev.addEventListener('click', function () { show(i - 1); });
      if (next) next.addEventListener('click', function () { show(i + 1); });
      if (slides.length < 2) {
        if (prev) prev.style.display = 'none';
        if (next) next.style.display = 'none';
      }
      $$('.gallery-close', gal).forEach(function (b) { b.addEventListener('click', close); });
      gal.addEventListener('click', function (e) { if (e.target === gal) close(); });
    });

    $$('[data-gallery]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var gal = document.getElementById(trigger.dataset.gallery);
        if (!gal) return;
        close();
        gal.classList.add('is-open');
        active = gal;
        document.body.classList.add('is-locked');
        if (gal.__show) gal.__show(0);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!active) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { var n = $('.gallery-next', active); if (n) n.click(); }
      if (e.key === 'ArrowLeft') { var p = $('.gallery-prev', active); if (p) p.click(); }
    });
  }

  /* ---------- 6. FORMULÁRIO EM PASSOS ---------- */
  function initForm() {
    var form = $('#contact-form');
    if (!form) return;

    var steps = $$('.form-step', form);
    var segs = $$('.form-progress-seg');
    var done = $('#form-done');
    var current = 0;
    var data = { tipo: '' };

    var render = function () {
      steps.forEach(function (s, i) { s.classList.toggle('active', i === current); });
      segs.forEach(function (s, i) { s.classList.toggle('active', i <= current); });
    };

    var setSummary = function () {
      var map = { 'sum-tipo': data.tipo, 'sum-nome': $('#nome').value, 'sum-email': $('#email').value };
      Object.keys(map).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = map[id] ? map[id] : 'Por indicar';
      });
    };

    var markField = function (input, ok) {
      var field = input.closest('.field');
      if (field) field.classList.toggle('invalid', !ok);
      return ok;
    };

    var validate = function (index) {
      var step = steps[index];
      var ok = true;
      if (step.dataset.step === 'tipo' && !data.tipo) {
        var first = $('.opt', step);
        if (first) first.focus();
        ok = false;
      }
      $$('input[required], textarea[required]', step).forEach(function (input) {
        var value = input.value.trim();
        var valid = input.type === 'email'
          ? /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)
          : value.length > 1;
        if (!markField(input, valid)) ok = false;
      });
      return ok;
    };

    $$('.opt', form).forEach(function (opt) {
      opt.addEventListener('click', function () {
        $$('.opt[data-field="' + opt.dataset.field + '"]', form)
          .forEach(function (o) { o.classList.toggle('selected', o === opt); });
        data[opt.dataset.field] = opt.dataset.value;
      });
    });

    $$('[data-next]', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!validate(current)) return;
        current = Math.min(current + 1, steps.length - 1);
        setSummary();
        render();
      });
    });

    $$('[data-back]', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        current = Math.max(current - 1, 0);
        render();
      });
    });

    $$('input, textarea', form).forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('invalid');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(current)) return;
      steps.forEach(function (s) { s.classList.remove('active'); });
      var prog = $('.form-progress');
      if (prog) prog.style.display = 'none';
      if (done) done.classList.add('show');
    });

    render();
  }

  /* ---------- 7. COOKIES ---------- */
  function initCookies() {
    var banner = $('#cookie-banner');
    if (!banner) return;
    var KEY = 'msj-cookie-consent';
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (err) { stored = null; }

    if (!stored) setTimeout(function () { banner.classList.add('is-open'); }, 900);

    var decide = function (value) {
      try { localStorage.setItem(KEY, value); } catch (err) { /* ignora */ }
      banner.classList.remove('is-open');
    };

    var accept = $('#cookie-accept');
    var reject = $('#cookie-reject');
    var manage = $('#cookie-manage');
    if (accept) accept.addEventListener('click', function () { decide('accepted'); });
    if (reject) reject.addEventListener('click', function () { decide('rejected'); });
    if (manage) manage.addEventListener('click', function () {
      window.location.href = 'politica-de-cookies.html#gestao';
    });
  }

  /* ---------- 8. VOLTAR AO TOPO ---------- */
  function initScrollTop() {
    $$('[data-scroll-top]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      });
    });
  }

  function boot() {
    initNav();
    initReveal();
    initLamp();
    initCounters();
    initStepnav();
    initRails();
    initTeam();
    initGalleries();
    initForm();
    initCookies();
    initScrollTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

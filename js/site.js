(function () {
  'use strict';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cortina: nunca segura o conteúdo além de 4 s (aqui, no máximo 2,4 s) */
  var cortina = document.getElementById('cortina');
  if (cortina) {
    var fechada = false;
    var fechar = function () { if (fechada) return; fechada = true; cortina.classList.add('fim'); };
    if (reduz) fechar();
    else {
      var t0 = Date.now();
      window.addEventListener('load', function () { setTimeout(fechar, Math.max(0, 900 - (Date.now() - t0))); });
      setTimeout(fechar, 2400);
    }
  }

  /* Hero: vídeo começa e reinicia em 3,5 s */
  var INICIO = 3.5;
  var v = document.getElementById('heroVideo');
  if (v) {
    if (reduz) {
      v.pause(); v.removeAttribute('autoplay'); v.innerHTML = ''; v.load();
    } else {
      v.muted = true;
      v.removeAttribute('loop');
      var salta = function () { try { v.currentTime = INICIO; } catch (e) {} };
      v.addEventListener('loadedmetadata', salta);
      v.addEventListener('timeupdate', function () {
        if (v.currentTime < INICIO - 0.05 || (v.duration && v.duration - v.currentTime < 0.12)) salta();
      });
      v.addEventListener('ended', function () { salta(); v.play().catch(function () {}); });
      if (v.readyState >= 1) salta();
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
  }

  /* Entradas por rolagem */
  var revs = [].slice.call(document.querySelectorAll('.rev'));
  if (!reduz && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('rev-on');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revs.forEach(function (e) { io.observe(e); });
  }

  /* Cabeçalho muda de cor conforme a seção sob ele */
  var cab = document.getElementById('cab');
  var temas = [].slice.call(document.querySelectorAll('[data-tema]')).filter(function (e) { return e !== cab; });
  var atualizaCab = function () {
    var y = (cab ? cab.offsetHeight : 0) / 2;
    for (var i = 0; i < temas.length; i++) {
      var r = temas[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { cab.setAttribute('data-tema', temas[i].getAttribute('data-tema')); break; }
    }
  };
  window.addEventListener('scroll', atualizaCab, { passive: true });
  window.addEventListener('resize', atualizaCab);
  atualizaCab();

  /* Sobre: fotos alternam em dissolução */
  var mold = document.getElementById('moldura');
  if (mold && !reduz) {
    var fotos = [].slice.call(mold.querySelectorAll('img'));
    if (fotos.length > 1) {
      var k = 0;
      setInterval(function () {
        fotos[k].classList.remove('on');
        k = (k + 1) % fotos.length;
        fotos[k].classList.add('on');
      }, 3500);
    }
  }

  /* Portfólio: lightbox sobre a lista atual (cresce com o HTML) */
  var lb = document.getElementById('lb');
  var grade = document.getElementById('grade');
  if (lb && grade && typeof lb.showModal === 'function') {
    var idx = 0, ultimo = null;
    var itens = function () { return [].slice.call(grade.querySelectorAll('.cartao')); };
    var mostra = function (i) {
      var l = itens(); if (!l.length) return;
      idx = (i + l.length) % l.length;
      var im = l[idx].querySelector('img'), lg = l[idx].querySelector('.cartao__leg');
      var alvo = document.getElementById('lbImg');
      alvo.src = im.getAttribute('src'); alvo.alt = im.getAttribute('alt') || '';
      alvo.width = im.getAttribute('width'); alvo.height = im.getAttribute('height');
      document.getElementById('lbLeg').textContent = lg ? lg.textContent : '';
    };
    grade.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lb]'); if (!b) return;
      ultimo = b; mostra(itens().indexOf(b.closest('.cartao'))); lb.showModal();
    });
    document.getElementById('lbFechar').addEventListener('click', function () { lb.close(); });
    document.getElementById('lbAnt').addEventListener('click', function () { mostra(idx - 1); });
    document.getElementById('lbProx').addEventListener('click', function () { mostra(idx + 1); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') mostra(idx - 1);
      if (e.key === 'ArrowRight') mostra(idx + 1);
    });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { if (ultimo) ultimo.focus(); });
  }

  /* Vídeos: controles nativos, com som, sem autoplay; o botão só dá o play inicial e some */
  [].forEach.call(document.querySelectorAll('[data-play]'), function (btn) {
    var quadro = btn.parentNode, vid = quadro.querySelector('video');
    btn.addEventListener('click', function () { vid.play().catch(function () {}); vid.focus(); });
    vid.addEventListener('play', function () { quadro.classList.add('tocando'); });
  });
  var todos = [].slice.call(document.querySelectorAll('[data-vid]'));
  todos.forEach(function (a) {
    a.addEventListener('play', function () { todos.forEach(function (b) { if (b !== a) b.pause(); }); });
  });
})();

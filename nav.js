/* 상단 바 — huts.com(바) + ballance(하위 메뉴) 참고.
   · 첫 화면 사진 위에서는 투명, 조금 내리면 어둑한 면이 깔린다
   · 메뉴 다섯 어느 것을 올려도 같은 하위 메뉴 판(기준·방·틈 세 단)이 내려오고,
     그 메뉴의 단이 또렷해진다(단이 없는 공간·조건은 세 단 모두). 메뉴를 누르면 그 섹션으로 부드럽게 간다
   · 하위 항목을 누르면 그 자리로 부드럽게 내려가 그 칸을 연다
   · 페이지 안 다른 링크(로고·끝줄·모바일 목록)도 같은 부드러운 이동을 쓴다
   · 아래로 스크롤하면 바가 숨고, 위로 올리면 돌아온다 */
(function () {
  var hn = document.getElementById('hn');
  if (!hn) return;
  var has = [].slice.call(hn.querySelectorAll('.hn-has'));
  var panel = document.getElementById('hn-p');
  var cols = [].slice.call(panel.querySelectorAll('.hn-col'));
  var burger = hn.querySelector('.hn-burger'), mpanel = document.getElementById('hn-m');
  var hoverable = window.matchMedia('(hover: hover)').matches;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var closeT, cur = -1;

  /* ── 부드러운 이동: 천천히 출발해 천천히 멈춘다. 거리에 따라 .7~1.4초. 상단 바 높이만큼 위를 비운다 ── */
  var anim = null;
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smoothTo(el) {
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - (el.id === 'top' ? 0 : 84);
    top = Math.max(0, Math.min(top, document.documentElement.scrollHeight - innerHeight));
    if (reduce) { window.scrollTo(0, top); return; }
    var from = window.scrollY, dist = top - from, dur = Math.min(1400, Math.max(700, Math.abs(dist) * .35)), t0 = null;
    cancelAnimationFrame(anim);
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      window.scrollTo(0, from + dist * ease(p));
      if (p < 1) anim = requestAnimationFrame(step);
    }
    anim = requestAnimationFrame(step);
  }
  /* 사용자가 휠·터치로 움직이면 이동을 멈춘다(스크롤을 가로채지 않는다) */
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, function () { cancelAnimationFrame(anim); }, { passive: true }); });

  /* ── 하위 메뉴 판 ── */
  var veil = document.createElement('div'); veil.className = 'hn-veil'; veil.setAttribute('aria-hidden', 'true');
  hn.parentNode.insertBefore(veil, hn);
  veil.addEventListener('click', function () { open(-1); });

  /* c = -1 이면(공간·조건) 세 단 모두 또렷하게 */
  function focusCol(c) { cols.forEach(function (el, k) { el.classList.toggle('is-focus', c < 0 || k === c); }); }
  function open(i) {
    clearTimeout(closeT);
    cur = i;
    has.forEach(function (b, k) { b.setAttribute('aria-expanded', k === i ? 'true' : 'false'); });
    panel.hidden = i < 0;
    if (i > -1) focusCol(+has[i].getAttribute('data-col'));
    hn.classList.toggle('is-open', i > -1);
    veil.classList.toggle('is-on', i > -1);
  }
  function closeSoon() { clearTimeout(closeT); closeT = setTimeout(function () { open(-1); }, 200); }

  has.forEach(function (b, i) {
    /* 마우스가 있으면 올린 순간 이미 열려 있으므로 누름은 '열기'만, 터치는 '열기/닫기' */
    b.addEventListener('click', function () {
      /* 메뉴를 누르면 판을 닫고 그 섹션으로 부드럽게 */
      if (b.hasAttribute('data-go')) { open(-1); smoothTo(document.querySelector(b.getAttribute('data-go'))); return; }
      open(!hoverable && cur === i ? -1 : i);
    });
    if (hoverable) b.addEventListener('mouseenter', function () { open(i); });
  });
  if (hoverable) {
    hn.addEventListener('mouseleave', closeSoon);
    hn.addEventListener('mouseenter', function () { clearTimeout(closeT); });
    hn.querySelector('.hn-logo').addEventListener('mouseenter', function () { open(-1); });
    cols.forEach(function (c, k) { c.addEventListener('mouseenter', function () { focusCol(k); }); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { open(-1); setMobile(false); } });
  document.addEventListener('click', function (e) { if (!hn.contains(e.target) && e.target !== veil) setMobile(false); });

  /* 하위 항목 → 칸을 열고 그 자리로 부드럽게 */
  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (a.hasAttribute('data-open')) {
        var g = document.querySelector(a.getAttribute('data-open'));
        if (g && g._setOpen) g._setOpen(+a.getAttribute('data-i'));
      }
      if (a.hasAttribute('data-tab')) {
        var t = document.querySelectorAll('.mo-detail .mo-tabs .mo-tab')[+a.getAttribute('data-tab')];
        if (t) t.click();
      }
      open(-1);
      var target = document.querySelector(a.getAttribute('data-go') || a.getAttribute('href'));
      requestAnimationFrame(function () { smoothTo(target); });   /* 칸이 열린 뒤 높이로 위치를 잰다 */
      history.replaceState(null, '', a.getAttribute('href'));
    });
  });

  /* 페이지 안 다른 링크도 부드럽게(로고 · 끝줄 · 모바일 목록 등) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (panel.contains(a) || a.getAttribute('href').length < 2) return;
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault(); smoothTo(target); history.replaceState(null, '', a.getAttribute('href'));
    });
  });

  /* 모바일 메뉴 */
  function setMobile(on) {
    if (!burger) return;
    burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    burger.textContent = on ? '닫기' : '메뉴';
    mpanel.hidden = !on;
    hn.classList.toggle('is-mopen', on);
  }
  burger.addEventListener('click', function () { setMobile(burger.getAttribute('aria-expanded') !== 'true'); });
  mpanel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMobile(false); }); });

  /* 스크롤: 면 깔기 · 내리면 숨고 올리면 돌아오기 */
  var last = window.scrollY;
  function onScroll() {
    var y = window.scrollY, busy = hn.classList.contains('is-open') || hn.classList.contains('is-mopen');
    hn.classList.toggle('is-solid', y > 80);
    hn.classList.toggle('is-hidden', !busy && y > 400 && y > last + 2);
    if (y < last - 2 || y <= 400) hn.classList.remove('is-hidden');
    last = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* 모듈형 · sig.js v1.0 — 무의존 classic script (file:// 더블클릭으로도 동작). </body> 바로 앞에서 읽는다.
   레퍼런스 TEKT 의 동작을 옮긴다. 타이밍 출처는 EXTRACTION.md §1.
   1) my-style.css 의 --my-* 를 읽어 <html> 클래스와 색(--mo-*)을 만든다
   2) 대표 제목 크기를 폰트 로드 후 실제 폭을 재서 맞춘다(긴 제목 잘림 0, 가장 큰 글자 유지)
   3) 모듈 목록: 한 번에 하나만 열린다(처음엔 첫 모듈). 열린 모듈은 제목이 커지고 본문이 펼쳐진다
   4) 과정 단계: 열린 단계만 사진이 켜진다(모바일은 사진이 글 아래로 들어간다)
   5) 시리즈: 누른 모듈의 사진으로 화면 높이 배경이 바뀐다(.65초 겹침 전환)
   6) 세부: 장면 탭 + 사진 위 + 점 → 설명 카드
   7) 상단 바(사진 위 옅은 선 → 200px 아래 채움 → 800px 아래로 내리면 숨김) · 떠 있는 버튼 · 연락 칸 펼침
   스크롤을 가로채지 않는다. 스크롤 위치는 읽기만 한다. */
(function () {
  var R = document.documentElement, D = document;
  var CS = getComputedStyle(R);
  function my(k, d) { var v = CS.getPropertyValue(k).trim().replace(/["']/g, ''); return v || d; }
  function pick(v, list, d) { return list.indexOf(v) > -1 ? v : d; }
  function $(s, c) { return (c || D).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || D).querySelectorAll(s)); }
  var TYPE = pick(my('--my-type', 'sans'), ['sans', 'serif', 'mono', 'hand'], 'sans');
  var MOTION = +pick(my('--my-motion', '1'), ['0', '1', '2'], '1');
  var DENS = +pick(my('--my-density', '1'), ['0', '1', '2'], '1');
  var IMG = pick(my('--my-image', 'native'), ['native', 'original', 'mono', 'tint'], 'native');
  var CORNER = pick(my('--mo-mark', '6').replace('px', ''), ['0', '6', '10'], '6');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) MOTION = 0;
  R.classList.add('js', 't-' + TYPE, 'm' + MOTION, 'd' + DENS, 'i-' + IMG, 'mo-corner-' + CORNER);
  var REPORT = [];

  /* ── 1. 색: --my-bg · --my-point → 종이 · 먹 · 포인트 · 옅은 선 · 짙은 면 ── */
  var cvs = D.createElement('canvas').getContext('2d');
  function rgb(s) {
    if (!s || s === 'none') return null;
    cvs.fillStyle = '#010203'; cvs.fillStyle = s;
    var f = cvs.fillStyle;
    if (f === '#010203' && s.toLowerCase() !== '#010203') return null;
    if (f[0] === '#') return [parseInt(f.substr(1, 2), 16), parseInt(f.substr(3, 2), 16), parseInt(f.substr(5, 2), 16)];
    var m = f.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2]] : null;
  }
  function mix(a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }); }
  function lum(c) { return c.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce(function (s, v, i) { return s + v * [.2126, .7152, .0722][i]; }, 0); }
  function con(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function css(c) { return 'rgb(' + c.join(',') + ')'; }
  function best(on, list) { for (var i = 0; i < list.length; i++) if (con(on, list[i]) >= 4.5) return list[i]; return con(on, [0, 0, 0]) > con(on, [255, 255, 255]) ? [0, 0, 0] : [255, 255, 255]; }
  var WHITE = [255, 255, 255], BLACK = [0, 0, 0];
  var REF_INK = rgb(my('--mo-ref-ink', '#2D2012')) || [45, 32, 18];
  var BG = rgb(my('--my-bg', '#ECF1F4')) || rgb(my('--mo-ref-paper', '#ECF1F4'));
  var PT = rgb(my('--my-point', 'none'));
  var lightBG = lum(BG) > .4;
  var INK = lightBG ? REF_INK : mix(BG, WHITE, .9);
  if (con(INK, BG) < 4.5) { INK = best(BG, [INK, lightBG ? BLACK : WHITE]); REPORT.push('대비 보정: 글자색을 바탕에 맞춰 더 진하게/밝게 바꿈(바탕은 그대로)'); }
  var POINT = PT || mix(BG, INK, .15);
  var STEEL = mix(BG, POINT, .6);
  if (con(INK, STEEL) < 4.5) { STEEL = mix(BG, POINT, .35); if (con(INK, STEEL) < 4.5) REPORT.push('대비 부족: 연락 면(포인트 60%) 위 글자 대비가 4.5:1 미만'); else REPORT.push('대비 보정: 연락 면을 포인트 35%로 옅게'); }
  var PLANE = lightBG ? mix(INK, BG, .22) : mix(BG, WHITE, .1);
  var PALE = PT && lum(PT) > .45 ? PT : (lightBG ? BG : mix(BG, WHITE, .85));
  if (con(PALE, PLANE) < 4.5) PALE = best(PLANE, [mix(PALE, WHITE, .5), WHITE]);
  var ONP = best(POINT, [INK, BG, BLACK, WHITE]);
  var S = R.style;
  S.setProperty('--mo-paper', css(BG)); S.setProperty('--mo-ink', css(INK)); S.setProperty('--mo-point', css(POINT));
  S.setProperty('--mo-on-point', css(ONP)); S.setProperty('--mo-steel', css(STEEL)); S.setProperty('--mo-card', css(mix(BG, POINT, .85)));
  S.setProperty('--mo-plane', css(PLANE)); S.setProperty('--mo-pale', css(PALE));
  if (!PT) REPORT.push('포인트 없음: 떠 있는 버튼·+ 점·연락 면은 바탕과 먹 사이 옅은 회색으로');

  function ready(fn) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    var MQ = window.matchMedia('(max-width: 768px)');
    function mobile() { return MQ.matches; }

    /* 사진 로드 페이드 (.25s) */
    $$('main img').forEach(function (im) {
      im.classList.add('mo-ld');
      function on() { im.classList.add('is-ld'); }
      if (im.complete && im.naturalWidth) on(); else { im.addEventListener('load', on); im.addEventListener('error', on); }
    });

    /* ── 2. 대표 제목 측정 맞춤 ── */
    var h1 = $('.mo-h1');
    function fitTitle() {
      if (!h1) return;
      h1.style.removeProperty('--mo-h1-fit');
      var cs = getComputedStyle(h1), base = parseFloat(cs.fontSize), box = h1.parentElement;
      var pcs = getComputedStyle(box), W = box.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
      var h2 = $('.mo-h2'), floor = Math.max(h2 ? parseFloat(getComputedStyle(h2).fontSize) * 1.15 : 24, 24);
      var probe = D.createElement('span'); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs.font + ';letter-spacing:' + cs.letterSpacing;
      D.body.appendChild(probe);
      var widest = 0; h1.textContent.split(/\s+/).forEach(function (w) { probe.textContent = w; widest = Math.max(widest, probe.getBoundingClientRect().width); });
      D.body.removeChild(probe);
      var size = base;
      if (widest > W) size = Math.max(floor, base * W / widest * .98);
      var maxLines = mobile() ? 5 : 3;
      h1.style.setProperty('--mo-h1-fit', size + 'px');
      var guard = 0;
      while (h1.getBoundingClientRect().height / (size * parseFloat(cs.lineHeight) / base) > maxLines + .3 && size > floor && guard++ < 30) {
        size = Math.max(floor, size - 1); h1.style.setProperty('--mo-h1-fit', size + 'px');
      }
      h1.dataset.fit = Math.round(size * 10) / 10;
    }
    fitTitle();
    if (D.fonts) { D.fonts.ready.then(fitTitle); D.fonts.addEventListener && D.fonts.addEventListener('loadingdone', fitTitle); }
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(fitTitle, 120); });

    /* ── 3. 모듈 목록 ── */
    $$('.mo-steps').forEach(function (list) {                     /* 단계 번호 01~ (고정 라벨) — 과정 섹션이 여럿이면 섹션마다 01부터 */
      $$('.mo-step', list).forEach(function (m, i) {
        var b = $('.mo-mod-btn', m), n = D.createElement('span'); n.className = 'mo-num'; n.textContent = (i < 9 ? '0' : '') + (i + 1) + ' ';
        b.insertBefore(n, b.firstChild);
      });
    });
    function setOpen(group, idx) {
      $$(':scope > .mo-mod', group).forEach(function (m, i) {
        var on = i === idx; m.classList.toggle('is-open', on);
        var b = $('.mo-mod-btn', m); if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      if (group._onChange) group._onChange(idx);
    }
    $$('.mo-mods').forEach(function (g) {
      var mode = g.getAttribute('data-mo') || 'one';
      var mods = $$(':scope > .mo-mod', g);
      mods.forEach(function (m, i) {
        var b = $('.mo-mod-btn', m); if (!b) return;
        b.addEventListener('click', function () {
          var open = m.classList.contains('is-open');
          setOpen(g, mode === 'always' ? i : (open ? -1 : i));
        });
      });
      g._setOpen = function (i) { setOpen(g, i); };
    });

    /* ── 4. 과정 단계: 모바일이면 사진을 글 아래로 ── */
    function placeSteps() {
      $$('.mo-step').forEach(function (m) {
        var f = $('.mo-step-fig', m); if (!f) return;
        var inn = $('.mo-mod-in', m);
        if (mobile()) { if (f.parentNode !== inn) inn.appendChild(f); }
        else if (f.parentNode !== m) m.appendChild(f);
      });
      /* 단계 사진 그리드는 늘 단계 맨 아래(전폭)로 — 글 칸 안에 써 두어도 옮긴다 */
      $$('.mo-step').forEach(function (m) { var th = $('.mo-thumbs', m); if (th) m.appendChild(th); });
    }
    /* 사진 그리드가 있는 단계는 대표 사진도 그리드 첫 칸으로 넣는다 — 묶음 사진이 한 격자로 고르게 놓인다 */
    $$('.mo-step').forEach(function (m) {
      var th = $('.mo-thumbs', m), f = $(':scope > .mo-step-fig', m) || $('.mo-step-fig', m);
      if (th && f) { var im = $('img', f); if (im) th.insertBefore(im, th.firstChild); f.parentNode.removeChild(f); }
    });
    placeSteps(); MQ.addEventListener ? MQ.addEventListener('change', placeSteps) : MQ.addListener(placeSteps);

    /* ── 5. 시리즈: 모듈 안 사진을 무대 배경으로 올린다 ── */
    $$('.mo-stage').forEach(function (st) {
      var g = $('.mo-mods', st), figs = D.createElement('div'); figs.className = 'mo-stage-figs'; st.insertBefore(figs, st.firstChild);
      var layers = $$(':scope > .mo-mod', g).map(function (m) {
        var f = $(':scope > .mo-bg', m);
        if (f) { figs.appendChild(f); return f; }
        var p = D.createElement('div'); p.className = 'mo-plane-on'; figs.appendChild(p); return p;
      });
      if (!$('.mo-bg', figs)) figs.classList.add('is-plain');
      g._onChange = function (i) { layers.forEach(function (l, k) { l.classList.toggle('is-on', k === i); }); };
    });

    /* 모든 목록: 처음엔 첫 모듈이 열려 있다 (원본 useState(0)) */
    $$('.mo-mods').forEach(function (g) { g._setOpen(0); });

    /* ── 6. 세부: 장면 탭 + 점 + 카드 ── */
    $$('.mo-detail').forEach(function (dt) {
      var scenes = $$(':scope > .mo-scene', dt); if (!scenes.length) return;
      var board = D.createElement('div'); board.className = 'mo-board';
      dt.insertBefore(board, scenes[0]);
      scenes.forEach(function (s) { board.appendChild(s); });
      var tabs = D.createElement('div'); tabs.className = 'mo-tabs';
      var tabsM = D.createElement('div'); tabsM.className = 'mo-tabs mo-tabs-m';
      board.appendChild(tabs); dt.appendChild(tabsM);
      var veil = D.createElement('div'); veil.className = 'mo-veil'; D.body.appendChild(veil);
      var openCard = null;
      function closeCard() { if (!openCard) return; openCard.card.classList.remove('is-on'); openCard.dot.classList.remove('is-on'); openCard.dot.setAttribute('aria-expanded', 'false'); veil.classList.remove('is-on'); openCard = null; }
      function place(dot, card) {
        if (mobile()) { card.style.removeProperty('--card-x'); card.style.removeProperty('--card-y'); return; }
        var bw = board.clientWidth, bh = board.clientHeight, dr = dot.getBoundingClientRect(), br = board.getBoundingClientRect();
        var cx = dr.left - br.left + dr.width / 2, cy = dr.top - br.top + dr.height / 2, cw = card.offsetWidth, ch = card.offsetHeight;
        var x = cx + 25; if (x + cw > bw - 10) x = cx - 25 - cw; x = Math.max(10, Math.min(x, bw - cw - 10));
        var y = cy - 15; y = Math.max(10, Math.min(y, bh - ch - 10));
        card.style.setProperty('--card-x', x + 'px'); card.style.setProperty('--card-y', y + 'px');
      }
      scenes.forEach(function (s, si) {
        $$(':scope > .mo-spot', s).forEach(function (sp, k) {
          var st = sp.getAttribute('style') || '';
          var dot = D.createElement('button'); dot.type = 'button'; dot.className = 'mo-dot'; dot.setAttribute('style', st);
          var ttl = $('h4', sp); dot.setAttribute('aria-label', (ttl ? ttl.textContent : '세부') + ' 열기'); dot.setAttribute('aria-expanded', 'false');
          var card = D.createElement('div'); card.className = 'mo-card';
          var x = D.createElement('button'); x.type = 'button'; x.className = 'mo-card-x'; x.setAttribute('aria-label', '닫기');
          card.appendChild(x);
          while (sp.firstChild) card.appendChild(sp.firstChild);
          s.appendChild(dot); s.appendChild(card); sp.parentNode.removeChild(sp);
          dot.addEventListener('click', function (e) {
            e.stopPropagation();
            if (openCard && openCard.card === card) { closeCard(); return; }
            closeCard(); card.classList.add('is-on'); dot.classList.add('is-on'); dot.setAttribute('aria-expanded', 'true');
            place(dot, card); openCard = { card: card, dot: dot }; if (mobile()) veil.classList.add('is-on');
          });
          x.addEventListener('click', function (e) { e.stopPropagation(); closeCard(); });
          card.addEventListener('click', function (e) { e.stopPropagation(); });
        });
        var t = $(':scope > .mo-scene-t', s), label = t ? t.textContent : '장면 ' + (si + 1);
        [tabs, tabsM].forEach(function (row) {
          var b = D.createElement('button'); b.type = 'button'; b.className = 'mo-tab'; b.textContent = label;
          var pad = D.createElement('span'); pad.className = 'mo-tab-pad'; b.appendChild(pad);
          b.addEventListener('click', function () { show(si); });
          row.appendChild(b);
        });
      });
      veil.addEventListener('click', closeCard);
      D.addEventListener('click', function (e) { if (openCard && !board.contains(e.target)) closeCard(); });
      D.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCard(); });
      function show(i) {
        closeCard();
        scenes.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
        [tabs, tabsM].forEach(function (row) { $$('.mo-tab', row).forEach(function (b, k) { b.classList.toggle('is-on', k === i); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); }); });
        board.classList.toggle('mo-board-plain', !$('.mo-scene-fig', scenes[i]));
      }
      show(0);
      if (scenes.length < 2) { tabs.style.display = 'none'; tabsM.style.display = 'none'; }
    });

    /* ── 7a. 연락 칸: ▾ 칸은 누르면 다른 값이 펼쳐진다(보여 주기만, 제출 없음) ── */
    var picks = $$('.mo-pick');
    picks.forEach(function (c) {
      var ul = $('.mo-opts', c); if (!ul) return;
      var wrap = D.createElement('div'); wrap.className = 'mo-opts'; ul.className = 'mo-opts-in'; ul.parentNode.insertBefore(wrap, ul); wrap.appendChild(ul);
      var tri = D.createElement('span'); tri.className = 'mo-tri'; tri.setAttribute('aria-hidden', 'true'); c.appendChild(tri);
      c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); c.setAttribute('aria-expanded', 'false');
      function toggle(force) {
        var on = typeof force === 'boolean' ? force : !c.classList.contains('is-open');
        picks.forEach(function (o) { if (o !== c) { o.classList.remove('is-open'); o.setAttribute('aria-expanded', 'false'); } });
        c.classList.toggle('is-open', on); c.setAttribute('aria-expanded', on ? 'true' : 'false');
      }
      c.addEventListener('click', function (e) {
        var li = e.target.closest && e.target.closest('li');
        if (li && c.classList.contains('is-open')) { var v = $('.mo-cell-v', c), t = v.textContent; v.textContent = li.textContent; li.textContent = t; toggle(false); return; }
        toggle();
      });
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });

    /* ── 7b. 상단 바 · 떠 있는 버튼 ── */
    var bar = $('.mo-bar'), float = $('.mo-float'), foot = $('.mo-foot');
    if (bar && $('.mo-hero')) bar.classList.add('is-light');
    if (bar) {
      var row = $('.mo-bar-row', bar), left = $('.mo-bar-l', bar);
      var mb = D.createElement('button'); mb.type = 'button'; mb.className = 'mo-mbtn mo-box'; mb.textContent = '메뉴'; mb.setAttribute('aria-expanded', 'false');
      row.appendChild(mb);
      var mnav = D.createElement('div'); mnav.className = 'mo-mnav'; var inner = D.createElement('div'); inner.className = 'mo-mnav-in';
      $$('.mo-bar-r a', bar).forEach(function (a) { var c = a.cloneNode(true); c.className = 'mo-box'; inner.appendChild(c); c.addEventListener('click', function () { setMenu(false); }); });
      mnav.appendChild(inner); left.appendChild(mnav);
      function setMenu(on) { bar.classList.toggle('menu-open', on); mb.textContent = on ? '닫기' : '메뉴'; mb.setAttribute('aria-expanded', on ? 'true' : 'false'); mnav.style.height = on ? inner.scrollHeight + 'px' : '0px'; }
      mb.addEventListener('click', function () { setMenu(!bar.classList.contains('menu-open')); });
    }
    var last = window.scrollY;
    function onScroll() {
      var y = window.scrollY;
      if (bar) {
        bar.classList.toggle('scaled', y >= 200);
        bar.classList.toggle('invisible', !mobile() && y > 800 && y > last && !bar.classList.contains('menu-open'));
      }
      last = y;
      if (float) { var ft = foot ? foot.getBoundingClientRect().top : 1e9; float.classList.toggle('is-on', y > 35 && !(ft < innerHeight - 100)); }
    }
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); onScroll();

    /* ── 움직임 1·2: 섹션과 모듈 줄이 들어올 때 아래에서 떠오른다(스크롤 위치를 읽기만 함 · v1.2부터 기본값에서도) ── */
    if (MOTION >= 1 && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
      $$('.mo-intro > *, .mo-sec > *, .mo-contact > *, .mo-foot > *, .mo-mods > .mo-mod, .mo-cells > .mo-cell').forEach(function (el, k) { el.classList.add('mo-rv'); el.style.transitionDelay = (el.classList.contains('mo-mod') || el.classList.contains('mo-cell')) ? ((k % 6) * 60) + 'ms' : ''; io.observe(el); });
      /* 페이지 끝까지 내리면 남은 것을 모두 보인다(맨 아래 요소가 -10% 선을 못 넘어 숨은 채 남는 것 방지) */
      var revealAll = function () { if (scrollY + innerHeight >= D.documentElement.scrollHeight - 4) $$('.mo-rv:not(.is-in)').forEach(function (el) { el.classList.add('is-in'); }); };
      window.addEventListener('scroll', revealAll, { passive: true }); revealAll();
    }

    /* ── 크게 보기 슬라이드: 사진을 누르면 화면 가득 — 사이트의 모든 사진을 차례로 넘겨 본다 ──
       ← → 키·이전/다음 버튼·좌우 스와이프로 넘기고, 바깥·×·Esc로 닫는다. 같은 사진은 한 번만 센다. */
    var lb = D.createElement('div'); lb.className = 'mo-lb'; lb.tabIndex = -1; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', '사진 크게 보기');
    lb.innerHTML = '<figure class="mo-lb-fig"><img alt=""><figcaption class="mo-lb-cap"></figcaption></figure>'
      + '<button type="button" class="mo-lb-x" aria-label="닫기">×</button>'
      + '<button type="button" class="mo-lb-prev" aria-label="이전 사진">←</button>'
      + '<button type="button" class="mo-lb-next" aria-label="다음 사진">→</button>'
      + '<p class="mo-lb-n" aria-live="polite"></p><div class="mo-lb-strip" aria-label="전체 사진"></div>';
    D.body.appendChild(lb);
    var lbImg = $('img', lb), lbCap = $('.mo-lb-cap', lb), lbN = $('.mo-lb-n', lb), seen = {}, gal = [], at = 0;
    $$('main img').forEach(function (im) {
      if (im.closest('.mo-lb')) return;
      var src = im.getAttribute('src'); if (!src || seen[src]) return; seen[src] = 1; gal.push(im);
    });
    var strip = $('.mo-lb-strip', lb);
    gal.forEach(function (im, k) {   /* 아래 썸네일 줄 = 전체 사진 인디케이터 · 누르면 그 사진으로 */
      var bt = D.createElement('button'); bt.type = 'button'; bt.setAttribute('aria-label', (k + 1) + '번째 사진' + (im.alt ? ' · ' + im.alt : ''));
      var ti = D.createElement('img'); ti.src = im.getAttribute('src'); ti.alt = ''; ti.loading = 'lazy'; bt.appendChild(ti);
      bt.addEventListener('click', function (e) { e.stopPropagation(); show(k); });
      strip.appendChild(bt);
    });
    function show(i) {
      if (!gal.length) return;
      at = (i + gal.length) % gal.length; var im = gal[at];
      lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt || ''; lbCap.textContent = im.alt || '';
      lbN.textContent = (at + 1) + ' / ' + gal.length;
      $$('button', strip).forEach(function (bt, k) { bt.classList.toggle('is-on', k === at); bt.setAttribute('aria-current', k === at ? 'true' : 'false'); });
      var cur = strip.children[at]; if (cur) strip.scrollTo({ left: cur.offsetLeft - strip.clientWidth / 2 + cur.offsetWidth / 2, behavior: 'smooth' });
      [gal[(at + 1) % gal.length], gal[(at - 1 + gal.length) % gal.length]].forEach(function (n) { var x = new Image(); x.src = n.currentSrc || n.src; });
    }
    function lbOpen(i) { show(i); lb.classList.add('is-on'); D.documentElement.classList.add('mo-lb-open'); lb.focus({ preventScroll: true }); }
    function lbClose() { lb.classList.remove('is-on'); D.documentElement.classList.remove('mo-lb-open'); }
    $('.mo-lb-x', lb).addEventListener('click', lbClose);
    $('.mo-lb-prev', lb).addEventListener('click', function (e) { e.stopPropagation(); show(at - 1); });
    $('.mo-lb-next', lb).addEventListener('click', function (e) { e.stopPropagation(); show(at + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === $('.mo-lb-fig', lb)) lbClose(); });
    D.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-on')) return;
      if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowRight') show(at + 1); else if (e.key === 'ArrowLeft') show(at - 1);
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1)); tx = null; }, { passive: true });
    $$('.mo-thumbs img, .mo-step-fig img, .mo-scene-fig img').forEach(function (im) {
      im.addEventListener('click', function (e) { e.stopPropagation(); var i = gal.indexOf(im); if (i < 0) { var s = im.getAttribute('src'); gal.forEach(function (g, k) { if (g.getAttribute('src') === s) i = k; }); } lbOpen(Math.max(0, i)); });
    });

    /* 보고 줄(학생 AI가 옮긴다) */
    if (!$('main img')) REPORT.push('사진 0장: 첫 화면·시리즈·세부 판은 짙은 면/옅은 면으로 섭니다');
    if (REPORT.length) R.setAttribute('data-mo-report', REPORT.join(' / '));
  });
})();

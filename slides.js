/* 공간 → 기준 사이 사진 — 어둑한 방들이 천천히 겹쳐 바뀌며 계속 이어진다.
   sig.js 와 같은 시점(DOMContentLoaded)에 sig.js 다음 차례로 실행한다 —
   그래야 붙인 사진이 '크게 보기' 목록·로드 페이드에 섞이지 않는다.
   움직임 줄이기 설정이면 첫 사진 한 장만 둔다. */
(function () {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  function init() {
    var fig = document.querySelector('.tg-slides');
    if (!fig) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var srcs = ['room-loft', 'gap-arch', 'room-candle', 'step-pendant', 'gap-balcony', 'room-table', 'step-slope', 'gap-bench'];
    var first = fig.querySelector('img');
    first.classList.remove('mo-ld'); first.classList.add('tg-slide', 'is-on');   /* 로드 페이드 클래스는 빼서 겹침 전환만 따르게 */
    var slides = [first].concat(srcs.map(function (s) {
      var im = new Image(); im.src = 'assets/' + s + '.jpg'; im.alt = ''; im.className = 'tg-slide'; im.decoding = 'async';
      fig.appendChild(im); return im;
    }));
    var i = 0, HOLD = 2600, timer = null;   /* 한 장 2.6초 — 처음(4.2초)과 빠른 버전(1초)의 중간 */
    function next() {
      var cur = slides[i]; i = (i + 1) % slides.length;
      var nx = slides[i];
      nx.classList.remove('is-out'); void nx.offsetWidth;   /* 확대 움직임을 처음부터 다시 */
      nx.classList.add('is-on'); cur.classList.add('is-out'); cur.classList.remove('is-on');
    }
    function play(on) { clearInterval(timer); timer = on ? setInterval(next, HOLD) : null; }
    /* 화면에 보일 때만 돈다 */
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { play(es[0].isIntersecting); }).observe(fig);
    else play(true);
  }
})();

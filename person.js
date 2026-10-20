/* 2장 사람 — 왼쪽 아코디언에서 연 칸의 사진들이 오른쪽 큰 판에서 천천히 겹쳐 바뀐다.
   6주 '어둑한' 아래 사진 전환(slides.js · .tg-slide)과 같은 겹침·다가오기 움직임을 쓴다.
   칸마다 data-imgs 에 사진 목록. 다른 칸을 열면 그 칸의 첫 사진으로 겹쳐 넘어간다.
   sig.js 가 같은 시점(DOMContentLoaded)에 만든 _onChange 뒤에 붙는다. 움직임 줄이기 설정이면 칸마다 첫 사진만 둔다. */
(function () {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  function init() {
    var sec = document.getElementById('person-body');
    if (!sec) return;
    var g = sec.querySelector('.mo-mods'), stage = sec.querySelector('.pp-stage');
    if (!g || !stage) return;
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mods = [].slice.call(g.querySelectorAll(':scope > .mo-mod'));
    var first = stage.querySelector('img');
    var cache = {};   /* 파일 이름 → img (같은 사진은 한 장만 만든다) */
    if (first) cache[first.getAttribute('src').replace('assets/', '')] = first;

    var sets = mods.map(function (m) {
      return (m.getAttribute('data-imgs') || '').split(/\s+/).filter(Boolean).map(function (f) {
        if (cache[f]) return cache[f];
        var im = new Image(); im.src = 'assets/' + f; im.alt = ''; im.className = 'tg-slide'; im.decoding = 'async';
        stage.appendChild(im); cache[f] = im; return im;
      });
    });

    var cur = null, set = sets[0] || [], k = 0, HOLD = 2600, timer = null, visible = false;
    function show(im) {
      if (!im || im === cur) return;
      im.classList.remove('is-out'); void im.offsetWidth;   /* 다가오기 움직임을 처음부터 */
      im.classList.add('is-on');
      if (cur) { cur.classList.add('is-out'); cur.classList.remove('is-on'); }
      cur = im;
    }
    function next() { if (set.length < 2) return; k = (k + 1) % set.length; show(set[k]); }
    function play() { clearInterval(timer); timer = (!calm && visible && set.length > 1) ? setInterval(next, HOLD) : null; }
    function pick(i) {
      if (i < 0 || !sets[i] || !sets[i].length) return;   /* 다 접혀도 마지막 사진은 그대로 둔다 */
      set = sets[i]; k = 0; show(set[0]); play();
    }

    sets.forEach(function (s) { if (s.length === 1) s[0].classList.add('is-still'); });   /* 사진 한 장뿐인 칸(가져올 한 가지)은 다가오기 움직임 없이 */
    cur = first; if (cur) cur.classList.add('is-on');
    var base = g._onChange;
    g._onChange = function (i) { if (base) base(i); pick(i); };
    var open = mods.findIndex(function (m) { return m.classList.contains('is-open'); });
    pick(open < 0 ? 0 : open);

    /* 화면에 보일 때만 돈다 */
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; play(); }).observe(stage);
    else { visible = true; play(); }
  }
})();

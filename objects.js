/* 4장 물건 — 가로 섹션 (5주 '근거 사진' my-gallery.js 문법)
   섹션 안쪽(.ob-pin)이 화면에 붙어 있는 동안, 세로 스크롤 거리만큼 물건 줄(.ob-track)이 왼쪽으로 흐른다.
   스크롤을 가로채지 않고 위치를 읽기만 한다. 역스크롤이면 되돌아온다.
   메뉴·끝줄의 물건 이름(#obj-1~5)은 그 물건이 화면 왼쪽에 오는 스크롤 자리에 둔 보이지 않는 표식으로 간다. */
(function () {
  'use strict';
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function init() {
    var sec = document.querySelector('.ob-sec');
    if (!sec) return;
    var pin = sec.querySelector('.ob-pin'), view = sec.querySelector('.ob-view'), track = sec.querySelector('.ob-track');
    var items = [].slice.call(track.querySelectorAll('.ob-item'));
    var dist = 0, run = 0, ticking = false;

    /* 물건마다 보이지 않는 표식 */
    var marks = items.map(function (it, i) {
      var m = document.createElement('span'); m.className = 'ob-mark'; m.id = 'obj-' + (i + 1); m.setAttribute('aria-hidden', 'true');
      sec.appendChild(m); return m;
    });

    function measure() {
      dist = Math.max(0, track.scrollWidth - view.clientWidth);
      sec.style.height = (pin.offsetHeight + dist) + 'px';   /* 가로로 흐를 거리만큼 세로 스크롤 구간 */
      run = Math.max(1, sec.offsetHeight - pin.offsetHeight);
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      items.forEach(function (it, i) {
        var x = it.offsetLeft - pad;
        marks[i].style.top = Math.round(dist ? clamp(x / dist, 0, 1) * run : 0) + 'px';
      });
      update();
    }
    function update() {
      ticking = false;
      var p = clamp(-sec.getBoundingClientRect().top / run, 0, 1);
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(2) + 'px,0,0)';
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    window.addEventListener('scroll', req, { passive: true });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(measure, 120); });
    window.addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    track.querySelectorAll('img').forEach(function (im) { if (!im.complete) im.addEventListener('load', measure); });
    measure();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

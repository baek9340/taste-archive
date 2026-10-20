/* 첫 화면 — 떠 있는 사진 갤러리 (참고: Olivier Larose · Floating Image Gallery)
   마우스가 움직인 거리만큼 '힘'이 쌓이고, 매 프레임 그 힘만큼 세 겹이 밀린다(가까운 겹 1 · 중간 .5 · 먼 겹 .25).
   힘은 매 프레임 조금씩 0으로 줄어 천천히 멈춘다. 사진이 화면 밖으로 멀리 가지 않게 밀린 거리에 한계를 둔다.
   마우스가 없는 기기(폰)에서는 아주 느리게 저절로 떠다닌다. 움직임 줄이기 설정이면 그대로 둔다. */
(function () {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  function init() {
    var hero = document.querySelector('.mo-hero');
    var planes = [].slice.call(document.querySelectorAll('.fg-plane'));
    if (!hero || !planes.length) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var SPEED = .012, EASE = .08, LIMIT = 90;   /* 한계: 가까운 겹 기준 ±90px */
    var xF = 0, yF = 0, raf = null, onScreen = true, t0 = performance.now();
    var pos = planes.map(function (p) { return { el: p, d: parseFloat(p.getAttribute('data-depth')) || 1, x: 0, y: 0 }; });
    var hover = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

    function lerp(a, b, t) { return a * (1 - t) + b * t; }
    function clamp(v, m) { return Math.max(-m, Math.min(m, v)); }

    function frame(now) {
      raf = null;
      if (!onScreen) return;
      if (hover) {
        xF = lerp(xF, 0, EASE); yF = lerp(yF, 0, EASE);
        pos.forEach(function (p) {
          p.x = clamp(p.x + xF * p.d, LIMIT * p.d); p.y = clamp(p.y + yF * p.d, LIMIT * p.d);
          p.el.style.transform = 'translate3d(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px,0)';
        });
        if (Math.abs(xF) > .01 || Math.abs(yF) > .01) raf = requestAnimationFrame(frame);
      } else {
        var t = (now - t0) / 1000;   /* 폰: 겹마다 다른 박자로 아주 느리게 */
        pos.forEach(function (p, i) {
          var x = Math.sin(t * .35 + i * 1.7) * 14 * p.d, y = Math.cos(t * .28 + i * 2.3) * 10 * p.d;
          p.el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
        });
        raf = requestAnimationFrame(frame);
      }
    }
    function kick() { if (!raf && onScreen) raf = requestAnimationFrame(frame); }

    if (hover) {
      hero.addEventListener('mousemove', function (e) { xF += e.movementX * SPEED; yF += e.movementY * SPEED; kick(); });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; kick(); }).observe(hero);
    kick();
  }
})();

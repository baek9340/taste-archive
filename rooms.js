/* 어둑한 방 세 곳 — 화살표(제목 줄)를 다시 누르면 접히고, 셋 다 접혀 있을 수도 있다(data-mo="one").
   다 접혔을 때 배경이 빈 면이 되지 않게, 마지막에 보던 방 사진을 그대로 둔다.
   sig.js 가 같은 시점(DOMContentLoaded)에 만든 _onChange 를 그 뒤에 감싼다. */
(function () {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  function init() {
    var g = document.querySelector('.mo-stage .mo-mods');
    if (!g || !g._onChange) return;
    var base = g._onChange;
    g._onChange = function (i) { if (i > -1) base(i); };
  }
})();

/* 갤러리 — 사진 한 줄을 좌우로 넘겨 본다.
   · ← → 버튼: 한 장씩 · 키보드 ← → (줄에 초점이 있을 때) · 터치는 손가락으로 밀기 · 마우스는 끌기
   · 아래 가는 선이 지금 어디쯤인지 채워지고, 옆에 '3 / 11'
   · 세로 스크롤(휠)은 가로채지 않는다. 끌다 놓은 뒤에는 '크게 보기'가 열리지 않게 한 번 막는다 */
(function () {
  var track = document.querySelector('.tg-gallery');
  if (!track) return;
  var imgs = [].slice.call(track.querySelectorAll('img'));
  var ctl = document.querySelector('.tg-gal-ctl');
  var bar = ctl.querySelector('.tg-gal-bar i'), num = ctl.querySelector('.tg-gal-n');
  var btns = [].slice.call(ctl.querySelectorAll('.tg-gal-btn'));

  function current() {   /* 왼쪽 끝에 가장 가까운 사진 */
    var x = track.scrollLeft, best = 0, d = Infinity;
    imgs.forEach(function (im, k) { var dd = Math.abs(im.offsetLeft - track.offsetLeft - x); if (dd < d) { d = dd; best = k; } });
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = imgs.length - 1;
    return best;
  }
  function update() {
    var max = track.scrollWidth - track.clientWidth, p = max > 0 ? track.scrollLeft / max : 1;
    bar.style.transform = 'scaleX(' + Math.max(.04, p) + ')';
    var c = current(); num.textContent = (c + 1) + ' / ' + imgs.length;
    btns[0].disabled = track.scrollLeft <= 2; btns[1].disabled = track.scrollLeft >= max - 2;
  }
  function go(dir) {
    var k = Math.max(0, Math.min(imgs.length - 1, current() + dir));
    track.scrollTo({ left: imgs[k].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-dir')); }); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  imgs.forEach(function (im) { if (!im.complete) im.addEventListener('load', update); });

  /* 마우스로 끌기 */
  var down = false, sx = 0, sl = 0, moved = 0;
  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft;   /* 끌기 표시는 실제로 움직였을 때만 — 그냥 누르면 사진 '크게 보기'가 열린다 */
  });
  window.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
    if (moved > 6) { track.classList.add('is-drag'); track.scrollLeft = sl - dx; }
  });
  window.addEventListener('pointerup', function () { if (!down) return; down = false; track.classList.remove('is-drag'); });
  /* 끌었으면 놓을 때의 누름은 '크게 보기'로 가지 않게(사진에 달린 처리보다 먼저 잡는다) */
  track.addEventListener('click', function (e) { if (moved > 6) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
  track.addEventListener('dragstart', function (e) { e.preventDefault(); });

  update();
})();

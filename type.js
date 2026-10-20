/* 첫 화면 대표 제목 — 타자 효과.
   글자를 미리 자리에 깔아 두고(보이지 않게) 하나씩 드러내므로 줄바꿈·높이가 움직이지 않는다.
   움직임 줄이기 설정이면 바로 다 보인다.
   간격은 사람 손처럼 조금씩 다르지만, 매번 같은 순서로 다르게(고정된 난수) — 그래서 총 길이가 늘 같다.
   배경 영상(assets/hero.mp4)과는 따로 간다 — 타자는 자기 속도로 쓴다. */
(function () {
  /* 글자마다 나타나는 시각(ms) — motion.html 도 같은 계산을 쓴다 */
  window.tgTypeSchedule = function (lines) {
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var PACE = 1.0;                                                     // 타자 속도 배율 — 클수록 느리게 (1.9 → 1.0: 약 1.9배 빠르게)
    var at = [], t = 900, prev = null;                                  // 첫 글자까지 900ms
    lines.forEach(function (text, li) {
      Array.prototype.forEach.call(text, function (c) {
        if (prev) {
          var wait = 79 + rnd() * 58;                                   /* 사람 손처럼 조금씩 다른 간격 */
          if (li !== prev.line) wait = 540;                             /* 줄이 바뀔 때 숨 한 번 */
          else if (prev.c === ',') wait = 315;
          t += wait * PACE;
        }
        at.push(t); prev = { c: c, line: li };
      });
    });
    return { at: at, total: t };
  };

  var h1 = document.querySelector('.tg-type');
  if (!h1) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var video = document.querySelector('.tg-hero-vid');
  var chars = [], texts = [];
  h1.querySelectorAll('.tg-line').forEach(function (line, li) {
    var text = line.textContent; line.textContent = ''; texts.push(text);
    line.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(text, function (c) {
      var s = document.createElement('span'); s.className = 'tg-ch'; s.textContent = c;
      line.appendChild(s); chars.push({ el: s, line: li });
    });
  });
  var caret = document.createElement('span'); caret.className = 'tg-caret'; caret.setAttribute('aria-hidden', 'true');
  h1.classList.add('is-typing');
  if (reduce) {
    chars.forEach(function (c) { c.el.classList.add('is-on'); }); chars[chars.length - 1].el.after(caret);
    if (video) {   /* 움직이지 않고 영상의 마지막 장면만 보인다 */
      video.removeAttribute('autoplay'); video.pause();
      var toEnd = function () { video.currentTime = Math.max(0, video.duration - .05); };
      if (video.readyState >= 1) toEnd(); else video.addEventListener('loadedmetadata', toEnd, { once: true });
    }
    return;
  }
  chars[0].el.before(caret);

  var plan = tgTypeSchedule(texts);
  var i = 0;
  function step() {
    var c = chars[i]; c.el.classList.add('is-on'); c.el.after(caret);
    i++;
    if (i >= chars.length) { h1.classList.add('is-done'); return; }
    setTimeout(step, plan.at[i] - plan.at[i - 1]);
  }
  setTimeout(step, plan.at[0]);
})();

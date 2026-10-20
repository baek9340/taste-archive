/* 틈 — 히어로 배경 모션 (한 번만 재생하고 멈춤)
   레퍼런스 영상의 문법(아주 가까이에서 글자 윤곽선을 펜툴처럼 그림 → 물러나며 면으로 채워짐)을
   글자 '틈' 하나로만 옮겼다.
   0–14   가까이에서 윤곽선을 천천히 그려 나가며 물러남(점 · 손잡이 · 펜 끝의 빛)
   13–17  윤곽 완성 → 작은 등이 켜지듯 은은하게 채워짐
   14–19  글자가 화면 오른쪽으로 비켜 앉아, 오른쪽 끝에 살짝 잘린 채 흐려지며 멈춤
   사이트에서는 0–14 를 제목 타자 효과 길이에 맞추고(type.js 가 sync), '편해진다'가 다 써진 뒤 14–19 를 MOVE 초로 잇는다.
   글리프: Noto Serif KR Regular(사이트 제목 서체)에서 뽑은 실제 윤곽. 1em = 1000, y는 아래로 +.
   쓰는 법: <canvas data-teum></canvas> 를 두면 부모 크기에 맞춰 채운다. */
(function () {
  var D = 'M820-370L784-355C714-350 205-344 144-345C113-345 66-349 33-355L26-341C25-337 26-334 29-332C54-311 91-291 127-279C151-287 202-297 227-299C280-302 738-307 808-307C838-307 897-305 924-302C933-306 945-321 945-339C945-347 939-353 932-355C909-363 856-369 820-370ZM729-595C735-595 741-597 744-600C749-605 754-618 754-633C754-640 748-645 740-647C718-650 680-652 651-652L621-638C567-635 382-632 302-632L302-638L302-733L753-739C759-739 764-740 768-744C773-750 778-762 778-778C778-785 773-790 765-792C743-796 701-798 673-797L643-782C586-779 378-776 304-777C278-782 212-785 183-785C176-785 173-783 172-780L167-758C192-751 215-741 229-729L229-515C229-462 254-436 316-436L761-444C766-444 771-445 774-449C778-453 782-463 782-480C782-487 778-493 770-494C750-497 706-501 676-500L647-486C588-482 394-478 326-479C309-479 302-485 302-503L302-588ZM736-151L746-186C748-191 747-195 744-197C736-203 714-213 703-218C698-220 691-220 687-218L654-203C578-200 406-198 328-197C299-203 246-208 216-208C211-208 208-206 207-203L202-184C222-176 242-164 252-153L269 50C270 67 274 86 279 98L319 98C324 90 328 83 331 72L726 67C733 62 739 49 739 36C739 30 737 26 731 24L714 16C725-38 732-98 736-151L659-156ZM329-152C430-155 555-157 659-156L656 16L636 21C567 25 419 27 333 26Z';
  var T = 19;                                  // 재생 길이(초) — 이후로는 마지막 장면에 머문다
  var CROP = .14;                              // 마지막 장면에서 글자 폭 중 화면 오른쪽 밖으로 나가는 비율
  var FIN_H = .74;                             // 마지막 장면에서 글자 높이 / 화면 높이
  var BLUR = .011;                             // 마지막 장면의 가우시안 블러 반경 / 화면 높이 (0 이면 끔)
  var INK = [180, 140, 102], DOT = [230, 201, 166];   // my-style.css --my-point · 그보다 밝은 등빛
  var GC = { x: 485, y: -350 };                // 글자 중심

  /* ── 윤곽을 선분 · 곡선으로 (그리는 순서: ㅌ → ㅡ → ㅁ 바깥 → ㅁ 안) ── */
  function parse(d) {
    var tk = d.match(/[MLCZ]|-?\d+(?:\.\d+)?/g), cs = [], i = 0, cur, p, st, cmd;
    function n() { return +tk[i++]; }
    while (i < tk.length) {
      if (/[MLCZ]/.test(tk[i])) cmd = tk[i++];
      if (cmd === 'M') { p = st = [n(), n()]; cur = []; cs.push(cur); cmd = 'L'; }
      else if (cmd === 'L') { var q = [n(), n()]; cur.push({ t: 'L', a: p, b: q }); p = q; }
      else if (cmd === 'C') { var c1 = [n(), n()], c2 = [n(), n()], b = [n(), n()]; cur.push({ t: 'C', a: p, c1: c1, c2: c2, b: b }); p = b; }
      else if (cmd === 'Z') { if (p[0] !== st[0] || p[1] !== st[1]) cur.push({ t: 'L', a: p, b: st }); p = st; cmd = null; }
    }
    return cs;
  }
  function bez(s, t) { var u = 1 - t;
    return [u*u*u*s.a[0] + 3*u*u*t*s.c1[0] + 3*u*t*t*s.c2[0] + t*t*t*s.b[0], u*u*u*s.a[1] + 3*u*u*t*s.c1[1] + 3*u*t*t*s.c2[1] + t*t*t*s.b[1]]; }
  function splitC(s, t) {
    function L(p, q) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
    var ab = L(s.a, s.c1), bc = L(s.c1, s.c2), cd = L(s.c2, s.b), abc = L(ab, bc), bcd = L(bc, cd);
    return { c1: ab, c2: abc, b: L(abc, bcd) };
  }
  var cs = parse(D), SEGS = [], TOTAL = 0;
  [1, 0, 2, 3].forEach(function (k) {
    cs[k].forEach(function (s, j) {
      var len = 0;
      if (s.t === 'L') len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]);
      else { var q = s.a; for (var m = 1; m <= 32; m++) { var r = bez(s, m / 32); len += Math.hypot(r[0] - q[0], r[1] - q[1]); q = r; } }
      s.len = len; s.from = TOTAL; s.first = j === 0; SEGS.push(s); TOTAL += len;
    });
  });
  function penAt(dist) {
    for (var i = 0; i < SEGS.length; i++) { var s = SEGS[i];
      if (dist <= s.from + s.len) { var t = s.len ? (dist - s.from) / s.len : 0;
        return s.t === 'L' ? [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t] : bez(s, t); } }
    return SEGS[SEGS.length - 1].b;
  }
  var P0 = SEGS[0].a;                          // 첫 장면에서 펜이 출발하는 점

  /* ── 시간 곡선 ── */
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ss(a, b, t) { t = clamp((t - a) / (b - a)); return t * t * (3 - 2 * t); }
  function cr(keys, t) {                       // Catmull-Rom — 키 사이에서 멈칫하지 않고 이어지게
    var n = keys.length; if (t <= keys[0][0]) return keys[0][1]; if (t >= keys[n - 1][0]) return keys[n - 1][1];
    var j = 0; while (keys[j + 1][0] < t) j++;
    var k0 = keys[Math.max(0, j - 1)], k1 = keys[j], k2 = keys[j + 1], k3 = keys[Math.min(n - 1, j + 2)], h = k2[0] - k1[0], u = (t - k1[0]) / h;
    var m1 = (k2[1] - k0[1]) / (k2[0] - k0[0]) * h, m2 = (k3[1] - k1[1]) / (k3[0] - k1[0]) * h, u2 = u * u, u3 = u2 * u;
    return (2*u3 - 3*u2 + 1) * k1[1] + (u3 - 2*u2 + u) * m1 + (-2*u3 + 3*u2) * k2[1] + (u3 - u2) * m2;
  }
  /* 배율 — 화면 높이 1080 기준 px / 글자 단위. 그리는 동안 천천히 물러난다 */
  var SC = [[0, 15], [3.5, 7], [7.5, 2.6], [11.5, 1.05], [14.5, .66], [T, .6]]
    .map(function (k) { return [k[0], Math.log(k[1])]; });
  function scaleAt(t) { return Math.exp(cr(SC, t)); }

  var STEP = 1 / 120, NS = Math.round(T / STEP) + 1;
  var PROG = new Float32Array(NS), CX = new Float32Array(NS), CY = new Float32Array(NS);
  (function precompute() {
    var T0 = .4, T1 = 13.6, acc = 0, i, t, raw = new Float32Array(NS);
    for (i = 0; i < NS; i++) { t = i * STEP; if (t > T0 && t < T1) acc += Math.pow(1 / scaleAt(t), .6) * STEP * ss(T0, T0 + 1.2, t) * (1 - .6 * ss(T1 - 1.5, T1, t)); raw[i] = acc; }
    for (i = 0; i < NS; i++) PROG[i] = raw[i] / acc;
    /* 카메라 목표: 펜 끝을 부드럽게 따라가다 → 글자 중심 */
    var a = 1 - Math.exp(-STEP / .5), sx = P0[0], sy = P0[1];
    for (i = 0; i < NS; i++) {
      t = i * STEP; var p = penAt(PROG[i] * TOTAL), w = ss(4, 13, t);
      sx += (lerp(p[0], GC.x, w) - sx) * a; sy += (lerp(p[1], GC.y, w) - sy) * a; CX[i] = sx; CY[i] = sy;
    }
  })();
  function look(arr, t) { var f = Math.min(Math.max(t, 0), T) / STEP, i = Math.min(NS - 2, Math.floor(f)); return lerp(arr[i], arr[i + 1], f - i); }

  var PATH = new Path2D(D);
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')'; }

  /* ── 한 장면 그리기 ── */
  function draw(g, W, H, t, bg) {
    t = Math.min(Math.max(t, 0), T);
    var base = Math.min(W * 12 / 17, H) / 1080, px = base * 1.5;   // px = 레퍼런스 화면의 1px
    var S = scaleAt(t) * base, cx = look(CX, t), cy = look(CY, t), prog = look(PROG, t);
    /* 마지막 구도 — 글자 오른쪽이 화면 오른쪽 끝에 살짝(CROP) 잘리게. 화면 비율이 달라도 같은 느낌 */
    var sF = Math.min(FIN_H * H / 895, .95 * W / 920);            // 글자 높이 895 · 폭 920 단위
    var cxF = 945 - (W / 2 + CROP * 920 * sF) / sF, cyF = -350;
    var k = ss(14, T, t);
    S = Math.exp(lerp(Math.log(S), Math.log(sF), k)); cx = lerp(cx, cxF, k); cy = lerp(cy, cyF, k);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.filter = 'none';
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, W, H); } else g.clearRect(0, 0, W, H);
    g.setTransform(S, 0, 0, S, W / 2 - cx * S, H / 2 - cy * S);
    /* 완성된 '틈'이 자리를 잡는 동안 초점이 천천히 풀린다 — 등 너머로 흐릿하게 남는 빛 */
    var blur = ss(15.2, T, t) * BLUR * H;
    if (blur > .3) g.filter = 'blur(' + blur.toFixed(1) + 'px)';

    var fill = ss(13.2, 17, t);                                       // 작은 등이 켜지듯
    var lines = ss(0, .6, t);
    var lw = 1.7 * px / S;


    /* 아주 흐린 전체 윤곽 — 언제나 깔려 있는 바닥선 */
    g.lineWidth = lw; g.strokeStyle = rgba(INK, .2 * (1 - fill * .6)); g.stroke(PATH);

    /* 면 — 가운데가 조금 더 밝은 등빛 */
    if (fill > .002) {
      var gr = g.createRadialGradient(GC.x, GC.y, 0, GC.x, GC.y, 620);
      gr.addColorStop(0, rgba(DOT, .62 * fill)); gr.addColorStop(1, rgba(INK, .42 * fill));
      g.fillStyle = gr; g.fill(PATH);
    }

    /* 펜이 지나간 윤곽 */
    var a = lines * (1 - fill * .75);
    if (a > .002) {
      var dist = prog * TOTAL; g.strokeStyle = rgba(INK, a); g.beginPath();
      for (var i = 0; i < SEGS.length; i++) { var s = SEGS[i]; if (s.from > dist) break;
        if (s.first) g.moveTo(s.a[0], s.a[1]);
        var u = clamp((dist - s.from) / (s.len || 1));
        if (s.t === 'L') g.lineTo(s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u);
        else if (u >= 1) g.bezierCurveTo(s.c1[0], s.c1[1], s.c2[0], s.c2[1], s.b[0], s.b[1]);
        else { var h = splitC(s, u); g.bezierCurveTo(h.c1[0], h.c1[1], h.c2[0], h.c2[1], h.b[0], h.b[1]); } }
      g.stroke();
    }

    /* 점 · 손잡이 · 펜 끝 — 윤곽이 다 그려지면 사라짐 */
    var da = lines * (1 - ss(13.4, 15.4, t));
    if (da > .002) {
      var r = 3 * px / S, d2 = prog * TOTAL, cur = null;
      g.fillStyle = rgba(DOT, da);
      for (i = 0; i < SEGS.length; i++) { s = SEGS[i]; if (s.from > d2) break;
        if (d2 <= s.from + s.len) cur = s;
        g.beginPath(); g.arc(s.a[0], s.a[1], r, 0, 7); g.fill(); }
      if (cur && cur.t === 'C' && prog < 1) {
        g.strokeStyle = rgba(DOT, da * .5); g.lineWidth = .8 * px / S; g.beginPath();
        g.moveTo(cur.a[0], cur.a[1]); g.lineTo(cur.c1[0], cur.c1[1]); g.moveTo(cur.b[0], cur.b[1]); g.lineTo(cur.c2[0], cur.c2[1]); g.stroke();
        [cur.c1, cur.c2].forEach(function (c) { g.beginPath(); g.arc(c[0], c[1], r * .7, 0, 7); g.stroke(); });
      }
      if (prog < 1) {
        var p = penAt(d2), glow = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 7);
        glow.addColorStop(0, rgba(DOT, .55 * da)); glow.addColorStop(1, rgba(DOT, 0));
        g.fillStyle = glow; g.beginPath(); g.arc(p[0], p[1], r * 7, 0, 7); g.fill();
        g.fillStyle = rgba(DOT, da); g.beginPath(); g.arc(p[0], p[1], r * 1.3, 0, 7); g.fill();
      }
    }
  }

  /* ── 캔버스에 붙이기: 부모 크기를 따라가고, 한 번 재생한 뒤 마지막 장면에 멈춘다.
        화면 밖이거나 탭이 숨으면 멈췄다가 이어서(보지 못한 사이에 끝나 버리지 않게)
        sync(초): 앞 장면(그리기 · 채우기, 0–SPLIT)을 그 길이에 맞추고 — 제목 타자 효과가 끝나는 순간 —
        그 뒤에 '틈'이 오른쪽으로 비켜 앉으며 흐려지는 장면(SPLIT–T)을 MOVE 초 동안 이어 간다 ── */
  var SPLIT = 14, MOVE = 4.1;
  function mount(cv, opt) {
    opt = opt || {};
    var g = cv.getContext('2d'), W = 0, H = 0, r = 0, last = null, on = true, raf = 0, lead = opt.sync || SPLIT, move = opt.move || MOVE;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function total() { return lead + move; }
    function scene(rr) { return rr < lead ? rr / lead * SPLIT : SPLIT + Math.min(1, (rr - lead) / move) * (T - SPLIT); }
    if (reduce) r = total();                                  // 움직임 줄이기 — 완성된 마지막 장면만
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
      if (opt.fixed) { W = cv.width; H = cv.height; return; }
      W = cv.width = Math.max(1, Math.round(w * dpr)); H = cv.height = Math.max(1, Math.round(h * dpr));
    }
    function paint() { draw(g, W, H, scene(r), opt.bg); }
    function frame(now) {
      raf = 0; if (!on) return;
      if (last !== null) r = Math.min(total(), r + Math.min(.1, (now - last) / 1000));
      last = now; paint();
      if (r < total()) raf = requestAnimationFrame(frame); else if (opt.onEnd) opt.onEnd();
    }
    function start() { if (!raf && r < total()) { last = null; raf = requestAnimationFrame(frame); } }
    size(); paint(); start();
    if (!opt.fixed) window.addEventListener('resize', function () { size(); paint(); });
    if ('IntersectionObserver' in window && !opt.fixed) new IntersectionObserver(function (es) {
      on = es[0].isIntersecting; if (on) start();
    }).observe(cv);
    return {
      get time() { return r; },                               // 실제 경과(초)
      set time(v) { r = Math.min(total(), Math.max(0, v)); last = null; paint(); start(); },
      get duration() { return total(); },
      get done() { return r >= total(); },
      sync: function (s) { lead = s; },                       // 앞 장면 길이(초) = 타자 효과 길이
      replay: function () { this.time = 0; },
      draw: function (tt) { draw(g, W, H, tt, opt.bg); }
    };
  }

  window.TeumBG = { T: T, SPLIT: SPLIT, MOVE: MOVE, draw: draw, mount: mount };
  document.querySelectorAll('canvas[data-teum]').forEach(function (cv) { cv._teum = mount(cv); });
})();

/* ===== 冬将至 我与你 —— 网站复刻 ===== */
(function () {
  'use strict';

  var FRAME_COUNT = 30;          // assets/bg_01.jpg ~ bg_30.jpg（对应原视频 0.5s/帧）
  var INTRO_FRAMES = 4;          // 前 4 帧（2 秒）为黑底雪花开场
  var FRAME_HOLD = 1400;         // 每帧停留
  var CROSSFADE_MS = 1600;       // 交叉淡化时长（与 CSS transition 对应）
  var INTRODuration = 2600;      // 开场停留时长

  var bgA = document.getElementById('bgA');
  var bgB = document.getElementById('bgB');
  var heartGlow = document.getElementById('heartGlow');
  var vignette = document.getElementById('vignette');
  var musicBtn = document.getElementById('musicBtn');
  var musicHint = document.getElementById('musicHint');

  /* ---------- 预加载背景帧 ---------- */
  var frames = [];
  var loaded = 0;
  for (var i = 1; i <= FRAME_COUNT; i++) {
    (function (idx) {
      var img = new Image();
      var n = (idx < 10 ? '0' + idx : '' + idx);
      img.src = 'assets/bg_' + n + '.jpg';
      img.onload = img.onerror = function () { loaded++; };
      frames.push(img);
    })(i);
  }

  function frameURL(idx) {
    var n = (idx < 10 ? '0' + idx : '' + idx);
    return 'assets/bg_' + n + '.jpg';
  }

  /* ---------- 背景交叉淡化调度 ---------- */
  var layers = [bgA, bgB];
  var front = 0;
  var started = false;

  function show(idx, zoom) {
    var back = 1 - front;
    var backEl = layers[back], frontEl = layers[front];
    backEl.style.backgroundImage = 'url("' + frameURL(idx) + '")';
    backEl.classList.toggle('zoom', !!zoom);
    // 强制 reflow 保证 transition 生效
    void backEl.offsetWidth;
    backEl.classList.add('show');
    frontEl.classList.remove('show');
    front = back;
  }

  function startSequence() {
    if (started) return;
    started = true;
    // 开场：黑底雪花帧静态展示（帧号从 1 开始）
    show(1, false);
    heartGlow.classList.add('on');

    var frostIdx = INTRO_FRAMES + 1; // 从第 5 帧开始为霜冻转场/场景
    // 开场 -> 霜冻转场
    setTimeout(function () {
      heartGlow.classList.remove('on');
      vignette.classList.add('on');
      show(frostIdx, true);
      frostIdx++;

      // 之后循环交叉淡化
      setInterval(function () {
        show(frostIdx, true);
        frostIdx++;
        if (frostIdx >= FRAME_COUNT) frostIdx = INTRO_FRAMES; // 循环霜冻部分
      }, FRAME_HOLD);
    }, INTRODuration);
  }

  // 调试模式
  var m = /frame=(\d+)/.exec(location.search);
  var nofade = /[?&]nofade/.test(location.search);
  if (nofade) {
    document.querySelectorAll('.bg').forEach(function (el) { el.style.transition = 'none'; });
  }
  if (m) {
    var di = Math.min(FRAME_COUNT, Math.max(1, +m[1]));
    bgA.style.backgroundImage = 'url("' + frameURL(di) + '")';
    bgA.classList.add('show');
    vignette.classList.add('on');
  } else if (nofade) {
    startSequence();
  } else {
  // 预加载完成后启动（或最多等待 3 秒）
  var bootT = setInterval(function () {
    if (loaded >= FRAME_COUNT * 0.6) {
      clearInterval(bootT);
      startSequence();
    }
  }, 120);
  setTimeout(function () { clearInterval(bootT); startSequence(); }, 3000);
  }

  /* ---------- 雪花粒子系统 ---------- */
  var canvas = document.getElementById('snow');
  var ctx = canvas.getContext('2d');
  var W, H, particles;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  var COUNT = Math.min(160, Math.floor(window.innerWidth / 9));

  function makeParticle(init) {
    var r = 0.6 + Math.random() * 2.6;
    return {
      x: Math.random() * W,
      y: init ? Math.random() * H : -10,
      r: r,
      speed: 0.35 + r * 0.5 + Math.random() * 0.6,
      sway: 0.3 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.008 + Math.random() * 0.015,
      alpha: 0.35 + Math.random() * 0.6
    };
  }

  particles = [];
  for (var p = 0; p < COUNT; p++) particles.push(makeParticle(true));

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var s = particles[i];
      s.phase += s.phaseSpeed;
      s.y += s.speed;
      s.x += Math.sin(s.phase) * s.sway * 0.4;

      if (s.y > H + 12) particles[i] = makeParticle(false);
      var s2 = particles[i];

      ctx.beginPath();
      ctx.arc(s2.x, s2.y, s2.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + s2.alpha + ')';
      ctx.shadowColor = 'rgba(255,255,255,.8)';
      ctx.shadowBlur = s2.r * 2.4;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------- 音乐 ---------- */
  var audio = new Audio('https://m701.music.126.net/20261107133548/4be453836d0ecce14537a66b8f396504/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/83487235324/b446/d886/a6dc/1c0f92d0c0bd8954316418306d4b7784.mp3?vuutv=/ADRMEerL4ucCBGgoiHEmygYqe6r7pbcaqumdqCSiHg/kR2MPyTZhw13YwIhXwE8RK7lp7dMVsqFbBNfi09Zu9XSTSXloyDwa7pzHIOKK7A=');
  audio.loop = true;
  audio.preload = 'auto';
  var playing = false;

  function setBtnState() {
    musicBtn.classList.toggle('playing', playing);
    var svg = musicBtn.querySelector('svg');
    svg.classList.toggle('spin', playing);
    musicHint.textContent = playing ? '' : '点击开启音乐';
  }

  function tryStart() {
    audio.play().then(function () {
      playing = true;
      setBtnState();
    }).catch(function () { /* 保持静音状态 */ });
  }

  // 首次任意点击开启音乐；按钮切换开关
  document.addEventListener('click', function firstClick() {
    if (!playing) tryStart();
    document.removeEventListener('click', firstClick);
  });

  musicBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (playing) {
      audio.pause();
      playing = false;
    } else {
      tryStart();
    }
    setBtnState();
  });

  /* ================= 歌词 / 制作名单 同步 =================
     数据源：https://music.90svip.cn/api.php?get=lrc&type=wy&id=3445520471&sign=e60YKhi6Z5yS2&t=1794028581
     （已内联，避免跨域与链接失效）                                        */

  var LRC = [
    [0.00, '词 : 姚六一'],
    [1.00, '曲 : 姚六一'],
    [2.00, '原唱 : 姚六一'],
    [3.00, '编曲 : 任斌'],
    [4.00, '制作人 : 赵若海/郭琛'],
    [5.00, '配唱制作人 : 姜冉'],
    [6.00, '混音 : 潘君明'],
    [7.00, '和声 : 王韩伊淋'],
    [8.00, '吉他 : 陈晨'],
    [9.00, '策划/推广 : 郭琛/杨俊浩@织乐文化'],
    [10.00, '歌曲统筹 : 钟琦'],
    [11.00, '监制 : 钟琦'],
    [12.00, '出品人 : 萧跃'],
    [13.00, 'OP/SP : 地心引力'],
    [14.00, '「本作品已经过词曲著作权公司正式授权」'],
    [15.00, '「版权所有，未经许可，不得翻唱或使用」'],
    [17.99, '那一幕怎忘记'],
    [21.81, '初次相遇的你'],
    [25.61, '路人闹挺挺看我滑稽'],
    [29.42, '为你一笑我愿做猴戏'],
    [33.28, '一生能有几序'],
    [36.98, '牵肠挂肚情义'],
    [40.95, '你大可不必猜忌寻觅'],
    [44.56, '我愿意一生为你追寻'],
    [52.38, '就这般望着你 难免我愁愁'],
    [58.97, '除你我禽鸟连花草 成双荡悠悠'],
    [66.58, '你呀你冻我心房酸我眼眶一生的伤'],
    [73.98, '你呀你彼岸观望置身一旁一生两望'],
    [97.67, '也有春花秋月'],
    [101.51, '也望相守不渝'],
    [105.32, '雨打荷叶吵吵了几滴'],
    [109.16, '又怎能熄灭心中柔情'],
    [112.83, '谈笑中提起你'],
    [116.69, '疼痛这般熟悉'],
    [120.43, '如今的你在何处飘零'],
    [124.22, '一片片破碎的心难拾起'],
    [128.15, '你我为何沦落这步田地'],
    [132.23, '就这般望着你 难免我愁愁'],
    [138.55, '除你我禽鸟连花草 成双荡悠悠'],
    [146.24, '你呀你冻我心房酸我眼眶一生的伤'],
    [153.77, '你呀你彼岸观望置身一旁一生两望'],
    [162.73, '穷极一生又何惧'],
    [168.01, '也许只是一个背影'],
    [170.46, '天亮之后就出行'],
    [175.96, '你又会在何处伫立'],
    [183.99, '是否也在等我的你'],
    [191.70, '你呀你冻我心房酸我眼眶一生的伤'],
    [199.36, '你呀你彼岸观望置身一旁一生两望'],
    [208.38, '穷极一生又何惧'],
    [213.56, '也许只是一个背影'],
    [215.99, '天亮之后就出行'],
    [223.12, '在隔对岸等你']
  ];

  var LYRIC_START = 17.99;   // 歌词开始时间：此刻标题切换为歌词
  var CREDIT_END = 17.99;    // 制作名单在此刻消失

  var creditsEl = document.getElementById('credits');
  var crLines = creditsEl.querySelectorAll('.cr');
  var crSlot = 0;
  var crText = null;

  var titleLines = document.querySelectorAll('#titleSlot .line.title');
  var lyrLines = document.querySelectorAll('#titleSlot .line.lyric');
  var titleSlot = 0;         // 当前显示的标题层
  var lyrSlot = 0;           // 当前显示的歌词层
  var creditsHidden = false;

  // 长句自动缩小字号
  function fitLine(el, text, baseMax) {
    el.textContent = text;
    if (!text) return;
    var len = text.replace(/\s/g, '').length;
    var scale = 1;
    if (len > 9)  scale = Math.min(1, 9 / len + 0.12);
    if (len > 13) scale = Math.min(scale, 13 / len + 0.06);
    el.style.fontSize = 'calc(clamp(34px, 7.4vmin, 84px) * ' + scale.toFixed(3) + ')';
  }

  var TITLE_TEXT = '冬将至\u2002我与你';

  function showTitle() {
    // 歌词层全部退场
    for (var i = 0; i < lyrLines.length; i++) {
      if (lyrLines[i].classList.contains('active')) {
        lyrLines[i].classList.remove('active');
        lyrLines[i].classList.add('out');
      }
    }
    var cur = titleLines[titleSlot];
    if (cur.classList.contains('active') && cur.textContent === TITLE_TEXT) return;

    var other = titleLines[1 - titleSlot];
    other.classList.remove('active');
    other.classList.add('out');

    cur.textContent = TITLE_TEXT;
    cur.classList.remove('out', 'in', 'active');
    cur.classList.add('in');
    void cur.offsetWidth;
    cur.classList.add('active');
    cur.classList.remove('in');
  }

  function showLyric(text) {
    var cur = lyrLines[lyrSlot];
    if (cur.classList.contains('active') && cur.textContent === text) return;

    // 标题层退场
    for (var i = 0; i < titleLines.length; i++) {
      if (titleLines[i].classList.contains('active')) {
        titleLines[i].classList.remove('active');
        titleLines[i].classList.add('out');
      }
    }

    var next = lyrLines[1 - lyrSlot];
    fitLine(next, text);
    next.classList.remove('out', 'in', 'active');
    next.classList.add('in');
    void next.offsetWidth;
    next.classList.add('active');
    next.classList.remove('in');

    if (cur.classList.contains('active')) {
      cur.classList.remove('active');
      cur.classList.add('out');
    }
    lyrSlot = 1 - lyrSlot;
  }

  function showCredit(text) {
    if (text === crText) return;
    crText = text;
    var cur = crLines[crSlot];
    var next = crLines[1 - crSlot];
    next.textContent = text;
    next.classList.add('active');
    cur.classList.remove('active');
    crSlot = 1 - crSlot;
  }

  function lyricAt(t) {
    var idx = -1;
    for (var i = 0; i < LRC.length; i++) {
      if (LRC[i][0] <= t) idx = i; else break;
    }
    return idx;
  }

  function updateTimeline(t) {
    // 制作名单：0–17.99s 逐行，之后隐藏
    if (t < CREDIT_END) {
      if (!creditsHidden) {
        creditsEl.classList.remove('hide');
        creditsHidden = false;
      }
      var ci = Math.max(0, lyricAt(t));
      showCredit(LRC[ci][1]);
    } else if (!creditsHidden) {
      creditsEl.classList.add('hide');
      creditsHidden = true;
    }

    // 标题 / 歌词
    if (t < LYRIC_START) {
      showTitle();
    } else {
      var li = lyricAt(t);
      if (li >= 0 && LRC[li][0] >= LYRIC_START) {
        showLyric(LRC[li][1]);
      }
    }
  }

  // 调试：?t=秒 模拟时间轴（无需音频）
  var debugT = parseFloat((/[?&]t=([\d.]+)/.exec(location.search) || [])[1]);
  var isDebug = !isNaN(debugT);

  var lastT = -1;
  function loop() {
    var t = isDebug ? debugT + ((performance.now() - loopStart) / 1000) : audio.currentTime;
    if (t !== lastT) {
      updateTimeline(t);
      lastT = t;
    }
    requestAnimationFrame(loop);
  }
  var loopStart = performance.now();
  requestAnimationFrame(loop);
})();

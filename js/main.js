(function () {
  // Bản gốc của trang, chụp trước khi script thay đổi gì (dùng cho bản file .html khi lưu ảnh mới)
  var SOURCE = '<!doctype html>\n' + document.documentElement.outerHTML;

  /* ====== THÔNG TIN CẦN CẬP NHẬT (xem HUONG-DAN.html) ======
     mapUrl   : link mở Google Maps khi bấm "Chỉ đường".
     mapEmbed : link bản đồ xem trước trong thiệp (dạng https://www.google.com/maps?q=VĨ_ĐỘ,KINH_ĐỘ&output=embed).
     musicUrl : file nhạc phát sau khi mở phong bì. Đặt file .mp3 vào thư mục music/ rồi ghi tên ở đây,
                hoặc dán link trực tiếp tới file .mp3. Không có file → tự phát hộp nhạc Canon in D.
     album    : danh sách ảnh album, theo đúng thứ tự hiển thị. Thêm ảnh: chép file vào img/ rồi thêm một dòng
                tên file vào danh sách. Để trống [] = dùng các ảnh có sẵn trong index.html.
                Dải ảnh nhỏ tự dùng bản thu nhỏ cùng tên trong img/thumbs/ (không có thì dùng ảnh gốc).
     sheetApi : URL ứng dụng web Google Apps Script (kết thúc bằng /exec) để lưu xác nhận tham dự,
                lời chúc và theo dõi khách đã mở thiệp. Để trống = chế độ xem thử (chỉ lưu trên máy khách).
     Đổi ảnh  : thay file trong img/ (giữ nguyên tên), hoặc mở thiệp với #chinh-sua ở cuối link. */
  var CONFIG = {
    start: '2026-10-17T10:00:00+07:00',
    end: '2026-10-17T13:00:00+07:00',
    title: 'Lễ Vu Quy Phan Vũ & Quỳnh Như',
    place: 'Sân bóng thôn An Bình, Xã Trường Giang (Tịnh Đông cũ), Quảng Ngãi',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=15.1729883,108.658986',
    mapEmbed: 'https://www.google.com/maps?q=15.1729883,108.658986&output=embed',
    events: {
      gai: {
        name: 'Lễ Vu Quy', time: '10:00', weekday: 'Thứ Bảy', date: '17.10.2026',
        start: '2026-10-17T10:00:00+07:00', end: '2026-10-17T13:00:00+07:00',
        lunar: 'Tức ngày 08 tháng 09 năm Bính Ngọ',
        place: 'Sân bóng thôn An Bình, Xã Trường Giang (Tịnh Đông cũ), Quảng Ngãi',
        venue: 'Sân bóng thôn An Bình',
        mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=15.1729883,108.658986',
        mapEmbed: 'https://www.google.com/maps?q=15.1729883,108.658986&output=embed'
      },
      trai: {
        name: 'Lễ Tân Hôn', time: '11:00', weekday: 'Thứ Năm', date: '29.10.2026',
        start: '2026-10-29T11:00:00+07:00', end: '2026-10-29T14:00:00+07:00',
        lunar: 'Tức ngày 20 tháng 09 năm Bính Ngọ',
        place: 'Phước Lâm Viên, Đak Đoa, Gia Lai', venue: 'Phước Lâm Viên',
        mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=13.9874621,108.1129081',
        mapEmbed: 'https://www.google.com/maps?q=13.9874621,108.1129081&output=embed'
      }
    },
    musicUrl: 'music/nhac-nen.mp3',
    album: [
      'img/album-1.jpg',
      'img/album-2.jpg',
      'img/album-3.jpg',
      'img/album-4.jpg',
      'img/album-5.jpg',
      'img/album-6.jpg',
      'img/album-7.jpg',
      'img/album-8.jpg',
      'img/album-9.jpg',
      'img/album-10.jpg',
      'img/album-11.jpg',
      'img/album-12.jpg',
      'img/album-13.jpg',
      'img/album-14.jpg',
      'img/album-15.jpg',
      'img/album-16.jpg',
      'img/album-17.jpg',
      'img/album-18.jpg',
      'img/album-19.jpg',
      'img/album-20.jpg',
      'img/album-21.jpg'
    ],
    sheetApi: 'https://script.google.com/macros/s/AKfycbxYsNKaUK60E-wrYoTzTSMEVIZ_3yLj8m2nOdBYf6ojzvoHrIRb3mZquiZdie-LSKvvbg/exec'
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 2200);
  }

  /* ---- khách mời từ link: ?to=Anh%20Minh&id=k7f3qa&ben=trai (link tạo từ Google Sheet) ---- */
  var GUEST = { name: '', id: '', side: '' };
  var EVENT = CONFIG.events.gai;
  function useEvent(event) {
    EVENT = event;
    CONFIG.start = event.start; CONFIG.end = event.end;
    CONFIG.title = event.name + ' Phan Vũ & Quỳnh Như';
    CONFIG.place = event.place; CONFIG.mapUrl = event.mapUrl; CONFIG.mapEmbed = event.mapEmbed;
    document.title = 'Thiệp cưới Phan Vũ & Quỳnh Như · ' + event.date;
    var dateParts = event.date.split('.');
    var setText = function (selector, value) { var el = $(selector); if (el) el.textContent = value; };
    setText('.letter .d', event.date); setText('.hero-date', dateParts.join(' · '));
    setText('#ev-title', event.name); setText('.event-at b', event.time);
    var trio = $$('.trio span'); if (trio[0]) trio[0].textContent = event.weekday;
    if (trio[1]) trio[1].textContent = 'Tháng ' + Number(dateParts[1]);
    setText('.trio strong', dateParts[0]); setText('.year', dateParts[2]); setText('.lunar', event.lunar);
    setText('.venue h3', event.venue); setText('.venue h3 + p', event.place);
    var map = $('[data-map-embed]'); if (map) map.title = 'Bản đồ ' + event.venue;
    setText('.cal-head b', 'Tháng ' + Number(dateParts[1])); setText('.cal-head span', dateParts[2]);
    var cal = $('.cal'); if (cal) cal.setAttribute('aria-label', 'Lịch tháng ' + Number(dateParts[1]) + ' năm ' + dateParts[2] + ', ngày ' + Number(dateParts[0]) + ' được đánh dấu');
    setText('#cam-on .sign small', dateParts.join(' · '));
  }
  function applyGuestInfo(info) {
    if (!info || !info.name) return;
    GUEST.name = String(info.name).trim().slice(0, 60);
    if (info.side === 'Nhà gái' || info.side === 'Nhà trai') GUEST.side = info.side;
    $$('.guest-name').forEach(function (el) { el.textContent = GUEST.name; });

    var desc = 'Trân trọng kính mời ' + GUEST.name
      + ' đến dự ' + EVENT.name + ' của Phan Vũ & Quỳnh Như lúc ' + EVENT.time + ', ' + EVENT.weekday + ' ' + EVENT.date + ' '
      + '(' + EVENT.lunar.replace('Tức ngày ', 'tức ngày ') + ') tại ' + EVENT.place + '.';
    [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]'
    ].forEach(function (selector) {
      var meta = $(selector);
      if (meta) meta.setAttribute('content', desc);
    });

    var rsvpName = $('#rsvp-name'), wishName = $('#wish-name');
    if (rsvpName && !rsvpName.value) rsvpName.value = GUEST.name;
    if (wishName && !wishName.value) wishName.value = GUEST.name;
    if (GUEST.side) $$('input[name="side"]').forEach(function (r) { r.checked = r.value === GUEST.side; });
  }
  try {
    var q = new URLSearchParams(location.search);
    var to = (q.get('to') || '').trim();
    var id = (q.get('id') || '').trim();
    var sent = (q.get('sent') || '').trim().toLowerCase();
    GUEST.id = (id || to).replace(/[^\w-]/g, '').slice(0, 20);
    // Link mới có tên trong `to`; vẫn hỗ trợ link cũ chỉ có mã trong `to`.
    GUEST.name = (q.get('khach') || (id && to && to !== id ? to : '')).trim().slice(0, 60);
    var ben = (q.get('ben') || '').toLowerCase();
    GUEST.side = ben === 'gai' ? 'Nhà gái' : ben === 'trai' ? 'Nhà trai' : '';
    if (sent === 'bame') {
      var thanksSignName = $('#thanksSignName');
      if (thanksSignName) thanksSignName.textContent = 'Sang & Nga';
    }
  } catch (e) {}
  useEvent(GUEST.side === 'Nhà trai' ? CONFIG.events.trai : CONFIG.events.gai);
  if (GUEST.name) applyGuestInfo(GUEST);

  /* ---- Google Sheet (Apps Script) ---- */
  var API = (CONFIG.sheetApi || '').trim();
  function apiPost(data) {
    // text/plain để trình duyệt gửi thẳng, không cần bước kiểm tra CORS;
    // keepalive để yêu cầu vẫn đi tiếp nếu khách đóng trang ngay sau khi bấm gửi
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = ctl && setTimeout(function () { ctl.abort(); }, 30000);
    return fetch(API, { method: 'POST', keepalive: true, signal: ctl ? ctl.signal : undefined,
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(timer); if (!j || !j.ok) throw new Error((j && j.error) || 'failed'); return j; },
            function (e) { clearTimeout(timer); throw e; });
  }
  function apiGet(params) {
    return fetch(API + (API.indexOf('?') < 0 ? '?' : '&') + new URLSearchParams(params).toString())
      .then(function (r) { return r.json(); });
  }
  // Chỉ tra Sheet cho các link cũ chỉ có mã; link mới đã có tên trong `to`.
  if (API && GUEST.id && !GUEST.name) {
    apiGet({ action: 'guest', id: GUEST.id }).then(function (j) {
      if (j && j.ok && j.guest) applyGuestInfo(j.guest);
    }).catch(function () {});
  }

  /* ---- liên kết lịch & bản đồ ---- */
  var startD = new Date(CONFIG.start), endD = new Date(CONFIG.end);
  function gfmt(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  var gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(CONFIG.title)
    + '&dates=' + gfmt(startD) + '/' + gfmt(endD)
    + '&location=' + encodeURIComponent(CONFIG.place)
    + '&details=' + encodeURIComponent('Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi.');
  $$('[data-gcal]').forEach(function (a) { a.href = gcal; });
  if (CONFIG.mapUrl) $$('[data-map]').forEach(function (a) { a.href = CONFIG.mapUrl; });
  $$('[data-map-embed]').forEach(function (f) {
    if (!CONFIG.mapEmbed) { f.parentNode.hidden = true; return; }
    if (f.getAttribute('src') !== CONFIG.mapEmbed) f.setAttribute('src', CONFIG.mapEmbed);
  });

  /* ---- lịch ngày cưới ---- */
  (function buildCal() {
    var grid = $('#calGrid'); if (!grid) return;
    var html = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(function (w) { return '<span class="wd">' + w + '</span>'; }).join('');
    var first = new Date(startD.getFullYear(), startD.getMonth(), 1).getDay(); // 0 = CN
    var offset = (first + 6) % 7;                         // tuần bắt đầu thứ Hai
    for (var i = 0; i < offset; i++) html += '<span></span>';
    var days = new Date(startD.getFullYear(), startD.getMonth() + 1, 0).getDate();
    for (var d = 1; d <= days; d++) {
      var col = (offset + d - 1) % 7;
      var marked = d === startD.getDate();
      var cls = 'd' + (col === 6 ? ' sun' : '') + (marked ? ' mark' : '');
      var heart = marked ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z"/></svg>' : '';
      html += '<span class="' + cls + '"' + (marked ? ' aria-label="Ngày cưới ' + d + '"' : '') + '>' + heart + '<span>' + d + '</span></span>';
    }
    grid.innerHTML = html;
  })();

  /* ---- album: dựng dải ảnh nhỏ theo CONFIG.album (nếu có khai báo) ---- */
  (function buildThumbs() {
    var list = (CONFIG.album || []).filter(Boolean);
    if (!list.length) return;
    var box = $('#gThumbs');
    var alts = $$('.g-thumb img', box).map(function (im) { return im.alt; });
    box.innerHTML = '';
    list.forEach(function (src, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'g-thumb';
      b.setAttribute('aria-label', 'Xem ảnh ' + (i + 1));
      var m = /(album-\d+)\.jpg$/.exec(src);              // tên chuẩn album-N.jpg → đổi được bằng "Chỉnh sửa ảnh"
      if (m) { b.setAttribute('data-slot', m[1]); b.setAttribute('data-label', 'Ảnh album ' + (i + 1)); b.setAttribute('data-hint', 'Ảnh ngang hoặc dọc'); }
      b.setAttribute('data-full', src);
      var im = document.createElement('img'), thumb = src.replace(/([^\/]+)$/, 'thumbs/$1');
      im.onerror = function () { if (im.getAttribute('src') !== src) im.src = src; };   // chưa có ảnh thu nhỏ → dùng ảnh gốc
      im.src = thumb; im.alt = alts[i] || 'Ảnh cưới Phan Vũ và Quỳnh Như ' + (i + 1); im.loading = 'lazy';
      b.appendChild(im); box.appendChild(b);
    });
  })();

  /* ---- đếm ngược ---- */
  (function countdown() {
    var els = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var now = Date.now(), diff = startD - now;
      if (diff <= 0) {
        $('#countdown').hidden = true;
        var done = $('#countdownDone'); done.hidden = false;
        done.textContent = now < endD.getTime() + 6 * 3600e3 ? 'Hôm nay là ngày vui của chúng mình!' : 'Cảm ơn bạn đã cùng chúng mình đi qua ngày vui.';
        return;
      }
      var s = Math.floor(diff / 1000);
      els.d.textContent = Math.floor(s / 86400);
      els.h.textContent = pad(Math.floor(s % 86400 / 3600));
      els.m.textContent = pad(Math.floor(s % 3600 / 60));
      els.s.textContent = pad(s % 60);
      setTimeout(tick, 1000 - (now % 1000));
    }
    tick();
  })();

  /* ---- nhạc dự phòng: Canon in D (Pachelbel) dạng hộp nhạc, tổng hợp bằng Web Audio ---- */
  var Synth = (function () {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ac, master, bus, timer, step = 0, cycle = 0, nextT = 0, playing = false;
    var BEAT = 60 / 70, EIGHTH = BEAT / 2;
    function f(n) {
      var m = /^([A-G])(#?)(\d)$/.exec(n), base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
      var midi = (+m[3] + 1) * 12 + base + (m[2] ? 1 : 0);
      return 440 * Math.pow(2, (midi - 69) / 12);
    }
    var CH = [
      ['D3', ['D4', 'F#4', 'A4', 'F#4']], ['A2', ['C#4', 'E4', 'A4', 'E4']],
      ['B2', ['D4', 'F#4', 'B4', 'F#4']], ['F#2', ['C#4', 'F#4', 'A4', 'F#4']],
      ['G2', ['D4', 'G4', 'B4', 'G4']], ['D2', ['D4', 'F#4', 'A4', 'F#4']],
      ['G2', ['D4', 'G4', 'B4', 'G4']], ['A2', ['C#4', 'E4', 'A4', 'E4']]
    ];
    var V1 = ['F#5', 'E5', 'D5', 'C#5', 'B4', 'A4', 'B4', 'C#5'];
    var V2 = ['D5', 'C#5', 'B4', 'A4', 'G4', 'F#4', 'G4', 'E4'];
    var V3 = ['D5', 'F#5', 'A5', 'G5', 'F#5', 'D5', 'F#5', 'E5', 'D5', 'B4', 'D5', 'A5', 'G5', 'B5', 'A5', 'G5'];
    function bell(freq, t, dur, vel, type) {
      var o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      o2.type = 'sine'; o2.frequency.value = freq * 2.004; g2.gain.value = 0.16;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vel, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    }
    function schedule() {
      while (nextT < ac.currentTime + 0.15) {
        var s = step % 32, ci = Math.floor(s / 4), c = CH[ci], v = cycle % 4;
        bell(f(c[1][s % 4]), nextT, 1.5, 0.06, 'triangle');
        if (s % 4 === 0) bell(f(c[0]), nextT, 2.6, 0.11);
        if (v === 2) { if (s % 2 === 0) bell(f(V3[s / 2]), nextT, 1.8, 0.13); }
        else if (s % 4 === 0) bell(f((v === 1 || v === 3 ? V2 : V1)[ci]), nextT, 2.4, 0.13);
        nextT += EIGHTH; step++;
        if (step % 32 === 0) cycle++;
      }
    }
    function init() {
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.0001; master.connect(ac.destination);
      var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3400;
      bus = ac.createGain(); bus.connect(lp); lp.connect(master);
      var len = ac.sampleRate * 2.6, ir = ac.createBuffer(2, len, ac.sampleRate);
      for (var ch = 0; ch < 2; ch++) { var data = ir.getChannelData(ch); for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      var verb = ac.createConvolver(); verb.buffer = ir;
      var wet = ac.createGain(); wet.gain.value = 0.32;
      lp.connect(verb); verb.connect(wet); wet.connect(master);
    }
    return {
      unlock: function () {               // gọi ngay trong cú chạm để trình duyệt cho phép phát âm thanh
        try { if (!ac) init(); if (ac.state === 'suspended') ac.resume(); } catch (e) {}
      },
      play: function () {
        try {
          if (!ac) init();
          if (ac.state === 'suspended') ac.resume();
          if (!playing) { nextT = ac.currentTime + 0.08; timer = setInterval(schedule, 50); schedule(); }
          playing = true;
          master.gain.cancelScheduledValues(ac.currentTime);
          master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ac.currentTime);
          master.gain.exponentialRampToValueAtTime(0.7, ac.currentTime + 1.6);
          return true;
        } catch (e) { return false; }
      },
      pause: function () {
        if (!ac || !playing) return;
        playing = false; clearInterval(timer);
        master.gain.cancelScheduledValues(ac.currentTime);
        master.gain.setValueAtTime(master.gain.value, ac.currentTime);
        master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.5);
      },
      get playing() { return playing; }
    };
  })();
  var musicBtn = $('#music');
  function setMusicUI(on) {
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', on ? 'Tắt nhạc nền' : 'Bật nhạc nền');
  }
  /* ---- nhạc nền: phát file CONFIG.musicUrl sau khi mở phong bì; lỗi hoặc không có file → hộp nhạc ---- */
  var Player = (function () {
    var audio = null, mode = null, fadeT = null, resumeOnShow = false;
    if (CONFIG.musicUrl) {
      audio = new Audio();
      audio.loop = true; audio.preload = 'auto'; audio.src = CONFIG.musicUrl;
      audio.addEventListener('error', function () {
        if (mode === 'file') useSynth(); else audio = null;
      });
    }
    function fadeIn() {
      clearInterval(fadeT); audio.volume = 0;
      fadeT = setInterval(function () {
        audio.volume = Math.min(0.85, audio.volume + 0.05);
        if (audio.volume >= 0.85) clearInterval(fadeT);
      }, 90);
    }
    function useSynth() {
      mode = Synth ? 'synth' : null;
      if (!Synth) { musicBtn.hidden = true; return; }
      setMusicUI(Synth.play());
    }
    function playing() { return mode === 'file' ? !audio.paused : !!(Synth && Synth.playing); }
    function play() {
      if (mode === 'file') {
        var p = audio.play(); fadeIn(); setMusicUI(true);
        if (p && p.catch) p.catch(function () { if (mode === 'file') useSynth(); });
      } else if (Synth) setMusicUI(Synth.play());
    }
    function pause() {
      if (mode === 'file') audio.pause(); else if (Synth) Synth.pause();
      setMusicUI(false);
    }
    // tạm dừng khi khách chuyển sang ứng dụng khác, phát tiếp khi quay lại
    document.addEventListener('visibilitychange', function () {
      if (!mode) return;
      if (document.hidden) { resumeOnShow = playing(); if (resumeOnShow) pause(); }
      else if (resumeOnShow) { resumeOnShow = false; play(); }
    });
    return {
      start: function () {
        musicBtn.hidden = false;
        if (Synth) Synth.unlock();
        if (audio) { mode = 'file'; play(); } else useSynth();
      },
      toggle: function () { if (!mode) return; if (playing()) pause(); else play(); }
    };
  })();
  musicBtn.addEventListener('click', function () { Player.toggle(); });

  /* ---- tự cuộn chậm sau khi mở thiệp ----
     Khách chạm, vuốt, lăn chuột hay bấm phím là dừng hẳn để khách tự xem.
     Không tự cuộn nếu máy đặt "giảm chuyển động". */
  var AutoScroll = (function () {
    var SPEED = 50;                                   // điểm ảnh mỗi giây
    var STOP_ON = ['touchstart', 'pointerdown', 'mousedown', 'wheel', 'keydown'];
    var raf = 0, pos = 0, last = 0, stopped = false;
    function stop() {
      if (stopped) return;
      stopped = true; cancelAnimationFrame(raf);
      document.documentElement.classList.remove('auto-scrolling');
      STOP_ON.forEach(function (ev) { window.removeEventListener(ev, stop, true); });
    }
    function step(now) {
      if (stopped) return;
      if (Math.abs(window.pageYOffset - pos) > 40) return stop();     // khách tự kéo thanh cuộn
      var dt = Math.min(now - last, 100) / 1000; last = now;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      pos = Math.min(pos + SPEED * dt, max);
      window.scrollTo(0, pos);
      if (pos >= max) return stop();                                  // tới cuối thiệp
      raf = requestAnimationFrame(step);
    }
    return {
      arm: function (delay) {                       // nghe thao tác của khách ngay, bắt đầu cuộn sau `delay` ms
        if (reduce) return;
        STOP_ON.forEach(function (ev) { window.addEventListener(ev, stop, { capture: true, passive: true }); });
        setTimeout(function () {
          if (stopped) return;
          document.documentElement.classList.add('auto-scrolling');
          pos = window.pageYOffset; last = performance.now();
          raf = requestAnimationFrame(step);
        }, delay);
      }
    };
  })();

  /* ---- mở bì thư ---- */
  var cover = $('#cover'), env = $('#env');
  document.documentElement.classList.add('locked');
  function openInvite() {
    if (env.classList.contains('open')) return;
    Player.start();
    if (API && GUEST.id) apiGet({ action: 'open', id: GUEST.id }).catch(function () {});
    var t = reduce ? [0, 0, 300] : [650, 1800, 2700];
    env.classList.add('open');
    setTimeout(function () { env.classList.add('lifted'); }, t[0]);
    setTimeout(function () { cover.classList.add('leaving'); document.documentElement.classList.remove('locked'); window.scrollTo(0, 0); Reveal.start(); }, t[1]);
    setTimeout(function () { cover.hidden = true; startPetals(); watchFloat(); AutoScroll.arm(2200); }, t[2]);
  }
  env.addEventListener('click', openInvite);

  /* ---- hiệu ứng khi lướt ----
     Mỗi nhóm (data-rv-group) bật cùng lúc khi vào màn hình, các phần tử bên trong nối tiếp nhau theo --d.
     Phần tử lẻ (data-rv, không thuộc nhóm) bật riêng khi chính nó vào màn hình. */
  var Reveal = (function () {
    var on = !reduce && 'IntersectionObserver' in window;
    var root = document.documentElement;
    function mark(el, type, d) {
      if (!el) return;
      el.setAttribute('data-rv', type);
      if (d) el.style.setProperty('--d', d + 'ms');
    }
    function each(sel, fn, ctx) { $$(sel, ctx).forEach(fn); }
    function group(el) { if (el) el.setAttribute('data-rv-group', ''); }

    // Ảnh bìa: ảnh thu nhẹ, rồi tên cô dâu chú rể "được viết" từng dòng
    var hero = $('#top');
    group(hero);
    mark($('.hero-media img'), 'kb');
    mark($('.hero .eyebrow'), 'up', 400);
    var hn = $$('.hero-names > span');
    mark(hn[0], 'write', 600); mark(hn[1], 'pop', 1150); mark(hn[2], 'write', 1250);
    mark($('.hero-date'), 'up', 1800);

    // Tiêu đề mỗi phần: chữ nhỏ → chữ viết tay → chỉ vàng → câu dẫn
    each('.sh', function (h) {
      group(h);
      mark($('.eyebrow', h), 'up', 0);
      mark($('.sh-title, .invite-to', h), 'write', 100);
      mark($('.rule', h), 'pop', 350); $('.rule', h) && $('.rule', h).setAttribute('data-rv', 'draw');
      mark($('.lede, .invite-line', h), 'blur', 450);
    });

    // Lời ngỏ + đếm ngược
    mark($('#loi-ngo > .lede'), 'blur');
    var cd = $('#countdown'); group(cd);
    each('#countdown > div', function (c, i) { mark(c, 'up', 100 * i); });
    each('.btn-row', function (r) { if (!r.closest('.event')) mark(r, 'up', 100); });

    // Chú rể & cô dâu: khung vòm vén lên, tên viết ra, thông tin gia đình hiện sau
    each('.person', function (pp, i) {
      var k = i * 180;
      group(pp);
      mark($('.arch', pp), 'up', k); $('.arch', pp).setAttribute('data-rv', 'arch');
      mark($('.role', pp), 'up', k + 400);
      mark($('.pname', pp), 'write', k + 500);
      mark($('.family', pp), 'up', k + 750);
    });

    // Thẻ Lễ Vu Quy: thẻ nổi lên, ngày 17 bật ra giữa "Thứ Bảy" và "Tháng 10"
    var ev = $('.event'); group(ev);
    mark(ev, 'zoom', 0);
    mark($('.event-title', ev), 'write', 200);
    mark($('.event-at', ev), 'up', 400);
    mark($('.trio > span:first-child', ev), 'left', 550);
    mark($('.trio > strong', ev), 'pop', 600);
    mark($('.trio > span:last-child', ev), 'right', 550);
    mark($('.year', ev), 'up', 700);
    mark($('.lunar', ev), 'blur', 800);
    var venue = $('.venue', ev); mark(venue, 'up', 150); venue.setAttribute('data-solo', '');

    // Lịch: các ngày hiện lần lượt, ngày 17 đập nhịp tim
    var cal = $('.cal'); group(cal);
    mark($('.cal-head', cal), 'up', 0);
    each('.cal-grid > span', function (c, i) { mark(c, c.classList.contains('wd') ? 'up' : 'pop', 100 + i * 10); });

    // Album: ảnh lớn nổi lên, dải ảnh nhỏ trượt vào lần lượt
    group($('#gallery'));
    mark($('#gStage'), 'zoom', 0);
    each('#gThumbs .g-thumb', function (t, i) { mark(t, 'up', 250 + i * 90); });

    // Form & sổ lưu bút
    each('.sheet', function (sh) { mark(sh, 'zoom'); });
    mark($('#wall'), 'up', 100);

    // Lời cảm ơn
    var th = $('#cam-on'); group(th);
    mark($('.ty', th), 'write', 0);
    mark($('.msg', th), 'blur', 450);
    mark($('.sign', th), 'up', 700);
    var thImg = $('.thanks-photo img'); mark(thImg, 'kb', 200); $('.thanks-photo').setAttribute('data-solo', '');
    thImg.setAttribute('data-solo', '');

    if (on) root.classList.add('rv-on');

    function show(el) { el.classList.add('in'); }
    function revealAll() { $$('[data-rv]').forEach(show); }
    function start() {
      if (!on) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target; io.unobserve(el);
          show(el);
          if (el.hasAttribute('data-rv-group')) {
            $$('[data-rv]', el).forEach(function (c) { if (!c.closest('[data-solo]') || c === el) show(c); });
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      $$('[data-rv-group]').forEach(function (g) { io.observe(g); });
      $$('[data-rv]').forEach(function (el) {
        var g = el.parentElement && el.parentElement.closest('[data-rv-group]');
        var solo = el.closest('[data-solo]');
        if (el.hasAttribute('data-rv-group')) return;
        if (!g || (solo && g.contains(solo))) io.observe(el);
      });
      // parallax nhẹ cho ảnh bìa: ảnh trôi chậm hơn trang, chữ mờ dần khi lướt qua
      var media = $('.hero-media'), text = $('.hero-text'), ticking = false;
      function frame() {
        ticking = false;
        var y = window.pageYOffset, h = hero.offsetHeight;
        if (y > h * 1.2) return;
        media.style.transform = 'translate3d(0,' + (y * 0.32).toFixed(1) + 'px,0)';
        text.style.transform = 'translate3d(0,' + (y * -0.12).toFixed(1) + 'px,0)';
        text.style.opacity = Math.max(0, 1 - y / (h * 0.55)).toFixed(3);
      }
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    }
    return { start: start, revealAll: revealAll };
  })();

  /* ---- nút nổi "Xác nhận tham dự" ---- */
  function watchFloat() {
    var pill = $('#floatRsvp');
    if (!('IntersectionObserver' in window)) return;
    var vis = { hero: true, rsvp: false, end: false };
    function upd() { pill.classList.toggle('off', vis.hero || vis.rsvp || vis.end || rsvpSent()); }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.dataset.k] = e.isIntersecting; }); upd();
    }, { threshold: 0.05 });
    $('#top').dataset.k = 'hero'; $('#xac-nhan').dataset.k = 'rsvp'; $('#cam-on').dataset.k = 'end';
    io.observe($('#top')); io.observe($('#xac-nhan')); io.observe($('#cam-on'));
    watchFloat.upd = upd;
  }

  /* ---- album: ảnh lớn + dải ảnh nhỏ (mũi tên, vuốt, phím ←/→, chạm ảnh nhỏ) ---- */
  var thumbs = $$('#gThumbs .g-thumb'), slides = [], gi = 0, galleryNear = false;
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fullSrc(i) {                      // ảnh lớn: bản đầy đủ; ảnh vừa đổi trong chế độ chỉnh sửa thì lấy luôn ảnh mới
    var im = thumbs[i].querySelector('img'), s = im.getAttribute('src');
    return /^(blob|data):/.test(s) ? s : (thumbs[i].getAttribute('data-full') || s);
  }
  function setSlideSrc(i) {
    var im = thumbs[i].querySelector('img'), fg = slides[i].querySelector('.fg');
    slides[i].querySelector('.bg').src = im.getAttribute('src');      // nền mờ dùng ảnh nhỏ cho nhẹ
    fg.src = fullSrc(i); fg.alt = im.alt; slides[i].setAttribute('data-loaded', '');
  }
  function ensure(i) { i = (i + thumbs.length) % thumbs.length; if (galleryNear && !slides[i].hasAttribute('data-loaded')) setSlideSrc(i); }
  function preload() { ensure(gi); ensure(gi + 1); ensure(gi - 1); }
  thumbs.forEach(function (t, i) {
    var sl = document.createElement('div'); sl.className = 'g-slide';
    sl.innerHTML = '<img class="bg" alt="" aria-hidden="true" decoding="async"><img class="fg" decoding="async">';
    $('#gSlides').appendChild(sl); slides.push(sl);
    t.addEventListener('click', function () { goTo(i); });
  });
  if ('IntersectionObserver' in window) {
    var gio = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { galleryNear = true; preload(); gio.disconnect(); }
    }, { rootMargin: '800px 0px' });
    gio.observe($('#gallery'));
  } else { galleryNear = true; }
  function goTo(i) {
    gi = (i + thumbs.length) % thumbs.length;
    preload();
    slides.forEach(function (s, k) { s.classList.toggle('on', k === gi); });
    thumbs.forEach(function (t, k) { t.classList.toggle('on', k === gi); t.setAttribute('aria-current', k === gi ? 'true' : 'false'); });
    $('#gCount').textContent = pad2(gi + 1) + ' / ' + pad2(thumbs.length);
    var strip = $('#gThumbs'), t = thumbs[gi];          // đưa ảnh nhỏ đang chọn vào giữa dải, không cuộn cả trang
    if (strip.scrollTo) strip.scrollTo({ left: t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }
  goTo(0);
  // mép mờ cho biết dải ảnh còn ảnh ở bên trái / phải
  (function edges() {
    var strip = $('#gThumbs');
    function upd() {
      var max = strip.scrollWidth - strip.clientWidth, x = strip.scrollLeft;
      var l = x > 4, r = x < max - 4;
      strip.setAttribute('data-more', max <= 4 ? '' : l && r ? 'both' : r ? 'right' : l ? 'left' : '');
    }
    strip.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    $$('img', strip).forEach(function (im) { im.addEventListener('load', upd); });
  })();
  $('#gPrev').addEventListener('click', function () { goTo(gi - 1); });
  $('#gNext').addEventListener('click', function () { goTo(gi + 1); });
  $('#gZoom').addEventListener('click', function () { openLb(gi); });
  $('#gSlides').addEventListener('click', function () { openLb(gi); });
  $('#gStage').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(gi - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(gi + 1); }
  });
  var gx = null, gMoved = false;
  $('#gStage').addEventListener('pointerdown', function (e) { gx = e.clientX; gMoved = false; });
  $('#gStage').addEventListener('pointerup', function (e) {
    if (gx === null) return; var dx = e.clientX - gx; gx = null;
    if (Math.abs(dx) > 40) { gMoved = true; goTo(gi + (dx < 0 ? 1 : -1)); }
  });
  $('#gSlides').addEventListener('click', function (e) { if (gMoved) { e.stopImmediatePropagation(); gMoved = false; } }, true);
  // ảnh nhỏ được đổi (chế độ chỉnh sửa ảnh) → ảnh lớn đổi theo
  if (window.MutationObserver) new MutationObserver(function (ms) {
    ms.forEach(function (m) { var k = thumbs.indexOf(m.target.parentNode); if (k > -1 && slides[k].hasAttribute('data-loaded')) setSlideSrc(k); });
  }).observe($('#gThumbs'), { subtree: true, attributes: true, attributeFilter: ['src'] });

  /* ---- xem ảnh toàn màn hình ---- */
  var shots = thumbs.map(function (t) { return t.querySelector('img'); }), lb = $('#lb'), lbImg = $('#lbImg'), cur = 0, lastFocus;
  function show(i) {
    cur = (i + shots.length) % shots.length;
    lbImg.src = fullSrc(cur); lbImg.alt = shots[cur].alt;
    $('#lbCount').textContent = pad2(cur + 1) + ' / ' + pad2(shots.length);
  }
  function openLb(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.documentElement.classList.add('locked'); $('#lbClose').focus(); }
  function closeLb() { lb.hidden = true; document.documentElement.classList.remove('locked'); goTo(cur); if (lastFocus) lastFocus.focus(); }
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function () { show(cur - 1); });
  $('#lbNext').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  var sx = null;
  lb.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  lb.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 45) show(cur + (dx < 0 ? 1 : -1)); });

  /* ---- xác nhận tham dự ---- */
  var demoMode = !API;
  $$('[data-demo]').forEach(function (el) { el.hidden = !demoMode; });
  var guests = 1, gOut = $('#guests');
  $('#g-minus').addEventListener('click', function () { guests = Math.max(1, guests - 1); gOut.textContent = guests; });
  $('#g-plus').addEventListener('click', function () { guests = Math.min(10, guests + 1); gOut.textContent = guests; });
  var form = $('#rsvpForm'), done = $('#rsvpDone');
  function syncAttend() { $('#guestsField').hidden = !$('#attend-yes').checked; }
  $$('input[name="attend"]').forEach(function (r) { r.addEventListener('change', syncAttend); });
  function rsvpSent() { return !done.hidden; }
  function showDone(r) {
    $('#rsvpDoneTitle').textContent = 'Cảm ơn ' + r.name + '!';
    $('#rsvpDoneText').textContent = r.attend === 'yes'
      ? 'Hẹn gặp ' + (r.guests > 1 ? 'cả nhà' : 'bạn') + ' lúc ' + EVENT.time + ', ' + EVENT.weekday + ' ' + EVENT.date + ' tại ' + EVENT.venue + ' nhé.'
      : 'Tiếc quá! Cảm ơn bạn đã báo cho chúng mình biết. Mong sớm gặp lại bạn.';
    setSync(API ? (r.sent ? 'sent' : r.failed ? 'failed' : 'sending') : '');
    form.hidden = true; done.hidden = false;
    if (watchFloat.upd) watchFloat.upd();
  }
  function setSync(state) {
    var el = $('#rsvpSync');
    el.hidden = !state; el.setAttribute('data-state', state);
    el.querySelector('span').textContent = state === 'sending' ? 'Đang gửi đến cô dâu chú rể'
      : state === 'sent' ? '✓ Đã gửi đến cô dâu chú rể' : state === 'failed' ? 'Chưa gửi được vì mạng yếu.' : '';
    $('#rsvpRetry').hidden = state !== 'failed';
  }
  var current = null;
  function sendRsvp(r) {
    current = r; r.failed = false; setSync('sending');
    apiPost({ type: 'rsvp', hp: $('#rsvp-hp').value, id: r.id, name: r.name, side: r.side, attend: r.attend, guests: r.guests, note: r.note })
      .then(function () { r.sent = true; }, function () { r.failed = true; })
      .then(function () {
        store.set('vn-rsvp', r);
        if (current === r && !done.hidden) setSync(r.sent ? 'sent' : 'failed');
      });
  }
  $('#rsvpRetry').addEventListener('click', function () { if (current) sendRsvp(current); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#rsvpErr'), name = $('#rsvp-name').value.trim();
    if (!name) { err.textContent = 'Bạn nhập giúp chúng mình họ tên nhé.'; err.hidden = false; $('#rsvp-name').focus(); return; }
    err.hidden = true;
    var r = {
      id: GUEST.id,
      name: name,
      side: (form.querySelector('input[name="side"]:checked') || {}).value,
      attend: $('#attend-yes').checked ? 'yes' : 'no',
      guests: $('#attend-yes').checked ? guests : 0,
      note: $('#rsvp-note').value.trim(),
      at: new Date().toISOString()
    };
    store.set('vn-rsvp', r);
    showDone(r);                       // khách thấy kết quả ngay, phần gửi chạy ngầm
    if (API) sendRsvp(r);
  });
  $('#rsvpEdit').addEventListener('click', function () {
    done.hidden = true; form.hidden = false; $('#rsvp-name').focus();
    if (watchFloat.upd) watchFloat.upd();
  });
  var savedR = store.get('vn-rsvp', null);
  if (savedR && savedR.name) {
    $('#rsvp-name').value = savedR.name;
    showDone(savedR);
    if (API && !savedR.sent) sendRsvp(savedR);   // lần trước chưa gửi xong → gửi lại
  } else {
    // điền sẵn theo link mời riêng
    if (GUEST.name) $('#rsvp-name').value = GUEST.name;
    if (GUEST.side) $$('input[name="side"]').forEach(function (r) { r.checked = r.value === GUEST.side; });
  }

  /* ---- sổ lưu bút ---- */
  var wall = $('#wall'), wishes = API ? [] : store.get('vn-wishes', []);
  var emptyEl = wall.querySelector('.wall-empty'), EMPTY_TEXT = emptyEl.textContent;
  function renderWall() {
    if (!wishes.length) return;
    wall.innerHTML = '';
    wishes.slice().reverse().forEach(function (w) {
      var card = document.createElement('article'); card.className = 'wish' + (w.state ? ' ' + w.state : '');
      var p = document.createElement('p'); p.textContent = '“' + w.text + '”';
      var b = document.createElement('b'); b.textContent = '— ' + w.name;
      card.appendChild(p); card.appendChild(b);
      if (w.state === 'sending' || w.state === 'failed') {
        var st = document.createElement('div'); st.className = 'wstate';
        st.textContent = w.state === 'sending' ? 'Đang gửi…' : 'Chưa gửi được.';
        if (w.state === 'failed') {
          var rb = document.createElement('button'); rb.type = 'button'; rb.className = 'linkish'; rb.textContent = 'Gửi lại';
          rb.addEventListener('click', function () { sendWish(w); });
          st.appendChild(rb);
        }
        card.appendChild(st);
      }
      wall.appendChild(card);
    });
  }
  function cacheWishes() { if (API) store.set('vn-wishes-cache', wishes.filter(function (w) { return !w.state; })); }
  function sendWish(w) {
    w.state = 'sending'; renderWall();
    apiPost({ type: 'wish', hp: $('#wish-hp').value, id: GUEST.id, name: w.name, text: w.text })
      .then(function () { w.state = ''; cacheWishes(); toast('Đã gửi lời chúc đến Vũ & Như'); },
            function () { w.state = 'failed'; toast('Chưa gửi được lời chúc. Bạn bấm "Gửi lại" nhé.'); })
      .then(renderWall);
  }
  function animateNewest() { var c = wall.firstElementChild; if (c) c.classList.add('new'); }
  if (API) {
    // sổ lưu bút chung: hiện ngay bản đã lưu lần trước trên máy, rồi cập nhật bản mới từ Google Sheet
    wishes = store.get('vn-wishes-cache', []);
    if (wishes.length) renderWall(); else emptyEl.textContent = 'Đang tải lời chúc…';
    apiGet({ action: 'wishes' }).then(function (j) {
      var mine = wishes.filter(function (w) { return w.state; });        // lời chúc đang gửi dở
      wishes = ((j && j.wishes) || []).slice().reverse().concat(mine);
      cacheWishes();
      if (wishes.length) renderWall(); else emptyEl.textContent = EMPTY_TEXT;
    }, function () { if (!wishes.length) emptyEl.textContent = 'Chưa tải được lời chúc. Bạn thử tải lại trang nhé.'; });
  } else renderWall();
  if (GUEST.name) $('#wish-name').value = GUEST.name;
  $$('.suggest button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ta = $('#wish-text');
      ta.value = (ta.value.trim() ? ta.value.trim() + ' ' : '') + btn.textContent + '!';
      ta.focus();
    });
  });
  $('#wishForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#wish-name').value.trim(), text = $('#wish-text').value.trim();
    $('#wishErr').hidden = !!(name && text);
    if (!name || !text) return;
    var w = { name: name, text: text, at: new Date().toISOString() };
    wishes.push(w); $('#wish-text').value = '';
    if (!API) { renderWall(); animateNewest(); store.set('vn-wishes', wishes); toast('Đã thêm lời chúc vào sổ lưu bút'); return; }
    sendWish(w); animateNewest();     // lời chúc hiện ngay trên sổ, phần gửi chạy ngầm
  });

  /* ---- chỉnh sửa ảnh ----
     Bản trên Claude: người có quyền sửa thấy nút "Chỉnh sửa ảnh"; ảnh mới được lưu thẳng vào thiệp.
     Bản file .html: thêm #chinh-sua vào cuối link để hiện nút; bấm Lưu sẽ tải về file thiệp mới. */
  (function editor() {
    var slots = $$('[data-slot]');
    var MAX = { groom: 1000, bride: 1000 };
    var originals = {}, changes = {}, mode = null, art = null, editing = false, current = null;
    var btn = $('#editBtn'), bar = $('#editBar'), picker = $('#editPick'), saveBtn = $('#editSave'), countEl = $('#editCount');
    var CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
    slots.forEach(function (s) { originals[s.dataset.slot] = s.querySelector('img').getAttribute('src'); });

    function askedForFileMode() { return /(^|[#?&])chinh-sua(\b|$)/.test(location.hash + location.search); }
    function enable(m) { mode = m; btn.hidden = false; }
    if (window.claude && typeof window.claude.use === 'function') {
      Promise.all([window.claude.use('artifact'), window.claude.use('user')]).then(function (r) {
        art = r[0];
        if (art && r[1]) return r[1].canEdit().then(function (ok) { if (ok) enable('artifact'); });
      }, function () {});
    } else if (askedForFileMode()) enable('file');   // chỉ bản file .html mở ngoài Claude mới tải file về

    function update() {
      var n = Object.keys(changes).length;
      countEl.textContent = n ? 'Đã đổi ' + n + ' ảnh, bấm Lưu để giữ lại' : 'Chạm vào ảnh bất kỳ để thay';
      saveBtn.disabled = !n;
      saveBtn.textContent = mode === 'file' ? 'Lưu & tải file' : 'Lưu thay đổi';
      slots.forEach(function (s) {
        var on = !!changes[s.dataset.slot];
        s.classList.toggle('changed', on);
        var t = s.querySelector('.edit-chip > span'); if (t) t.textContent = on ? 'Đã đổi · đổi lại' : 'Đổi ảnh';
      });
    }
    function setEditing(on) {
      editing = on;
      if (on) Reveal.revealAll();
      document.body.classList.toggle('editing', on);
      bar.hidden = !on; btn.hidden = on || !mode;
      slots.forEach(function (s) {
        var chip = s.querySelector('.edit-chip');
        if (on && !chip) {
          chip = document.createElement(s.tagName === 'BUTTON' ? 'span' : 'button');
          chip.className = 'edit-chip';
          if (chip.tagName === 'BUTTON') { chip.type = 'button'; chip.setAttribute('aria-label', 'Đổi ' + (s.dataset.label || 'ảnh').toLowerCase()); }
          chip.innerHTML = CAM + '<span>Đổi ảnh</span><small></small>';
          chip.querySelector('small').textContent = s.dataset.hint || '';
          s.appendChild(chip);
        }
        if (!on && chip) chip.remove();
      });
      update();
    }
    function revertAll() {
      Object.keys(changes).forEach(function (slot) {
        URL.revokeObjectURL(changes[slot].url);
        $('[data-slot="' + slot + '"] img').src = originals[slot];
      });
      changes = {};
    }

    btn.addEventListener('click', function () { setEditing(true); });
    $('#editCancel').addEventListener('click', function () { revertAll(); setEditing(false); });
    document.addEventListener('click', function (e) {
      if (!editing) return;
      var s = e.target.closest && e.target.closest('[data-slot]');
      if (!s) return;
      e.preventDefault(); e.stopPropagation();
      current = s; picker.value = ''; picker.click();
    }, true);

    function shrink(file, max) {
      return new Promise(function (resolve, reject) {
        var url = URL.createObjectURL(file), img = new Image();
        img.onload = function () {
          var k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          var c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          c.toBlob(function (b) { if (b) resolve(b); else reject(); }, 'image/jpeg', 0.84);
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(); };
        img.src = url;
      });
    }
    picker.addEventListener('change', function () {
      var file = picker.files && picker.files[0], s = current;
      if (!file || !s) return;
      var slot = s.dataset.slot;
      s.classList.add('busy');
      shrink(file, MAX[slot] || 1600).then(function (blob) {
        if (changes[slot]) URL.revokeObjectURL(changes[slot].url);
        changes[slot] = { blob: blob, url: URL.createObjectURL(blob) };
        s.querySelector('img').src = changes[slot].url;
        update();
      }, function () {
        toast('Không đọc được ảnh này. Bạn thử ảnh JPG hoặc PNG nhé.');
      }).then(function () { s.classList.remove('busy'); });
    });

    function saveToArtifact(list) {
      var files = {};
      list.forEach(function (slot) { files['img/' + slot + '.jpg'] = { content: changes[slot].blob, contentType: 'image/jpeg' }; });
      return art.publish(files).then(function () {
        return 'Đã lưu. Khách mở thiệp sẽ thấy ảnh mới.';
      }, function (err) {
        var code = err && err.code;
        if (code === 'conflict') return Promise.reject({ msg: '' });
        if (code === 'not_writer' || code === 'not_granted' || code === 'consent_required') return Promise.reject({ msg: 'Bạn chỉ có quyền xem thiệp này nên không đổi được ảnh.', readOnly: true });
        if (code === 'capability_disabled' || code === 'capability_removed' || code === 'not_declared') return Promise.reject({ msg: 'Chưa lưu được ở chế độ này. Nếu thiệp đang chia sẻ công khai, hãy tạm tắt chia sẻ công khai rồi lưu lại.' });
        if (code === 'too_large') return Promise.reject({ msg: 'Ảnh quá nặng. Bạn thử ảnh nhỏ hơn nhé.' });
        if (code === 'rate_limited') return Promise.reject({ msg: 'Bạn vừa lưu liên tục. Đợi một lát rồi bấm Lưu lại.' });
        return Promise.reject({ msg: 'Chưa lưu được. Bạn thử lại sau ít phút.' });
      });
    }
    function toDataURL(blob) {
      return new Promise(function (resolve, reject) {
        var fr = new FileReader(); fr.onload = function () { resolve(fr.result); }; fr.onerror = reject; fr.readAsDataURL(blob);
      });
    }
    function saveToFile(list) {
      return Promise.all(list.map(function (slot) {
        return toDataURL(changes[slot].blob).then(function (d) { return [slot, d]; });
      })).then(function (pairs) {
        var html = SOURCE;
        pairs.forEach(function (p) {
          var re = new RegExp('(data-slot="' + p[0] + '"[\\s\\S]*?<img[^>]*?\\ssrc=")[^"]*(")');
          html = html.replace(re, function (_, a, b) { return a + p[1] + b; });
        });
        SOURCE = html;
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
        a.download = 'thiep-cuoi-vu-nhu.html';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
        return 'Đã tải file thiệp mới. Dùng file này thay cho file cũ.';
      }, function () { return Promise.reject({ msg: 'Chưa tạo được file mới. Bạn thử lại nhé.' }); });
    }
    saveBtn.addEventListener('click', function () {
      var list = Object.keys(changes); if (!list.length) return;
      saveBtn.disabled = true; saveBtn.textContent = 'Đang lưu…';
      (mode === 'artifact' ? saveToArtifact(list) : saveToFile(list)).then(function (msg) {
        list.forEach(function (slot) { originals[slot] = changes[slot].url; });
        changes = {}; setEditing(false); toast(msg);
      }, function (e) {
        if (e && e.readOnly) { revertAll(); mode = null; setEditing(false); }
        else update();
        if (e && e.msg) toast(e.msg);
      });
    });
  })();

  /* ---- cánh hoa rơi ---- */
  function startPetals() {
    if (reduce) return;
    var cv = $('#petals'), ctx = cv.getContext('2d'); if (!ctx) return;
    var W, H, dpr = Math.min(window.devicePixelRatio || 1, 2), P = [];
    var colors = ['rgba(255,253,249,.92)', 'rgba(244,224,214,.88)', 'rgba(234,216,190,.85)'];
    function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    function spawn(p, top) {
      p.x = Math.random() * W; p.y = top ? -20 : Math.random() * H;
      p.r = 5 + Math.random() * 6; p.vy = .35 + Math.random() * .55; p.sw = Math.random() * 6.28;
      p.rot = Math.random() * 6.28; p.vr = (Math.random() - .5) * .02; p.c = colors[(Math.random() * 3) | 0];
      return p;
    }
    var n = W < 600 ? 12 : 18;
    for (var i = 0; i < n; i++) P.push(spawn({}, false));
    var running = true;
    document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(frame); });
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.sw += .012; p.y += p.vy; p.x += Math.sin(p.sw) * .45; p.rot += p.vr;
        if (p.y > H + 20) spawn(p, true);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.shadowColor = 'rgba(120,90,60,.18)'; ctx.shadowBlur = 3;
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .62, 0, 0, 6.283); ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();

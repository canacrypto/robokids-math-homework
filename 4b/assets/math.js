/* =========================================================
   School Math · math.js
   One question bank per session (banks/L4A_x_y.js) feeds:
     - homework page   (version A of each item, self-check + result code)
     - opening quiz    (version B twins of last homework + hard + spaced)
     - retry practice  (version C, new numbers, unscored)
     - quiz walkthrough slides in the lesson deck
   Also: numeric questions in the deck, place-value builder,
   rounding number line.
   ========================================================= */
(function () {
  "use strict";
  var MK = window.MathKit = {};
  window.MATH_BANKS = window.MATH_BANKS || {};
  window.MATH_QUIZZES = window.MATH_QUIZZES || {};

  /* ---------- helpers ---------- */
  // "482 615" -> keep digit groups together on one line
  MK.fmt = function (s) {
    if (s == null) return "";
    s = String(s);
    var prev;
    do { prev = s; s = s.replace(/(\d) (\d{3})(?!\d)/g, "$1 $2"); } while (s !== prev);
    return s;
  };
  MK.group = function (n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  MK.norm = function (v) {
    return String(v).replace(/[\s,   ]/g, "").toLowerCase();
  };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var LETTERS = "ABCDEFG";

  /* ---------- number to words (0 – 1 000 000) ---------- */
  var ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  var TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function under1000(n) {
    var out = [];
    if (n >= 100) { out.push(ONES[Math.floor(n / 100)] + " hundred"); n %= 100; }
    if (n >= 20) { out.push(TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "")); }
    else if (n > 0) { out.push(ONES[n]); }
    return out.join(" ");
  }
  MK.words = function (n) {
    n = Math.floor(+n);
    if (n === 0) return "zero";
    if (n === 1000000) return "one million";
    var th = Math.floor(n / 1000), rest = n % 1000, out = [];
    if (th) out.push(under1000(th) + " thousand");
    if (rest) out.push(under1000(rest));
    return out.join(" ");
  };
  MK.expanded = function (n) {
    var s = String(Math.floor(+n)), parts = [];
    for (var i = 0; i < s.length; i++) {
      var d = +s[i]; if (!d) continue;
      parts.push(MK.group(d * Math.pow(10, s.length - 1 - i)));
    }
    return parts.length ? parts.join(" + ") : "0";
  };

  /* ---------- banks ---------- */
  MK.bank = function (id, data) { data.id = id; window.MATH_BANKS[id] = data; };
  MK.quiz = function (id, data) { data.id = id; window.MATH_QUIZZES[id] = data; };

  // ref: {from:"L4A_1_1", id:"H3", v:"B", tag:"..."}
  MK.resolve = function (ref) {
    var bank = window.MATH_BANKS[ref.from];
    if (!bank) throw new Error("Bank not loaded: " + ref.from);
    var all = (bank.items || []).concat(bank.bridge || []);
    var base = null;
    for (var i = 0; i < all.length; i++) if (all[i].id === ref.id) base = all[i];
    if (!base) throw new Error("Item " + ref.id + " not in " + ref.from);
    var ver = (ref.v && base[ref.v]) ? base[ref.v] : base;
    return {
      ref: ref.from + "-" + ref.id + (ref.v ? "-" + ref.v : ""),
      skill: base.skill, hard: !!base.hard, tag: ref.tag || "",
      q: ver.q, vis: ver.vis || "", options: ver.options || null, ans: ver.ans,
      hint: ver.hint || base.hint || "", explain: ver.explain || ""
    };
  };

  function isRight(item, given) {
    if (item.options) return given === item.ans;
    return given !== "" && MK.norm(given) === MK.norm(item.ans);
  }
  function answerText(item) {
    return item.options ? LETTERS[item.ans] + " · " + MK.fmt(item.options[item.ans]) : MK.group(item.ans);
  }

  /* ---------- build one question block ---------- */
  // mode: "hw" (check per question, hint then answer), "quiz" (answer only, graded at end), "practice" (like hw, unscored)
  function buildQ(item, num, mode) {
    var q = el("div", "q");
    q.dataset.ref = item.ref;
    var head = el("div", "q-head");
    head.appendChild(el("span", "quiz-q-num", "Q" + num));
    head.appendChild(el("span", "q-topic", esc(item.skill || "")));
    if (item.hard && mode !== "quiz") head.appendChild(el("span", "hard-tag", "CHALLENGE"));
    q.appendChild(head);
    q.appendChild(el("div", "q-text", MK.fmt(item.q)));
    if (item.vis) q.appendChild(el("div", "q-vis", item.vis));

    var state = { tries: 0, firstTry: null, value: null, done: false };
    q._state = state; q._item = item;
    var fb = el("div", "mfb");

    function feedback(ok) {
      state.tries++;
      if (state.tries === 1) state.firstTry = ok;
      if (ok) {
        state.done = true;
        fb.className = "mfb ok";
        fb.innerHTML = (state.firstTry ? "<b>✓ That's right!</b>" : "<b>✓ Right on the second try.</b> It still goes in your code as \"missed\" so your teacher knows to review it.") + (item.explain ? '<div class="why">' + MK.fmt(item.explain) + "</div>" : "");
        q.classList.add(state.firstTry ? "is-right" : "is-wrong", "locked");
        q.querySelectorAll(".quiz-option").forEach(function (o) { o.classList.add("locked"); });
      } else if (state.tries === 1) {
        fb.className = "mfb hint";
        fb.innerHTML = "<b>Not quite. Try again.</b>" + (item.hint ? '<div class="why">💡 Hint: ' + MK.fmt(item.hint) + "</div>" : "");
      } else {
        state.done = true;
        fb.className = "mfb reveal";
        fb.innerHTML = "<b>The answer is " + answerText(item) + ".</b>" + (item.explain ? '<div class="why">' + MK.fmt(item.explain) + "</div>" : "");
        q.classList.add("is-wrong", "locked");
        q.querySelectorAll(".quiz-option").forEach(function (o) { o.classList.add("locked"); });
      }
      if (q._onChange) q._onChange();
    }

    if (item.options) {
      var box = el("div", "quiz-options");
      item.options.forEach(function (o, i) {
        var opt = el("div", "quiz-option", '<div class="letter">' + LETTERS[i] + '</div><div class="opt-text">' + MK.fmt(o) + "</div>");
        opt.addEventListener("click", function () {
          if (state.done || q.classList.contains("locked")) return;
          if (mode === "quiz") {
            box.querySelectorAll(".quiz-option").forEach(function (x) { x.classList.remove("picked"); });
            opt.classList.add("picked"); state.value = i;
            if (q._onChange) q._onChange();
            return;
          }
          if (opt.classList.contains("wrong")) return;
          var ok = i === item.ans;
          opt.classList.add(ok ? "correct" : "wrong");
          if (!ok && state.tries >= 1) box.children[item.ans].classList.add("correct");
          feedback(ok);
        });
        box.appendChild(opt);
      });
      q.appendChild(box);
    } else {
      var row = el("div", "num-row");
      var inp = el("input", "num-input");
      inp.type = "text"; inp.inputMode = "numeric"; inp.autocomplete = "off"; inp.placeholder = "Your answer";
      row.appendChild(inp);
      if (mode !== "quiz") {
        var chk = el("button", "btn teal", "Check");
        var go = function () {
          if (state.done || !inp.value.trim()) return;
          var ok = isRight(item, inp.value);
          inp.classList.remove("ok", "no"); inp.classList.add(ok ? "ok" : "no");
          feedback(ok);
          if (state.done) { inp.disabled = true; chk.disabled = true; }
        };
        chk.addEventListener("click", go);
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
        row.appendChild(chk);
      } else {
        inp.addEventListener("input", function () { state.value = inp.value; if (q._onChange) q._onChange(); });
      }
      q.appendChild(row);
      q._input = inp;
    }
    q.appendChild(fb);
    q._fb = fb;
    return q;
  }

  /* ---------- result code ---------- */
  MK.code = function (prefix, name, right, total, missed) {
    return prefix + " · " + (name || "?") + " · " + right + "/" + total + " · missed: " + (missed.length ? missed.join(", ") : "none");
  };
  function codeBox(code) {
    var b = el("div", "code-box");
    var t = el("span", "code-text", esc(code));
    var c = el("button", "btn ghost", "Copy code");
    c.addEventListener("click", function () {
      var done = function () { c.textContent = "Copied ✓"; setTimeout(function () { c.textContent = "Copy code"; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, function () { selectText(t); });
      else selectText(t);
    });
    b.appendChild(t); b.appendChild(c);
    return b;
  }
  function selectText(node) {
    var r = document.createRange(); r.selectNodeContents(node);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  function band(right, total) {
    var p = right / total;
    if (p === 1) return ["band-5", "Perfect: every one right"];
    if (p >= 0.8) return ["band-5", "Great work"];
    if (p >= 0.6) return ["band-3", "Getting there: review the misses"];
    return ["band-1", "Let's review this together"];
  }
  function bandHTML(right, total) { var b = band(right, total); return '<div class="score-band ' + b[0] + '">' + b[1] + "</div>"; }
  function store(key, val) { try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; } }

  /* ---------- HOMEWORK PAGE ---------- */
  MK.homeworkPage = function (lessonId, rootId) {
    var bank = window.MATH_BANKS[lessonId];
    var root = document.getElementById(rootId || "mathRoot");
    var code = "H" + lessonId.replace(/^L/, "");
    var items = bank.items.map(function (it) { return MK.resolve({ from: lessonId, id: it.id, v: "A" }); });

    root.appendChild(el("div", "page-hero",
      '<div class="title-eyebrow">' + esc(bank.program) + " · Session " + bank.session + ' · Homework</div>' +
      "<h1>" + esc(bank.title) + "</h1>" +
      "<p>" + items.length + " questions. Press <b>Check</b> after each one. If you're wrong, you get a hint and one more try. When you're done, press <b>Finish</b> and send your result code to your teacher.</p>" +
      '<div class="meta-row"><span class="meta-chip">~' + (items.length * 2) + ' minutes</span><span class="meta-chip">' + items.length + ' questions</span><span class="meta-chip">Calculator: no</span></div>'));

    var nameCard = el("div", "card", '<h3 class="card-title">Your name</h3><p style="margin:0 0 10px;color:var(--ink-soft)">It goes into your result code so your teacher knows it&#39;s you.</p>');
    var name = el("input", "name-input"); name.placeholder = "First name"; name.value = store("mk-name") || "";
    name.addEventListener("input", function () { store("mk-name", name.value.trim()); });
    nameCard.appendChild(name);
    root.appendChild(nameCard);

    var card = el("div", "card");
    card.appendChild(el("h3", "card-title", "Questions"));
    var qs = items.map(function (it, i) { var q = buildQ(it, i + 1, "hw"); card.appendChild(q); return q; });
    root.appendChild(card);

    var finCard = el("div", "card", '<p style="margin:0 0 10px">Finished? Unanswered questions count as missed.</p>');
    finCard.style.textAlign = "center";
    var fin = el("button", "btn", "Finish & get my result code");
    finCard.appendChild(fin);
    root.appendChild(finCard);

    var score = el("div", "score-card");
    root.appendChild(score);
    var practice = el("div", "");
    root.appendChild(practice);

    fin.addEventListener("click", function () {
      var right = 0, missed = [];
      qs.forEach(function (q, i) { if (q._state.firstTry === true) right++; else missed.push(i + 1); });
      var c = MK.code(code, name.value.trim(), right, qs.length, missed);
      score.innerHTML = '<div class="eyebrow">Right on the first try</div><div class="score-big">' + right + " / " + qs.length + '</div>' + bandHTML(right, qs.length) +
        '<p class="score-sub" style="margin-top:12px">Copy this code and send it to your teacher in the class chat:</p>';
      score.appendChild(codeBox(c));
      if (!name.value.trim()) score.appendChild(el("p", "score-sub", "⚠️ Add your name at the top, then press Finish again."));
      if (missed.length) {
        var again = el("button", "btn teal", "Practise the ones I missed (new numbers)");
        again.style.marginTop = "14px";
        again.addEventListener("click", function () { buildPractice(missed); again.remove(); });
        score.appendChild(el("div", "", "")).appendChild(again);
      }
      score.classList.add("show");
      score.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    function buildPractice(missed) {
      practice.innerHTML = "";
      var pc = el("div", "card", '<h3 class="card-title">Extra practice · new numbers (not scored)</h3>');
      missed.forEach(function (n) {
        var it = MK.resolve({ from: lessonId, id: bank.items[n - 1].id, v: "C" });
        pc.appendChild(buildQ(it, n, "practice"));
      });
      practice.appendChild(pc);
      pc.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ---------- OPENING QUIZ PAGE ---------- */
  MK.quizPage = function (quizId, rootId) {
    var quiz = window.MATH_QUIZZES[quizId];
    var root = document.getElementById(rootId || "mathRoot");
    var items = quiz.items.map(MK.resolve);
    var minutes = quiz.minutes || 10;

    root.appendChild(el("div", "page-hero",
      '<div class="title-eyebrow">' + esc(quiz.program) + " · Session " + quiz.session + ' · Opening Quiz</div>' +
      "<h1>" + esc(quiz.title) + "</h1>" +
      "<p>" + esc(quiz.intro || "") + " You have " + minutes + " minutes. Answer every question, then press Submit. You'll see your score, the answers, and a result code to send in the class chat.</p>" +
      '<div class="meta-row"><span class="meta-chip">' + minutes + ' min</span><span class="meta-chip">' + items.length + ' questions</span><span class="meta-chip">No calculator</span></div>'));

    var startCard = el("div", "card", '<h3 class="card-title">Ready?</h3><p style="margin:0 0 10px">Type your name, then press Start. The timer appears in the top-right corner.</p>');
    var name = el("input", "name-input"); name.placeholder = "First name"; name.value = store("mk-name") || "";
    var startBtn = el("button", "btn teal", "Start quiz ▸");
    startCard.appendChild(name); startCard.appendChild(startBtn);
    root.appendChild(startCard);

    var area = el("div", "locked-area");
    var card = el("div", "card");
    var qs = items.map(function (it, i) { var q = buildQ(it, i + 1, "quiz"); card.appendChild(q); return q; });
    area.appendChild(card);
    var subCard = el("div", "card"); subCard.style.textAlign = "center";
    var answered = el("p", "", ""); answered.style.margin = "0 0 10px";
    var sub = el("button", "btn", "Submit quiz");
    subCard.appendChild(answered); subCard.appendChild(sub);
    area.appendChild(subCard);
    var score = el("div", "score-card");
    area.appendChild(score);
    root.appendChild(area);

    var timer = el("div", "timer"); document.body.appendChild(timer);
    var left = minutes * 60, tick = null, submitted = false;

    function countAnswered() {
      var n = 0; qs.forEach(function (q) { var v = q._state.value; if (v !== null && v !== "" && v !== undefined) n++; });
      answered.textContent = n + " of " + qs.length + " answered.";
    }
    qs.forEach(function (q) { q._onChange = countAnswered; });
    countAnswered();

    startBtn.addEventListener("click", function () {
      if (!name.value.trim()) { name.focus(); name.placeholder = "Please type your name first"; return; }
      store("mk-name", name.value.trim());
      area.classList.remove("locked-area"); startBtn.disabled = true; name.disabled = true;
      timer.classList.add("show");
      var draw = function () {
        var m = Math.floor(left / 60), s = left % 60;
        timer.textContent = "⏱ " + m + ":" + (s < 10 ? "0" : "") + s;
        timer.classList.toggle("low", left <= 60);
      };
      draw();
      tick = setInterval(function () { left--; draw(); if (left <= 0) { clearInterval(tick); grade(); } }, 1000);
      card.scrollIntoView({ behavior: "smooth" });
    });
    sub.addEventListener("click", grade);

    function grade() {
      if (submitted) return; submitted = true;
      clearInterval(tick); timer.classList.remove("show"); sub.disabled = true;
      var right = 0, missed = [];
      qs.forEach(function (q, i) {
        var it = q._item, v = q._state.value, ok;
        ok = it.options ? v === it.ans : (v != null && isRight(it, v));
        if (ok) right++; else missed.push(i + 1);
        q.classList.add(ok ? "is-right" : "is-wrong", "locked");
        if (it.options) {
          var opts = q.querySelectorAll(".quiz-option");
          opts.forEach(function (o) { o.classList.remove("picked"); o.classList.add("locked"); });
          if (v != null && v !== it.ans) opts[v].classList.add("wrong");
          opts[it.ans].classList.add("correct");
        } else {
          q._input.disabled = true; q._input.classList.add(ok ? "ok" : "no");
        }
        q._fb.className = ok ? "mfb ok" : "mfb reveal";
        q._fb.innerHTML = (ok ? "<b>✓ Correct.</b>" : "<b>✗ The answer is " + answerText(it) + ".</b>") + (it.explain ? '<div class="why">' + MK.fmt(it.explain) + "</div>" : "");
      });
      var c = MK.code(quizId, name.value.trim(), right, qs.length, missed);
      score.innerHTML = '<div class="eyebrow">Your score</div><div class="score-big">' + right + " / " + qs.length + '</div>' + bandHTML(right, qs.length) +
        '<p class="score-sub" style="margin-top:12px">Send this code in the class chat. Then scroll up to read each explanation.</p>';
      score.appendChild(codeBox(c));
      score.classList.add("show");
      score.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  /* ---------- QUIZ WALKTHROUGH inside the deck ---------- */
  function quizReview(host) {
    var quiz = window.MATH_QUIZZES[host.dataset.quizReview];
    if (!quiz) { host.innerHTML = "<p>Quiz bank not loaded.</p>"; return; }
    quiz.items.map(MK.resolve).forEach(function (it, i) {
      var box = el("div", "qr-item");
      box.appendChild(el("div", "q-head", '<span class="quiz-q-num">Q' + (i + 1) + '</span><span class="q-topic">' + esc(it.skill) + (it.tag ? " · " + esc(it.tag) : "") + "</span>"));
      box.appendChild(el("div", "q-text", MK.fmt(it.q)));
      if (it.vis) box.appendChild(el("div", "q-vis", it.vis));
      if (it.options) box.appendChild(el("div", "qr-opts", it.options.map(function (o, k) { return "<span><b>" + LETTERS[k] + "</b> " + MK.fmt(o) + "</span>"; }).join("")));
      var b = el("button", "small-btn", "Show answer ▾");
      b.addEventListener("click", function () { box.classList.toggle("open"); b.textContent = box.classList.contains("open") ? "Hide answer ▴" : "Show answer ▾"; });
      box.appendChild(b);
      box.appendChild(el("div", "qr-ans", "<b>Answer: " + answerText(it) + ".</b> " + MK.fmt(it.explain)));
      host.appendChild(box);
    });
  }

  /* ---------- numeric question inside the deck ---------- */
  // <div class="mq" data-ans="306040" data-hint="..."></div>
  function deckNumQ(host) {
    var item = { ans: host.dataset.ans, hint: host.dataset.hint || "", explain: "", options: null };
    var row = el("div", "num-row");
    var inp = el("input", "num-input"); inp.placeholder = "Type your answer"; inp.inputMode = "numeric"; inp.autocomplete = "off";
    var chk = el("button", "btn teal", "Check");
    var fb = el("div", "mfb");
    var tries = 0, done = false;
    function go() {
      if (done || !inp.value.trim()) return;
      var ok = isRight(item, inp.value); tries++;
      inp.classList.remove("ok", "no"); inp.classList.add(ok ? "ok" : "no");
      if (ok) { done = true; fb.className = "mfb ok"; fb.innerHTML = "<b>✓ That's right!</b> Press Next ▸ to see why."; }
      else if (tries === 1) { fb.className = "mfb hint"; fb.innerHTML = "<b>Not quite. Try again.</b>" + (item.hint ? '<div class="why">💡 ' + MK.fmt(item.hint) + "</div>" : ""); }
      else { done = true; fb.className = "mfb reveal"; fb.innerHTML = "<b>The answer is " + MK.group(item.ans) + ".</b> Press Next ▸ for the explanation."; }
      if (done) { inp.disabled = true; chk.disabled = true; }
    }
    chk.addEventListener("click", go);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    row.appendChild(inp); row.appendChild(chk);
    host.appendChild(row); host.appendChild(fb);
  }

  /* ---------- place-value chart (static) ---------- */
  // <div data-pv-chart="482615" data-hl="1"></div>  (hl = index from left to highlight)
  var PLACE = ["Hundred<br>thousands", "Ten<br>thousands", "Thousands", "Hundreds", "Tens", "Ones"];
  function pvChart(host) {
    var n = String(host.dataset.pvChart).padStart(6, " ");
    var hl = (host.dataset.hl || "").split(",").filter(Boolean).map(Number);
    var h = '<table class="pv-table"><tr><th class="period th" colspan="3">Thousands period</th><th class="period on" colspan="3">Ones period</th></tr><tr>';
    PLACE.forEach(function (p, i) { h += "<th" + (i === 3 ? ' style="border-left:4px solid #1F2937"' : "") + ">" + p + "</th>"; });
    h += "</tr><tr>";
    for (var i = 0; i < 6; i++) h += '<td class="' + (hl.indexOf(i) >= 0 ? "hl " : "") + (i === 3 ? "gap" : "") + '">' + (n[i] === " " ? "" : n[i]) + "</td>";
    h += "</tr></table>";
    host.innerHTML = h;
  }

  /* ---------- place-value builder (interactive) ---------- */
  // <div data-pv-builder data-targets="405030,620007,999999"></div>
  function pvBuilder(host) {
    var digits = [0, 0, 0, 0, 0, 0];
    var wrap = el("div", "pvb");
    var cols = el("div", "pvb-cols");
    var dEls = [];
    PLACE.forEach(function (p, i) {
      if (i === 3) cols.appendChild(el("div", "pvb-gap"));
      var c = el("div", "pvb-col " + (i < 3 ? "th" : "on"));
      c.appendChild(el("div", "lbl", p));
      var up = el("button", "", "▲"), dn = el("button", "", "▼");
      var d = el("div", "dg", "0");
      up.addEventListener("click", function () { digits[i] = (digits[i] + 1) % 10; draw(); });
      dn.addEventListener("click", function () { digits[i] = (digits[i] + 9) % 10; draw(); });
      c.appendChild(up); c.appendChild(d); c.appendChild(dn);
      cols.appendChild(c); dEls.push(d);
    });
    wrap.appendChild(cols);
    var out = el("div", "pvb-out");
    var vStd = el("div", "v big-num"), vWords = el("div", "v"), vExp = el("div", "v");
    out.appendChild(el("div", "k", "Standard")); out.appendChild(vStd);
    out.appendChild(el("div", "k", "Words")); out.appendChild(vWords);
    out.appendChild(el("div", "k", "Expanded")); out.appendChild(vExp);
    wrap.appendChild(out);

    var targets = (host.dataset.targets || "").split(",").filter(Boolean).map(Number), ti = 0;
    var tBox = null, tText = null, tMsg = null;
    if (targets.length) {
      tBox = el("div", "pvb-target");
      tBox.appendChild(el("span", "", "🎯 Build this number:"));
      tText = el("span", "t", "");
      tMsg = el("span", "", "");
      var nextBtn = el("button", "small-btn", "Next target ▸");
      nextBtn.addEventListener("click", function () { ti = (ti + 1) % targets.length; draw(); });
      var reset = el("button", "small-btn", "Reset to 0");
      reset.addEventListener("click", function () { digits = [0, 0, 0, 0, 0, 0]; draw(); });
      tBox.appendChild(tText); tBox.appendChild(tMsg); tBox.appendChild(nextBtn); tBox.appendChild(reset);
      wrap.appendChild(tBox);
    }
    function value() { return +digits.join(""); }
    function draw() {
      digits.forEach(function (d, i) { dEls[i].textContent = d; });
      var v = value();
      vStd.textContent = MK.group(v);
      vWords.textContent = MK.words(v);
      vExp.textContent = MK.expanded(v);
      if (tBox) {
        tText.textContent = MK.words(targets[ti]);
        tMsg.innerHTML = v === targets[ti] ? ' <b style="color:var(--green)">✓ You built it!</b>' : "";
      }
    }
    draw();
    host.appendChild(wrap);
  }

  /* ---------- rounding number line (interactive) ---------- */
  // <div data-round-tool data-start="347812"></div>
  MK.roundSVG = function (n, place) {
    var lo = Math.floor(n / place) * place, hi = lo + place, mid = lo + place / 2;
    var r = n - lo >= place / 2 ? hi : lo;
    var W = 860, x0 = 70, x1 = 790;
    var X = function (v) { return x0 + (v - lo) / place * (x1 - x0); };
    var px = X(n);
    var s = '<svg viewBox="0 0 ' + W + ' 190" xmlns="http://www.w3.org/2000/svg" class="diagram" style="font-family:Helvetica,Arial,sans-serif">';
    s += '<line x1="' + x0 + '" y1="110" x2="' + x1 + '" y2="110" stroke="#1F2937" stroke-width="3"/>';
    for (var k = 0; k <= 10; k++) { var tx = x0 + k * (x1 - x0) / 10; s += '<line x1="' + tx + '" y1="' + (k === 5 ? 96 : 102) + '" x2="' + tx + '" y2="' + (k === 5 ? 124 : 118) + '" stroke="#8A92A0" stroke-width="' + (k === 5 ? 2.5 : 1.5) + '"/>'; }
    s += '<text x="' + x0 + '" y="148" text-anchor="middle" font-family="Georgia" font-size="19" font-weight="700" fill="' + (r === lo ? "#0B7F7B" : "#1F2937") + '">' + MK.group(lo) + "</text>";
    s += '<text x="' + x1 + '" y="148" text-anchor="middle" font-family="Georgia" font-size="19" font-weight="700" fill="' + (r === hi ? "#0B7F7B" : "#1F2937") + '">' + MK.group(hi) + "</text>";
    s += '<text x="' + X(mid) + '" y="148" text-anchor="middle" font-size="14" fill="#CF8B17" font-weight="700">' + MK.group(mid) + "</text>";
    s += '<text x="' + X(mid) + '" y="168" text-anchor="middle" font-size="11" fill="#CF8B17" letter-spacing="1.5" font-weight="700">HALFWAY</text>';
    var tx2 = r === hi ? x1 : x0;
    s += '<path d="M' + px + ',98 Q' + ((px + tx2) / 2) + ',52 ' + tx2 + ',94" fill="none" stroke="#0EA5A0" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#ah)"/>';
    s += '<defs><marker id="ah" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0EA5A0"/></marker></defs>';
    s += '<circle cx="' + px + '" cy="110" r="9" fill="#DC2626" stroke="#fff" stroke-width="2"/>';
    s += '<text x="' + px + '" y="44" text-anchor="middle" font-family="Georgia" font-size="18" font-weight="700" fill="#DC2626">' + MK.group(n) + "</text>";
    s += "</svg>";
    return { svg: s, lo: lo, hi: hi, mid: mid, r: r };
  };
  function roundTool(host) {
    var wrap = el("div", "rt");
    var ctr = el("div", "rt-controls");
    var inp = el("input", "num-input"); inp.value = MK.group(+host.dataset.start || 347812);
    var sel = el("select", "", '<option value="1000">nearest 1 000</option><option value="10000" selected>nearest 10 000</option><option value="100000">nearest 100 000</option>');
    var rnd = el("button", "small-btn", "🎲 Random number");
    ctr.appendChild(el("span", "", "<b>Round</b>")); ctr.appendChild(inp); ctr.appendChild(el("span", "", "to the")); ctr.appendChild(sel); ctr.appendChild(rnd);
    var pic = el("div", ""), res = el("div", "rt-result");
    wrap.appendChild(ctr); wrap.appendChild(pic); wrap.appendChild(res);
    function draw() {
      var n = +MK.norm(inp.value); if (isNaN(n) || n < 0 || n > 999999) { res.textContent = "Type a whole number from 0 to 999 999."; return; }
      var place = +sel.value, o = MK.roundSVG(n, place);
      pic.innerHTML = o.svg;
      var digitPlace = place / 10, dig = Math.floor(n / digitPlace) % 10;
      res.innerHTML = "The rounding digit (" + MK.group(digitPlace) + "s place) is <b>" + dig + "</b>, so " + (dig >= 5 ? "round <b>up</b>" : "round <b>down</b>") + ": " + MK.group(n) + " ≈ <b>" + MK.group(o.r) + "</b>";
    }
    inp.addEventListener("input", draw); sel.addEventListener("change", draw);
    rnd.addEventListener("click", function () { inp.value = MK.group(Math.floor(Math.random() * 999999)); draw(); });
    draw();
    host.appendChild(wrap);
  }


  /* ---------- OPENING QUIZ INSIDE THE LESSON DECK ----------
     Slides (generated at build time):
       <div data-dq-start="Q4A_1_1" data-minutes="10"></div>   name + Start
       <div data-dq-q="Q4A_1_1" data-i="0"></div>               one question per slide
       <div data-dq-submit="Q4A_1_1"></div>                     answered count, Submit, score + result code */
  function deckQuizzes() {
    var starts = document.querySelectorAll("[data-dq-start]");
    starts.forEach(function (startHost) {
      var id = startHost.dataset.dqStart, quiz = window.MATH_QUIZZES[id];
      if (!quiz) return;
      var minutes = +(startHost.dataset.minutes || quiz.minutes || 10);
      var items = quiz.items.map(MK.resolve);
      var slideOf = function (node) { var s = node.closest(".slide"); return s ? +s.dataset.slide : 0; };
      var go = function (n) { if (typeof window.showSlide === "function") window.showSlide(n); };
      document.body.classList.add("mock-waiting");

      // question slides
      var qs = [];
      document.querySelectorAll('[data-dq-q="' + id + '"]').forEach(function (h) {
        var i = +h.dataset.i, q = buildQ(items[i], i + 1, "quiz");
        h.appendChild(q); qs[i] = q;
      });
      // start slide
      var name = el("input", "name-input"); name.placeholder = "First name"; name.value = store("mk-name") || "";
      var startBtn = el("button", "btn teal", "Start quiz ▸");
      var row = el("div", ""); row.style.marginTop = "14px"; row.appendChild(name); row.appendChild(startBtn);
      startHost.appendChild(row);
      // submit slide
      var subHost = document.querySelector('[data-dq-submit="' + id + '"]');
      var answered = el("p", "section-lede", "");
      var subBtn = el("button", "btn", "Submit quiz");
      var score = el("div", "score-card");
      subHost.appendChild(answered); subHost.appendChild(subBtn); subHost.appendChild(score);

      var timer = el("div", "timer"); document.body.appendChild(timer);
      var left = minutes * 60, tick = null, started = false, done = false;
      function count() {
        var n = 0; qs.forEach(function (q) { var v = q._state.value; if (v !== null && v !== "" && v !== undefined) n++; });
        answered.innerHTML = "You've answered <b>" + n + " of " + qs.length + "</b> questions. Use ◂ Previous to check your answers before you submit.";
      }
      qs.forEach(function (q) { q._onChange = count; }); count();

      startBtn.addEventListener("click", function () {
        if (started) return;
        if (!name.value.trim()) { name.focus(); name.placeholder = "Please type your name first"; return; }
        store("mk-name", name.value.trim());
        started = true; startBtn.disabled = true; name.disabled = true;
        document.body.classList.remove("mock-waiting");
        timer.classList.add("show");
        var draw = function () { var m = Math.floor(left / 60), sec = left % 60; timer.textContent = "⏱ " + m + ":" + (sec < 10 ? "0" : "") + sec; timer.classList.toggle("low", left <= 60); };
        draw();
        tick = setInterval(function () { left--; draw(); if (left <= 0) { grade(); go(slideOf(subHost)); } }, 1000);
        go(slideOf(startHost) + 1);
      });
      subBtn.addEventListener("click", function () {
        if (!started) { go(slideOf(startHost)); return; }
        grade();
      });

      function grade() {
        if (done) return; done = true;
        clearInterval(tick); timer.classList.remove("show"); subBtn.style.display = "none"; answered.style.display = "none";
        var right = 0, missed = [];
        qs.forEach(function (q, i) {
          var it = q._item, v = q._state.value;
          var ok = it.options ? v === it.ans : (v != null && isRight(it, v));
          if (ok) right++; else missed.push(i + 1);
          q.classList.add(ok ? "is-right" : "is-wrong", "locked");
          if (it.options) {
            var opts = q.querySelectorAll(".quiz-option");
            opts.forEach(function (o) { o.classList.remove("picked"); o.classList.add("locked"); });
            if (v != null && v !== it.ans) opts[v].classList.add("wrong");
            opts[it.ans].classList.add("correct");
          } else { q._input.disabled = true; q._input.classList.add(ok ? "ok" : "no"); }
          q._fb.className = ok ? "mfb ok" : "mfb reveal";
          q._fb.innerHTML = (ok ? "<b>✓ Correct.</b>" : "<b>✗ The answer is " + answerText(it) + ".</b>") + (it.explain ? '<div class="why">' + MK.fmt(it.explain) + "</div>" : "");
        });
        var c = MK.code(id, name.value.trim(), right, qs.length, missed);
        score.innerHTML = '<div class="eyebrow">Your score</div><div class="score-big">' + right + " / " + qs.length + "</div>" + bandHTML(right, qs.length) +
          '<p class="score-sub" style="margin-top:12px">Copy your code into the class chat, then press <b>Next ▸</b> and we\'ll go through the quiz together.</p>';
        score.appendChild(codeBox(c));
        score.classList.add("show");
      }
    });
  }


  /* ---------- V-MATH WIDGETS ---------- */
  // Rotate & Flip: <div data-rotator='{"piece":[[0,0],[0,1],[0,2],[1,2]],"targets":[{"turns":1,"flip":false},...]}'></div>
  function rotator(host) {
    var cfg = JSON.parse(host.dataset.rotator), piece = cfg.piece, ti = 0;
    var norm = function (c) { var mx = Math.min.apply(null, c.map(function (p) { return p[0]; })), my = Math.min.apply(null, c.map(function (p) { return p[1]; }));
      return c.map(function (p) { return [p[0] - mx, p[1] - my]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }); };
    var rot = function (c) { return norm(c.map(function (p) { return [p[1], -p[0]]; })); };   // quarter turn
    var flip = function (c) { return norm(c.map(function (p) { return [-p[0], p[1]]; })); };
    var key = function (c) { return JSON.stringify(norm(c)); };
    var cur = norm(piece), moves = 0;
    var make = function (t) { var c = norm(piece); if (t.flip) c = flip(c); for (var i = 0; i < t.turns; i++) c = rot(c); return c; };
    var draw = function (c, color, u) {
      u = u || 30; var W = 0, H = 0; c.forEach(function (p) { W = Math.max(W, p[0] + 1); H = Math.max(H, p[1] + 1); });
      var s = '<svg viewBox="0,0,' + (W * u + 12) + ',' + (H * u + 12) + '" width="' + (W * u + 12) + '" xmlns="http://www.w3.org/2000/svg">';
      c.forEach(function (p) { s += '<rect x="' + (6 + p[0] * u) + '" y="' + (6 + p[1] * u) + '" width="' + u + '" height="' + u + '" fill="' + color + '" stroke="#fff" stroke-width="2"/>'; });
      return s + "</svg>";
    };
    var wrap = el("div", "rt"), row = el("div", "rot-row");
    var you = el("div", "rot-box"), tgt = el("div", "rot-box");
    row.appendChild(you); row.appendChild(el("div", "rot-arrow", "→")); row.appendChild(tgt);
    var ctr = el("div", "btn-row");
    var bR = el("button", "btn teal", "↻ Quarter turn"), bF = el("button", "btn", "⇋ Flip"), bReset = el("button", "btn ghost", "Reset"), bNext = el("button", "btn ghost", "Next target ▸");
    [bR, bF, bReset, bNext].forEach(function (b) { ctr.appendChild(b); });
    var msg = el("div", "rt-result", "");
    wrap.appendChild(row); wrap.appendChild(ctr); wrap.appendChild(msg); host.appendChild(wrap);
    function render() {
      var t = make(cfg.targets[ti]);
      you.innerHTML = '<div class="expect">Your shape</div>' + draw(cur, "#0EA5A0");
      tgt.innerHTML = '<div class="expect">Target ' + (ti + 1) + " of " + cfg.targets.length + "</div>" + draw(t, "#CBD5E1");
      if (key(cur) === key(t)) msg.innerHTML = '<b style="color:var(--green)">✓ Match!</b> ' + (cfg.targets[ti].flip ? "This one needed a <b>flip</b>: turning alone can never make it." : "Turning was enough. You used " + moves + " move" + (moves === 1 ? "" : "s") + ".");
      else msg.innerHTML = "Moves: " + moves + ". Can you match it using <b>only turns</b>?";
    }
    bR.onclick = function () { cur = rot(cur); moves++; render(); };
    bF.onclick = function () { cur = flip(cur); moves++; render(); };
    bReset.onclick = function () { cur = norm(piece); moves = 0; render(); };
    bNext.onclick = function () { ti = (ti + 1) % cfg.targets.length; cur = norm(piece); moves = 0; render(); };
    render();
  }

  // Sudoku: <div data-sudoku="puzzle with 0s" data-solution="..." data-n="6" data-br="2" data-bc="3"></div>
  function sudoku(host) {
    var n = +host.dataset.n, br = +host.dataset.br, bc = +host.dataset.bc;
    var puz = host.dataset.sudoku.split("").map(Number), sol = host.dataset.solution.split("").map(Number);
    var grid = el("div", "sdk"); grid.style.gridTemplateColumns = "repeat(" + n + ", 46px)";
    var cells = [];
    puz.forEach(function (v, i) {
      var r = Math.floor(i / n), c = i % n;
      var cell = el("input", "sdk-cell" + (v ? " given" : ""));
      cell.maxLength = 1; cell.inputMode = "numeric"; cell.value = v || ""; cell.readOnly = !!v;
      if (c % bc === bc - 1 && c !== n - 1) cell.classList.add("br"); if (r % br === br - 1 && r !== n - 1) cell.classList.add("bb");
      cell.addEventListener("input", function () { cell.value = cell.value.replace(new RegExp("[^1-" + n + "]", "g"), ""); cell.classList.remove("bad", "good"); msg.textContent = ""; });
      grid.appendChild(cell); cells.push(cell);
    });
    var ctr = el("div", "btn-row"), bC = el("button", "btn teal", "🚩 Check"), bH = el("button", "btn ghost", "Hint"), bS = el("button", "btn ghost", "Show solution"), bR = el("button", "btn ghost", "Clear");
    [bC, bH, bS, bR].forEach(function (b) { ctr.appendChild(b); });
    var msg = el("div", "rt-result", "Type numbers 1–" + n + " in the empty squares.");
    host.appendChild(grid); host.appendChild(ctr); host.appendChild(msg);
    bC.onclick = function () {
      var bad = 0, empty = 0;
      cells.forEach(function (c, i) { if (c.readOnly) return; c.classList.remove("bad", "good"); if (!c.value) { empty++; return; } if (+c.value !== sol[i]) { c.classList.add("bad"); bad++; } else c.classList.add("good"); });
      msg.innerHTML = bad ? "<b style='color:var(--red)'>🚩 " + bad + " square" + (bad > 1 ? "s" : "") + " can't be right.</b> Check that row, column and box." : (empty ? "✓ So far so good. " + empty + " left to fill." : "<b style='color:var(--green)'>🎉 Solved! Every row, column and box has 1–" + n + " once.</b>");
    };
    bH.onclick = function () { for (var i = 0; i < cells.length; i++) if (!cells[i].readOnly && +cells[i].value !== sol[i]) { cells[i].value = sol[i]; cells[i].classList.add("good"); msg.textContent = "One square filled in for you."; return; } };
    bS.onclick = function () { cells.forEach(function (c, i) { c.value = sol[i]; }); msg.textContent = "Here's the full solution."; };
    bR.onclick = function () { cells.forEach(function (c) { if (!c.readOnly) { c.value = ""; c.classList.remove("bad", "good"); } }); msg.textContent = ""; };
  }

  // Turtle playground: <div data-turtle data-code="repeat 4 [forward 100 right 90]" data-presets='{"Square":"..."}'></div>
  MK.logo = function (src) {
    var toks = src.replace(/\[/g, " [ ").replace(/\]/g, " ] ").trim().split(/\s+/).filter(Boolean), i = 0;
    function block() {
      var out = [];
      while (i < toks.length && toks[i] !== "]") {
        var t = toks[i++].toLowerCase(), num = function () { var v = parseFloat(toks[i++]); if (isNaN(v)) throw new Error("A number is missing after \"" + t + "\""); return v; };
        if (t === "repeat") { var n = num(); if (toks[i++] !== "[") throw new Error("repeat needs [ ]"); var b = block(); i++; out.push({ op: "repeat", n: n, body: b }); }
        else if (t === "forward" || t === "fd") out.push({ op: "fd", v: num() });
        else if (t === "back" || t === "bk") out.push({ op: "fd", v: -num() });
        else if (t === "right" || t === "rt") out.push({ op: "rt", v: num() });
        else if (t === "left" || t === "lt") out.push({ op: "rt", v: -num() });
        else if (t === "penup" || t === "pu") out.push({ op: "pu" });
        else if (t === "pendown" || t === "pd") out.push({ op: "pd" });
        else throw new Error("I don't know \"" + t + "\". Try forward, right, left, repeat, penup, pendown.");
      }
      return out;
    }
    var prog = block(), st = { x: 0, y: 0, h: 0, pen: true, segs: [], turned: 0, steps: 0 };
    (function run(p) { p.forEach(function (c) {
      if (st.steps++ > 20000) throw new Error("That's too many steps for the turtle.");
      if (c.op === "repeat") for (var k = 0; k < c.n; k++) run(c.body);
      else if (c.op === "fd") { var nx = st.x + c.v * Math.sin(st.h * Math.PI / 180), ny = st.y - c.v * Math.cos(st.h * Math.PI / 180); if (st.pen) st.segs.push([st.x, st.y, nx, ny]); st.x = nx; st.y = ny; }
      else if (c.op === "rt") { st.h += c.v; st.turned += c.v; }
      else if (c.op === "pu") st.pen = false; else if (c.op === "pd") st.pen = true;
    }); })(prog);
    return st;
  };
  function turtleBox(host) {
    var presets = host.dataset.presets ? JSON.parse(host.dataset.presets) : {};
    var wrap = el("div", "turtle-wrap"), left = el("div", ""), right = el("div", "");
    var ta = el("textarea", "turtle-ta"); ta.value = host.dataset.code || "repeat 4 [forward 100 right 90]"; ta.spellcheck = false;
    var ctr = el("div", "btn-row"), go = el("button", "btn teal", "▶ Run");
    ctr.appendChild(go);
    Object.keys(presets).forEach(function (k) { var b = el("button", "small-btn", k); b.onclick = function () { ta.value = presets[k]; runIt(); }; ctr.appendChild(b); });
    var info = el("div", "rt-result", "");
    left.appendChild(el("div", "expect", "Turtle code")); left.appendChild(ta); left.appendChild(ctr); left.appendChild(info);
    var canvas = el("div", "turtle-canvas"); right.appendChild(canvas);
    wrap.appendChild(left); wrap.appendChild(right); host.appendChild(wrap);
    function runIt() {
      try {
        var st = MK.logo(ta.value), xs = [0], ys = [0];
        st.segs.forEach(function (s) { xs.push(s[0], s[2]); ys.push(s[1], s[3]); });
        xs.push(st.x); ys.push(st.y);
        var mnx = Math.min.apply(null, xs), mxx = Math.max.apply(null, xs), mny = Math.min.apply(null, ys), mxy = Math.max.apply(null, ys);
        var span = Math.max(mxx - mnx, mxy - mny, 60), sc = 260 / span, ox = 20 - mnx * sc + (260 - (mxx - mnx) * sc) / 2, oy = 20 - mny * sc + (260 - (mxy - mny) * sc) / 2;
        var P = function (x, y) { return (x * sc + ox).toFixed(1) + "," + (y * sc + oy).toFixed(1); };
        var d = "", last = null;
        st.segs.forEach(function (s) { if (!last || Math.abs(last[0] - s[0]) > 1e-6 || Math.abs(last[1] - s[1]) > 1e-6) d += "M" + P(s[0], s[1]); d += "L" + P(s[2], s[3]); last = [s[2], s[3]]; });
        var hx = st.x * sc + ox, hy = st.y * sc + oy;
        canvas.innerHTML = '<svg viewBox="0,0,300,300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#DBEAFE"/><path d="' + d + '" fill="none" stroke="#DC2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<g transform="translate(' + hx.toFixed(1) + ',' + hy.toFixed(1) + ') rotate(' + st.h + ')"><path d="M0,-10L7,7L0,3L-7,7Z" fill="#16A34A" stroke="#14532D"/></g></svg>';
        var back = Math.abs(st.x) < 0.5 && Math.abs(st.y) < 0.5;
        info.innerHTML = "Total turning: <b>" + Math.round(st.turned) + "°</b>" + (back ? " · back at the start ✓" : "");
      } catch (e) { info.innerHTML = "<b style='color:var(--red)'>" + esc(e.message) + "</b>"; }
    }
    go.onclick = runIt; runIt();
  }

  /* ---------- QR code for a page next to this one (e.g. quiz.html) ---------- */
  // <div data-qr-link="quiz.html"></div>  → QR + address of that page
  function qrLink(host) {
    var url = new URL(host.dataset.qrLink, location.href).href;
    var html = "";
    try { var qr = qrcode(0, "M"); qr.addData(url); qr.make(); html = qr.createSvgTag({ cellSize: 4, margin: 2 }); } catch (e) {}
    host.innerHTML = '<div class="hw-box"><div class="hw-qr">' + html + '</div><div class="hw-linkcol"><div class="expect">Scan or open on your device</div>' +
      '<a class="hw-url" target="_blank" rel="noopener" href="' + url + '">' + url + "</a>" +
      '<div class="btn-row"><a class="btn teal" target="_blank" rel="noopener" href="' + url + '">Open quiz ↗</a></div></div></div>';
  }

  function init() {
    document.querySelectorAll("[data-quiz-review]").forEach(quizReview);
    document.querySelectorAll(".mq").forEach(deckNumQ);
    document.querySelectorAll("[data-pv-chart]").forEach(pvChart);
    document.querySelectorAll("[data-pv-builder]").forEach(pvBuilder);
    document.querySelectorAll("[data-round-tool]").forEach(roundTool);
    document.querySelectorAll("[data-round-svg]").forEach(function (h) {
      var p = h.dataset.roundSvg.split(","); h.innerHTML = MK.roundSVG(+p[0], +p[1]).svg;
    });
    document.querySelectorAll("[data-qr-link]").forEach(qrLink);
    deckQuizzes();
    document.querySelectorAll("[data-rotator]").forEach(rotator);
    document.querySelectorAll("[data-sudoku]").forEach(sudoku);
    document.querySelectorAll("[data-turtle]").forEach(turtleBox);
    var mount = document.getElementById("mathRoot");
    if (mount && mount.dataset.homework) MK.homeworkPage(mount.dataset.homework);
    if (mount && mount.dataset.quiz) MK.quizPage(mount.dataset.quiz);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

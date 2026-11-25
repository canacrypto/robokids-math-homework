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
    return String(v).replace(/[\s,   ]/g, "").replace(/[\u2212\u2013\u2014]/g, "-").toLowerCase();
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
      hint: ver.hint || base.hint || "", explain: ver.explain || "", code: ver.code || null, lines: ver.lines || null
    };
  };

  function isRight(item, given) {
    if (item.options) return given === item.ans;
    if (given === "" || given == null) return false;
    var g = MK.norm(given).replace(/^\$/, ""), t = MK.norm(item.ans).replace(/^\$/, "");
    if (g === t) return true;
    var gn = Number(g), tn = Number(t);   // 0.07 = .07 = 0.070, 7 = 7.0
    return g !== "" && !isNaN(gn) && !isNaN(tn) && Math.abs(gn - tn) < 1e-9;
  }
  function answerText(item) {
    if (item.code || item.lines) return "one way to write it (below)";
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

    if (item.lines) {
      var lc = item.lines, lh = el("div", "la-host"); q.appendChild(lh);
      MK.lineArtBox(lh, lc, function (r, btn, ed) {
        if (state.done) return;
        feedback(r.pass);
        if (state.done) { ed.readOnly = true; btn.disabled = true; if (!r.pass && lc.sample) fb.appendChild(el("pre", "py-out ok", esc(lc.sample))); }
      });
    } else if (item.code) {
      var cc = item.code, ed = el("textarea", "py-editor"); ed.value = cc.starter || ""; ed.spellcheck = false;
      ed.rows = Math.max(6, (cc.starter || "").split("\n").length + 3);
      ed.addEventListener("keydown", function (e) { if (e.key === "Tab") { e.preventDefault(); var p = ed.selectionStart; ed.value = ed.value.slice(0, p) + "    " + ed.value.slice(ed.selectionEnd); ed.selectionStart = ed.selectionEnd = p + 4; } });
      var bar = el("div", "btn-row"), runB = el("button", "btn", "▶ Run"), inBox = el("input", "num-input");
      inBox.placeholder = "input() value(s), comma-separated"; inBox.style.width = "240px"; inBox.value = (cc.tryInput || []).join(", ");
      var chkB = el("button", "btn teal", "Check with hidden tests"), out = el("pre", "py-out", "");
      bar.appendChild(runB); bar.appendChild(inBox); bar.appendChild(chkB);
      q.appendChild(ed); q.appendChild(bar); q.appendChild(out);
      runB.addEventListener("click", function () {
        var ins = inBox.value.trim() ? inBox.value.split(",").map(function (v) { return v.trim(); }) : [];
        out.textContent = "Running…"; MK.runPy(ed.value, ins).then(function (r) { out.textContent = r.out + (r.err ? "\n⚠️ " + r.err : "") || "(no output)"; out.className = "py-out" + (r.err ? " err" : ""); });
      });
      chkB.addEventListener("click", function () {
        if (state.done) return;
        chkB.disabled = true; out.textContent = "Testing…";
        MK.testPy(ed.value, cc.tests).then(function (res) {
          chkB.disabled = false;
          out.textContent = res.report; out.className = "py-out" + (res.pass ? " ok" : " err");
          feedback(res.pass);
          if (state.done) { ed.readOnly = true; chkB.disabled = true; if (!res.pass && cc.sample) { var sp = el("pre", "py-out ok", esc(cc.sample)); fb.appendChild(sp); } }
        });
      });
    } else if (item.options) {
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
      '<div class="title-eyebrow">' + esc(bank.program) + " · " + (bank.label || "Session") + " " + bank.session + ' · Homework</div>' +
      "<h1>" + esc(bank.title) + "</h1>" +
      "<p>" + items.length + " questions. Press <b>Check</b> after each one. If you're wrong, you get a hint and one more try. When you're done, press <b>Finish</b> and send your result code to your teacher.</p>" +
      '<div class="meta-row"><span class="meta-chip">~' + (bank.minutes || items.length * 2) + ' minutes</span><span class="meta-chip">' + items.length + ' questions</span><span class="meta-chip">' + (bank.tool || "Calculator: no") + '</span></div>'));

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
      '<div class="meta-row"><span class="meta-chip">' + minutes + ' min</span><span class="meta-chip">' + items.length + ' questions</span><span class="meta-chip">' + (quiz.tool || "No calculator") + '</span></div>'));

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
    var cols = host.dataset.colors ? host.dataset.colors.split(",") : null;
    function tint(c) { c.style.background = c.value && cols ? cols[+c.value - 1] : ""; c.style.color = c.value && cols ? "rgba(0,0,0,.55)" : ""; }
    var grid = el("div", "sdk"); grid.style.gridTemplateColumns = "repeat(" + n + ", 46px)";
    var cells = [];
    puz.forEach(function (v, i) {
      var r = Math.floor(i / n), c = i % n;
      var cell = el("input", "sdk-cell" + (v ? " given" : ""));
      cell.maxLength = 1; cell.inputMode = "numeric"; cell.value = v || ""; cell.readOnly = !!v;
      if (c % bc === bc - 1 && c !== n - 1) cell.classList.add("br"); if (r % br === br - 1 && r !== n - 1) cell.classList.add("bb");
      cell.addEventListener("input", function () { cell.value = cell.value.replace(new RegExp("[^1-" + n + "]", "g"), ""); cell.classList.remove("bad", "good"); msg.textContent = ""; });
      if (cols) { tint(cell); cell.addEventListener("input", function () { tint(cell); }); }
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
    bH.onclick = function () { for (var i = 0; i < cells.length; i++) if (!cells[i].readOnly && +cells[i].value !== sol[i]) { cells[i].value = sol[i]; if (cols) tint(cells[i]); cells[i].classList.add("good"); msg.textContent = "One square filled in for you."; return; } };
    bS.onclick = function () { cells.forEach(function (c, i) { c.value = sol[i]; if (cols) tint(c); }); msg.textContent = "Here's the full solution."; };
    bR.onclick = function () { cells.forEach(function (c) { if (!c.readOnly) { c.value = ""; if (cols) tint(c); c.classList.remove("bad", "good"); } }); msg.textContent = ""; };
  }

  // Turtle playground: <div data-turtle data-code="repeat 4 [forward 100 right 90]" data-presets='{"Square":"..."}'></div>
  // Turtle Art colours: 0 red · 10 orange · 20 yellow · 30 lime · 40 green · 50 cyan · 60 blue · 70 purple · 80 magenta · 90 pink
  MK.taColor = function (v) {
    var T = ["#E11D2E", "#F97316", "#FACC15", "#A3E635", "#22C55E", "#22D3EE", "#2563EB", "#7C3AED", "#D946EF", "#F472B6"];
    v = ((Math.round(v) % 100) + 100) % 100; return T[Math.floor(v / 10)];
  };
  MK.logo = function (src) {
    src = src.replace(/set\s+color/gi, "setcolor").replace(/set\s+pensize/gi, "setpensize").replace(/start\s+fill/gi, "startfill").replace(/end\s+fill/gi, "endfill").replace(/\(|\)/g, " ");
    var toks = src.replace(/\[/g, " [ ").replace(/\]/g, " ] ").trim().split(/\s+/).filter(Boolean), i = 0;
    function block() {
      var out = [];
      while (i < toks.length && toks[i] !== "]") {
        var t = toks[i++].toLowerCase(), num = function () {
          var raw = toks[i++], v;
          if (raw && raw.toLowerCase() === "pensize") {             // pensize - 1, pensize + 2
            var opx = toks[i], k = parseFloat(toks[i + 1]);
            if ((opx === "-" || opx === "+") && !isNaN(k)) { i += 2; return { ref: "pensize", d: opx === "-" ? -k : k }; }
            return { ref: "pensize", d: 0 };
          }
          v = parseFloat(raw); if (isNaN(v)) throw new Error("A number is missing after \"" + t + "\""); return v;
        };
        if (t === "repeat") { var n = num(); if (toks[i++] !== "[") throw new Error("repeat needs [ ]"); var b = block(); i++; out.push({ op: "repeat", n: n, body: b }); }
        else if (t === "forward" || t === "fd") out.push({ op: "fd", v: num() });
        else if (t === "back" || t === "bk") out.push({ op: "fd", v: num(), neg: true });
        else if (t === "right" || t === "rt") out.push({ op: "rt", v: num() });
        else if (t === "left" || t === "lt") out.push({ op: "rt", v: num(), neg: true });
        else if (t === "arc") out.push({ op: "arc", a: num(), r: num() });
        else if (t === "setxy") out.push({ op: "setxy", x: num(), y: num() });
        else if (t === "seth" || t === "setheading") out.push({ op: "seth", v: num() });
        else if (t === "setcolor" || t === "color") out.push({ op: "color", v: num() });
        else if (t === "setpensize" || t === "pensize") out.push({ op: "size", v: num() });
        else if (t === "startfill") out.push({ op: "sf" });
        else if (t === "endfill") out.push({ op: "ef" });
        else if (t === "clean" || t === "clear") out.push({ op: "clean" });
        else if (t === "penup" || t === "pu") out.push({ op: "pu" });
        else if (t === "pendown" || t === "pd") out.push({ op: "pd" });
        else throw new Error("I don't know \"" + t + "\". Try forward, back, right, left, repeat, arc, setxy, seth, set color, set pensize, start fill, end fill.");
      }
      return out;
    }
    var prog = block(), st = { x: 0, y: 0, h: 0, pen: true, segs: [], fills: [], turned: 0, steps: 0, color: "#E11D2E", size: 3, fill: null };
    function val(v) { return typeof v === "object" ? st.size + v.d : v; }
    function move(d) {
      var nx = st.x + d * Math.sin(st.h * Math.PI / 180), ny = st.y - d * Math.cos(st.h * Math.PI / 180);
      if (st.pen) st.segs.push([st.x, st.y, nx, ny, st.color, Math.max(1, st.size)]);
      st.x = nx; st.y = ny; if (st.fill) st.fill.pts.push([nx, ny]);
    }
    (function run(p) { p.forEach(function (c) {
      if (st.steps++ > 60000) throw new Error("That's too many steps for the turtle.");
      if (c.op === "repeat") { for (var k = 0; k < val(c.n); k++) run(c.body); }
      else if (c.op === "fd") move(c.neg ? -val(c.v) : val(c.v));
      else if (c.op === "rt") { var v = c.neg ? -val(c.v) : val(c.v); st.h += v; st.turned += v; }
      else if (c.op === "arc") { var A = val(c.a), R = val(c.r), n2 = Math.max(1, Math.round(Math.abs(A))), stp = 2 * Math.PI * R / 360, dir = A < 0 ? -1 : 1;
        for (var j = 0; j < n2; j++) { st.h += dir * 0.5; move(stp); st.h += dir * 0.5; } st.turned += A; }
      else if (c.op === "setxy") { var X = val(c.x), Y = -val(c.y); if (st.pen) st.segs.push([st.x, st.y, X, Y, st.color, Math.max(1, st.size)]); st.x = X; st.y = Y; if (st.fill) st.fill.pts.push([X, Y]); }
      else if (c.op === "seth") st.h = val(c.v);
      else if (c.op === "color") st.color = MK.taColor(val(c.v));
      else if (c.op === "size") st.size = Math.max(0, val(c.v));
      else if (c.op === "sf") st.fill = { color: st.color, pts: [[st.x, st.y]] };
      else if (c.op === "ef") { if (st.fill) st.fills.push(st.fill); st.fill = null; }
      else if (c.op === "clean") { st.segs = []; st.fills = []; }
      else if (c.op === "pu") st.pen = false; else if (c.op === "pd") st.pen = true;
    }); })(prog);
    return st;
  };
  MK.turtleSVG = function (st, W) {
    W = W || 300;
    var xs = [0], ys = [0], pad = 0;
    st.segs.forEach(function (s) { xs.push(s[0], s[2]); ys.push(s[1], s[3]); pad = Math.max(pad, s[5] / 2); });
    st.fills.forEach(function (f) { f.pts.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); });
    xs.push(st.x); ys.push(st.y);
    var mnx = Math.min.apply(null, xs) - pad, mxx = Math.max.apply(null, xs) + pad, mny = Math.min.apply(null, ys) - pad, mxy = Math.max.apply(null, ys) + pad;
    var span = Math.max(mxx - mnx, mxy - mny, 60), sc = (W - 40) / span, ox = 20 - mnx * sc + ((W - 40) - (mxx - mnx) * sc) / 2, oy = 20 - mny * sc + ((W - 40) - (mxy - mny) * sc) / 2;
    var P = function (x, y) { return (x * sc + ox).toFixed(1) + "," + (y * sc + oy).toFixed(1); };
    var h = '<svg viewBox="0,0,' + W + ',' + W + '" xmlns="http://www.w3.org/2000/svg"><rect width="' + W + '" height="' + W + '" fill="#DBEAFE"/>';
    st.fills.forEach(function (f) { h += '<path d="M' + f.pts.map(function (p) { return P(p[0], p[1]); }).join("L") + 'Z" fill="' + f.color + '"/>'; });
    var groups = [], cur = null;
    st.segs.forEach(function (s) {
      if (!cur || cur.c !== s[4] || cur.w !== s[5]) { cur = { c: s[4], w: s[5], d: "", last: null }; groups.push(cur); }
      if (!cur.last || Math.abs(cur.last[0] - s[0]) > 1e-6 || Math.abs(cur.last[1] - s[1]) > 1e-6) cur.d += "M" + P(s[0], s[1]);
      cur.d += "L" + P(s[2], s[3]); cur.last = [s[2], s[3]];
    });
    groups.forEach(function (g) { h += '<path d="' + g.d + '" fill="none" stroke="' + g.c + '" stroke-width="' + Math.max(2, g.w * sc).toFixed(1) + '" stroke-linecap="round" stroke-linejoin="round"/>'; });
    var hx = st.x * sc + ox, hy = st.y * sc + oy;
    return h + '<g transform="translate(' + hx.toFixed(1) + ',' + hy.toFixed(1) + ') rotate(' + st.h + ')"><path d="M0,-10L7,7L0,3L-7,7Z" fill="#16A34A" stroke="#14532D"/></g></svg>';
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
        var st = MK.logo(ta.value); canvas.innerHTML = MK.turtleSVG(st, 300);
        var back = Math.abs(st.x) < 0.5 && Math.abs(st.y) < 0.5;
        info.innerHTML = "Total turning: <b>" + Math.round(st.turned) + "°</b>" + (back ? " · back at the start ✓" : "");
      } catch (e) { info.innerHTML = "<b style='color:var(--red)'>" + esc(e.message) + "</b>"; }
    }
    go.onclick = runIt; runIt();
  }
  // Static turtle picture: <div data-turtle-pic="repeat 5 [forward 150 right 144]" data-w="220"></div>
  function turtlePic(host) { try { host.innerHTML = MK.turtleSVG(MK.logo(host.dataset.turtlePic), +host.dataset.w || 220); } catch (e) { host.textContent = e.message; } }

  /* ---------- multiple-choice set: several questions on one slide ----------
     <div data-mcset='[{"q":"…","o":["…"],"a":1,"w":"why"}]' data-start="1" data-code="E4B_MID"></div> */
  function mcSet(host) {
    var items = JSON.parse(host.dataset.mcset), start = +host.dataset.start || 1, code = host.dataset.code || "";
    var grid = el("div", "mcs-grid"), picked = {};
    items.forEach(function (it, k) {
      var card = el("div", "mcs-card");
      card.appendChild(el("div", "mcs-q", "<b>" + (start + k) + ".</b> " + it.q));
      if (it.v) card.appendChild(el("div", "mcs-vis", it.v));
      var row = el("div", "mcs-opts"), fb = el("div", "mcs-fb");
      it.o.forEach(function (t, j) {
        var b = el("button", "mcs-opt", "<span>" + "ABCDEF"[j] + "</span> " + t);
        b.onclick = function () {
          if (picked[k] !== undefined) return;
          picked[k] = j; b.classList.add(j === it.a ? "right" : "wrong");
          if (j !== it.a) row.children[it.a].classList.add("right");
          fb.innerHTML = (j === it.a ? "<b style='color:var(--green)'>✓ Correct.</b> " : "<b style='color:var(--red)'>✗ Not quite.</b> ") + (it.w || "");
          upd();
        };
        row.appendChild(b);
      });
      card.appendChild(row); card.appendChild(fb); grid.appendChild(card);
    });
    var tally = el("div", "rt-result", "");
    host.appendChild(grid); host.appendChild(tally);
    function upd() {
      var done = Object.keys(picked).length, ok = Object.keys(picked).filter(function (k) { return picked[k] === items[k].a; }).length;
      tally.innerHTML = "Answered <b>" + done + "</b> of " + items.length + " · correct <b>" + ok + "</b>" +
        (code && done === items.length ? " · your code: <span class='code-sample'>" + code + " · " + ok + "/" + items.length + " · missed: " +
          (items.map(function (it, k) { return picked[k] === it.a ? null : start + k; }).filter(function (x) { return x !== null; }).join(", ") || "none") + "</span>" : "");
    }
    upd();
  }

  /* ---------- 24-point game: <div data-twentyfour='[[1,2,3,4],…]' data-sols='["(1+2+3)×4",…]'></div> ---------- */
  function twentyFour(host) {
    var sets = JSON.parse(host.dataset.twentyfour), sols = JSON.parse(host.dataset.sols || "[]"), k = 0;
    var cards = el("div", "tf-cards"), inp = el("input", "name-input"), out = el("div", "rt-result", "");
    inp.placeholder = "Type an expression, e.g. (8 − 2) × (3 + 1)"; inp.style.width = "100%";
    var ctr = el("div", "btn-row"), bC = el("button", "btn teal", "Check = 24?"), bN = el("button", "btn ghost", "New cards ▸"), bS = el("button", "btn ghost", "Show a solution");
    [bC, bN, bS].forEach(function (b) { ctr.appendChild(b); });
    host.appendChild(cards); host.appendChild(inp); host.appendChild(ctr); host.appendChild(out);
    function show() { cards.innerHTML = sets[k].map(function (n) { return "<div class='tf-card'>" + n + "</div>"; }).join(""); inp.value = ""; out.textContent = "Use all four numbers once each, with + − × ÷ and brackets, to make 24."; }
    function check() {
      var e = inp.value.replace(/×|x|X/g, "*").replace(/÷/g, "/").replace(/−|–/g, "-");
      if (!/^[0-9+\-*/().\s]+$/.test(e)) { out.innerHTML = "<b style='color:var(--red)'>Only numbers, + − × ÷ and brackets, please.</b>"; return; }
      var used = (e.match(/\d+/g) || []).map(Number).sort(function (a, b) { return a - b; }), need = sets[k].slice().sort(function (a, b) { return a - b; });
      if (used.join(",") !== need.join(",")) { out.innerHTML = "<b style='color:var(--red)'>Use each card exactly once:</b> " + need.join(", ") + "."; return; }
      var v; try { v = Function("return (" + e + ")")(); } catch (er) { out.innerHTML = "<b style='color:var(--red)'>That expression doesn't work. Check your brackets.</b>"; return; }
      out.innerHTML = Math.abs(v - 24) < 1e-9 ? "<b style='color:var(--green)'>🎉 24! Well done.</b>" : "That makes <b>" + (Math.round(v * 1000) / 1000) + "</b>, not 24. Try again.";
    }
    bC.onclick = check; inp.addEventListener("keydown", function (ev) { if (ev.key === "Enter") check(); });
    bN.onclick = function () { k = (k + 1) % sets.length; show(); };
    bS.onclick = function () { out.innerHTML = "One way: <b>" + (sols[k] || "?") + " = 24</b>"; };
    show();
  }


  /* ---------- AI & DATA WIDGETS ---------- */
  // Graph maker: <div data-graphmaker='{"title":"How we get to school","rows":[["Walk",6],["Car",9]]}'></div>
  function graphMaker(host) {
    var cfg = JSON.parse(host.dataset.graphmaker || "{}"), rows = cfg.rows || [["", 0]];
    while (rows.length < 5) rows.push(["", 0]);
    var wrap = el("div", "turtle-wrap"), left = el("div", ""), right = el("div", "");
    var title = el("input", "name-input"); title.value = cfg.title || "Our class survey"; title.style.width = "100%";
    left.appendChild(el("div", "expect", "Title")); left.appendChild(title);
    left.appendChild(el("div", "expect", "Categories and counts"));
    var ins = rows.map(function (r) {
      var line = el("div", "num-row"), a = el("input", "name-input"), b = el("input", "num-input");
      a.value = r[0]; a.placeholder = "category"; a.style.width = "150px"; b.value = r[1] || ""; b.placeholder = "0"; b.style.width = "90px"; b.inputMode = "numeric";
      line.appendChild(a); line.appendChild(b); left.appendChild(line); return [a, b];
    });
    var sc = el("select", ""); sc.innerHTML = '<option value="1">Scale: count by 1s</option><option value="2">Scale: count by 2s</option><option value="5">Scale: count by 5s</option>';
    sc.style.cssText = "font:inherit;padding:8px;margin-top:8px;border:1px solid var(--line);border-radius:6px";
    left.appendChild(sc);
    var facts = el("div", "rt-result", ""); left.appendChild(facts);
    var pic = el("div", ""); right.appendChild(pic);
    wrap.appendChild(left); wrap.appendChild(right); host.appendChild(wrap);
    var COLS = ["#0EA5A0", "#FB923C", "#3776AB", "#9966FF", "#16A34A"];
    function draw() {
      var data = ins.map(function (r) { return [r[0].value.trim(), Math.max(0, parseInt(r[1].value, 10) || 0)]; }).filter(function (d) { return d[0]; });
      var step = +sc.value, mx = Math.max.apply(null, data.map(function (d) { return d[1]; }).concat([step]));
      var top = Math.ceil(mx / step) * step, W = 340, H = 260, L = 44, B = 210, T = 34, bw = (W - L - 10) / Math.max(1, data.length);
      var Y = function (v) { return B - v / top * (B - T); };
      var s = '<svg viewBox="0,0,' + W + ',' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:360px;background:#fff;border:1px solid #E2E8F0;border-radius:8px">';
      s += '<text x="' + W / 2 + '" y="20" text-anchor="middle" font-family="Helvetica" font-size="14" font-weight="700" fill="#0F1B2D">' + esc(title.value) + "</text>";
      for (var v = 0; v <= top; v += step) s += '<path d="M' + L + "," + Y(v).toFixed(1) + "L" + (W - 8) + "," + Y(v).toFixed(1) + '" stroke="#E2E8F0"/><text x="' + (L - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end" font-family="Helvetica" font-size="11" fill="#475569">' + v + "</text>";
      data.forEach(function (d, i) {
        var x = L + i * bw + bw * 0.18;
        s += '<rect x="' + x.toFixed(1) + '" y="' + Y(d[1]).toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + (B - Y(d[1])).toFixed(1) + '" fill="' + COLS[i % 5] + '"/>';
        s += '<text x="' + (x + bw * 0.32).toFixed(1) + '" y="' + (B + 16) + '" text-anchor="middle" font-family="Helvetica" font-size="12" fill="#0F1B2D">' + esc(d[0]) + "</text>";
      });
      s += '<path d="M' + L + "," + (T - 6) + "L" + L + "," + B + "L" + (W - 8) + "," + B + '" fill="none" stroke="#0F1B2D" stroke-width="2"/></svg>';
      pic.innerHTML = s;
      if (data.length) {
        var tot = data.reduce(function (a, d) { return a + d[1]; }, 0), most = data.slice().sort(function (a, b) { return b[1] - a[1]; });
        facts.innerHTML = "Total: <b>" + tot + "</b> · Most: <b>" + esc(most[0][0]) + "</b> · Least: <b>" + esc(most[most.length - 1][0]) + "</b> · Fair share: <b>" + (Math.round(tot / data.length * 10) / 10) + "</b> each";
      }
    }
    host.addEventListener("input", draw); sc.addEventListener("change", draw); draw();
  }

  // Find the Star: <div data-findstar></div>
  function findStar(host) {
    var wrap = el("div", "turtle-wrap"), left = el("div", ""), right = el("div", "");
    var row = el("div", "num-row"), gx = el("input", "num-input"), gy = el("input", "num-input"), go = el("button", "btn teal", "Guess");
    gx.placeholder = "x (−240 to 240)"; gy.placeholder = "y (−180 to 180)"; gx.style.width = gy.style.width = "150px";
    row.appendChild(gx); row.appendChild(gy); row.appendChild(go);
    var tolRow = el("div", "num-row"), tol = el("input", ""); tol.type = "range"; tol.min = 10; tol.max = 80; tol.step = 10; tol.value = 20;
    var tolLab = el("span", "", ""); tolRow.appendChild(el("span", "", "Close enough within: ")); tolRow.appendChild(tol); tolRow.appendChild(tolLab);
    var msg = el("div", "rt-result", ""), log = el("div", "");
    var ctr = el("div", "btn-row"), nw = el("button", "btn ghost", "New star"), show = el("button", "btn ghost", "Show the star");
    ctr.appendChild(nw); ctr.appendChild(show);
    left.appendChild(el("div", "expect", "Your guess")); left.appendChild(row); left.appendChild(tolRow); left.appendChild(msg); left.appendChild(ctr); left.appendChild(log);
    var pic = el("div", "turtle-canvas"); right.appendChild(pic);
    wrap.appendChild(left); wrap.appendChild(right); host.appendChild(wrap);
    var star, guesses, won, reveal;
    function rnd(a, b) { return Math.round((a + Math.random() * (b - a)) / 10) * 10; }
    function reset() { star = [rnd(-220, 220), rnd(-160, 160)]; guesses = []; won = false; reveal = false; msg.textContent = "A star is hiding somewhere on the stage. Type an x and a y, then press Guess."; draw(); }
    function draw() {
      var s = 0.6, X = function (v) { return 150 + v * s; }, Y = function (v) { return 150 - v * s; };
      var h = '<svg viewBox="0,0,300,300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#fff"/><rect x="6" y="42" width="288" height="216" fill="#F8FAFC" stroke="#0F1B2D" stroke-width="2"/>';
      for (var v = -200; v <= 200; v += 100) h += '<path d="M' + X(v) + ',42L' + X(v) + ',258" stroke="#E2E8F0"/>';
      for (v = -100; v <= 100; v += 100) h += '<path d="M6,' + Y(v) + 'L294,' + Y(v) + '" stroke="#E2E8F0"/>';
      h += '<path d="M6,150L294,150M150,42L150,258" stroke="#0F1B2D" stroke-width="1.2"/>';
      h += '<text x="10" y="164" font-size="10" fill="#475569" font-family="Helvetica">−240</text><text x="290" y="164" text-anchor="end" font-size="10" fill="#475569" font-family="Helvetica">240</text><text x="154" y="54" font-size="10" fill="#475569" font-family="Helvetica">180</text><text x="154" y="254" font-size="10" fill="#475569" font-family="Helvetica">−180</text>';
      guesses.forEach(function (g, i) { h += '<circle cx="' + X(g[0]) + '" cy="' + Y(g[1]) + '" r="5" fill="' + (i === guesses.length - 1 ? "#DC2626" : "#94A3B8") + '"/><text x="' + (X(g[0]) + 7) + '" y="' + (Y(g[1]) - 5) + '" font-size="10" font-family="Helvetica" fill="#475569">' + (i + 1) + "</text>"; });
      if (won || reveal) h += '<text x="' + X(star[0]) + '" y="' + (Y(star[1]) + 8) + '" text-anchor="middle" font-size="24" fill="#F59E0B">★</text>';
      pic.innerHTML = h + "</svg>";
      tolLab.textContent = " " + tol.value + " steps";
      if (guesses.length) {
        var t = '<table class="data-table" style="margin-top:10px"><tr><th>#</th><th>x</th><th>y</th><th>How far</th></tr>';
        guesses.slice().reverse().forEach(function (g) { t += "<tr><td>" + g[3] + "</td><td class='n'>" + g[0] + "</td><td class='n'>" + g[1] + "</td><td class='n'>" + g[2] + "</td></tr>"; });
        log.innerHTML = t + "</table>";
      } else log.innerHTML = "";
    }
    go.onclick = function () {
      if (won) return;
      var x = parseInt(gx.value, 10), y = parseInt(gy.value, 10);
      if (isNaN(x) || isNaN(y) || x < -240 || x > 240 || y < -180 || y > 180) { msg.textContent = "x must be from −240 to 240 and y from −180 to 180."; return; }
      var d = Math.round(Math.sqrt(Math.pow(x - star[0], 2) + Math.pow(y - star[1], 2)));
      guesses.push([x, y, d, guesses.length + 1]);
      if (d <= +tol.value) { won = true; msg.innerHTML = "<b style='color:var(--green)'>🎉 Found it in " + guesses.length + " guess" + (guesses.length > 1 ? "es" : "") + "!</b> The star was at (" + star[0] + ", " + star[1] + ")."; }
      else {
        var prev = guesses.length > 1 ? guesses[guesses.length - 2][2] : null;
        msg.innerHTML = "About <b>" + d + "</b> steps away. " + (prev === null ? "" : d < prev ? "🔥 Warmer!" : "🧊 Colder.") + " Hint: the star is " + (star[0] > x ? "right" : star[0] < x ? "left" : "") + (star[0] !== x && star[1] !== y ? " and " : "") + (star[1] > y ? "up" : star[1] < y ? "down" : "") + ".";
      }
      draw();
    };
    [gx, gy].forEach(function (i) { i.addEventListener("keydown", function (e) { if (e.key === "Enter") go.onclick(); }); });
    nw.onclick = reset; show.onclick = function () { reveal = true; draw(); }; tol.oninput = draw;
    reset();
  }


  /* ---------- 4A WIDGETS (Sessions 3–12) ---------- */
  function svgWrap(w, h, body, maxw) { return '<svg viewBox="0,0,' + w + ',' + h + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:' + (maxw || w) + 'px;background:#fff;border:1px solid #E2E8F0;border-radius:8px">' + body + "</svg>"; }
  function numIn(v, w) { var i = el("input", "num-input"); i.value = v; i.style.width = (w || 110) + "px"; i.inputMode = "numeric"; return i; }
  function lab(t) { return el("span", "", t); }
  function twoCol(host) { var wrap = el("div", "turtle-wrap"), l = el("div", ""), r = el("div", ""); wrap.appendChild(l); wrap.appendChild(r); host.appendChild(wrap); return [l, r]; }
  var G = MK.group;

  // Area model: <div data-areamodel="347,6"></div>
  function areaModelW(host) {
    var v = host.dataset.areamodel.split(","), a = numIn(v[0]), b = numIn(v[1], 80), row = el("div", "num-row"), pic = el("div", ""), out = el("div", "rt-result");
    row.appendChild(a); row.appendChild(lab(" × ")); row.appendChild(b); host.appendChild(row); host.appendChild(pic); host.appendChild(out);
    var parts = function (n) { var s = String(n), o = []; for (var i = 0; i < s.length; i++) if (s[i] !== "0") o.push(+s[i] * Math.pow(10, s.length - 1 - i)); return o; };
    function draw() {
      var A = Math.min(9999, Math.max(1, parseInt(a.value, 10) || 1)), B = Math.min(99, Math.max(1, parseInt(b.value, 10) || 1)), pa = parts(A), pb = parts(B);
      var tot = pa.reduce(function (x, y) { return x + y; }, 0), ws = pa.map(function (p) { return Math.max(70, 460 * p / tot); }), sc = 460 / ws.reduce(function (x, y) { return x + y; }, 0);
      var cols = ["#DBEAFE", "#FEF3C7", "#DCFCE7", "#FCE7F3"], h = "", x = 70, prods = [];
      pa.forEach(function (p, i) {
        var w = ws[i] * sc; h += '<text x="' + (x + w / 2) + '" y="30" text-anchor="middle" font-family="Georgia" font-size="16" font-weight="700" fill="#0F1B2D">' + G(p) + "</text>";
        pb.forEach(function (q, j) {
          var y = 40 + j * 66; prods.push(p * q);
          h += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="60" fill="' + cols[i % 4] + '" stroke="#0F1B2D" stroke-width="2"/>';
          h += '<text x="' + (x + w / 2) + '" y="' + (y + 36) + '" text-anchor="middle" font-family="Georgia" font-size="15" font-weight="700" fill="#0B7C78">' + G(p * q) + "</text>";
          if (i === 0) h += '<text x="60" y="' + (y + 36) + '" text-anchor="end" font-family="Georgia" font-size="16" font-weight="700" fill="#0F1B2D">' + G(q) + "</text>";
        });
        x += w;
      });
      pic.innerHTML = svgWrap(560, 50 + 66 * pb.length, h, 520);
      out.innerHTML = prods.map(G).join(" + ") + " = <b>" + G(A * B) + "</b>";
    }
    a.oninput = b.oninput = draw; draw();
  }
  // Times-table explorer: <div data-timesgrid></div>
  function timesGrid(host) {
    var t = el("table", "pv-table times"), out = el("div", "rt-result", "Click any square.");
    var h = "<tr><th>×</th>"; for (var c = 1; c <= 10; c++) h += "<th>" + c + "</th>"; h += "</tr>";
    for (var r = 1; r <= 10; r++) { h += "<tr><th>" + r + "</th>"; for (c = 1; c <= 10; c++) h += '<td data-r="' + r + '" data-c="' + c + '"></td>'; h += "</tr>"; }
    t.innerHTML = h; host.appendChild(t); host.appendChild(out);
    t.addEventListener("click", function (e) {
      var td = e.target.closest("td"); if (!td) return; var r = +td.dataset.r, c = +td.dataset.c;
      t.querySelectorAll("td").forEach(function (x) { var rr = +x.dataset.r, cc = +x.dataset.c; x.textContent = (rr <= r && cc <= c) ? rr * cc : ""; x.className = (rr <= r && cc <= c) ? (rr === r && cc === c ? "hl" : "on") : ""; });
      var tip = r === c ? "a square number!" : (r * c === c * r ? "same as " + c + " × " + r + ": switch the order, same answer." : "");
      out.innerHTML = "<b>" + r + " × " + c + " = " + r * c + "</b>. The shaded rectangle is " + r + " rows of " + c + ". " + tip + (c > 5 ? " Strategy: " + r + " × 5 = " + r * 5 + ", plus " + r + " × " + (c - 5) + " = " + r * (c - 5) + "." : "");
    });
  }
  // Share it out: <div data-divider="23,4"></div>
  function divider(host) {
    var v = host.dataset.divider.split(","), n = numIn(v[0], 90), d = numIn(v[1], 70), row = el("div", "num-row"), pic = el("div", ""), out = el("div", "rt-result");
    row.appendChild(n); row.appendChild(lab(" shared into ")); row.appendChild(d); row.appendChild(lab(" equal groups")); host.appendChild(row); host.appendChild(pic); host.appendChild(out);
    function draw() {
      var N = Math.min(60, Math.max(0, parseInt(n.value, 10) || 0)), D = Math.min(8, Math.max(1, parseInt(d.value, 10) || 1)), q = Math.floor(N / D), r = N % D;
      var gw = Math.max(64, 18 + 14 * Math.ceil(q / 3)), h = "", x = 8;
      for (var k = 0; k < D; k++) {
        h += '<rect x="' + x + '" y="8" width="' + gw + '" height="74" rx="10" fill="#F1F5F9" stroke="#94A3B8"/>';
        var per = Math.max(1, Math.floor((gw - 14) / 14));
        for (var t = 0; t < q; t++) h += '<circle cx="' + (x + 14 + (t % per) * 14) + '" cy="' + (22 + Math.floor(t / per) * 14) + '" r="5" fill="#0EA5A0"/>';
        x += gw + 10;
      }
      for (t = 0; t < r; t++) h += '<circle cx="' + (x + 12 + t * 16) + '" cy="45" r="6" fill="#DC2626"/>';
      pic.innerHTML = svgWrap(x + Math.max(1, r) * 16 + 30, 92, h, 640);
      out.innerHTML = G(N) + " ÷ " + D + " = <b>" + q + (r ? " R " + r : "") + "</b>. Each group gets " + q + (r ? ", and " + r + " " + (r === 1 ? "is" : "are") + " left over. The remainder is always less than " + D + "." : ". Nothing is left over.") + " Check: " + D + " × " + q + (r ? " + " + r : "") + " = " + N + ".";
    }
    n.oninput = d.oninput = draw; draw();
  }
  // Fraction comparer: <div data-fractions="2,3,3,4"></div>
  function fractionsW(host) {
    var v = host.dataset.fractions.split(","), ins = v.map(function (x) { return numIn(x, 64); }), row = el("div", "num-row"), pic = el("div", ""), out = el("div", "rt-result");
    row.appendChild(ins[0]); row.appendChild(lab(" / ")); row.appendChild(ins[1]); row.appendChild(lab("   and   ")); row.appendChild(ins[2]); row.appendChild(lab(" / ")); row.appendChild(ins[3]);
    host.appendChild(row); host.appendChild(pic); host.appendChild(out);
    function bar(nu, de, y, col) { var h = "", w = 460 / de; for (var k = 0; k < de; k++) h += '<rect x="' + (10 + k * w) + '" y="' + y + '" width="' + w + '" height="36" fill="' + (k < nu ? col : "#fff") + '" stroke="#0F1B2D" stroke-width="1.5"/>'; return h + '<text x="485" y="' + (y + 25) + '" font-family="Georgia" font-size="18" font-weight="700" fill="#0F1B2D">' + nu + "/" + de + "</text>"; }
    function draw() {
      var a = Math.max(0, +ins[0].value || 0), b = Math.min(24, Math.max(1, +ins[1].value || 1)), c = Math.max(0, +ins[2].value || 0), d = Math.min(24, Math.max(1, +ins[3].value || 1));
      a = Math.min(a, b); c = Math.min(c, d);
      pic.innerHTML = svgWrap(540, 100, bar(a, b, 8, "#0EA5A0") + bar(c, d, 54, "#FB923C"), 540);
      var l = a * d, r = c * b, sym = l === r ? "=" : (l > r ? ">" : "<");
      out.innerHTML = "<b>" + a + "/" + b + " " + sym + " " + c + "/" + d + "</b>. Same-size pieces: " + a + "/" + b + " = " + (a * d) + "/" + (b * d) + " and " + c + "/" + d + " = " + (c * b) + "/" + (d * b) + "." + (l === r ? " They're <b>equivalent</b>: the same amount!" : "");
    }
    ins.forEach(function (i) { i.oninput = draw; }); draw();
  }
  // Decimal builder: <div data-decbuilder="3.405"></div>
  function decBuilder(host) {
    var digits = String(host.dataset.decbuilder || "0.000").replace(".", "").padStart(4, "0").slice(-4).split("").map(Number);
    var names = ["Ones", "Tenths", "Hundredths", "Thousandths"], wrap = el("div", "pvb"), cols = el("div", "pvb-cols"), dEls = [];
    names.forEach(function (nm, i) {
      if (i === 1) cols.appendChild(el("div", "dec-dot", "."));
      var c = el("div", "pvb-col " + (i === 0 ? "th" : "on")); c.appendChild(el("div", "lbl", nm));
      var up = el("button", "", "▲"), dn = el("button", "", "▼"), dg = el("div", "dg", "0");
      up.onclick = function () { digits[i] = (digits[i] + 1) % 10; draw(); }; dn.onclick = function () { digits[i] = (digits[i] + 9) % 10; draw(); };
      c.appendChild(up); c.appendChild(dg); c.appendChild(dn); cols.appendChild(c); dEls.push(dg);
    });
    var out = el("div", "pvb-out"), vS = el("div", "v big-num"), vF = el("div", "v"), vE = el("div", "v");
    out.appendChild(el("div", "k", "Decimal")); out.appendChild(vS); out.appendChild(el("div", "k", "Fraction")); out.appendChild(vF); out.appendChild(el("div", "k", "Expanded")); out.appendChild(vE);
    wrap.appendChild(cols); wrap.appendChild(out); host.appendChild(wrap);
    function draw() {
      digits.forEach(function (d, i) { dEls[i].textContent = d; });
      var thou = digits[0] * 1000 + digits[1] * 100 + digits[2] * 10 + digits[3];
      vS.textContent = digits[0] + "." + digits.slice(1).join("");
      vF.textContent = digits[0] + " and " + (thou % 1000) + "/1000";
      var e = []; [1, 0.1, 0.01, 0.001].forEach(function (p, i) { if (digits[i]) e.push((digits[i] * p).toFixed(i)); });
      vE.textContent = e.length ? e.join(" + ") : "0";
    }
    draw();
  }
  // Pattern machine: <div data-pattern="3,+,4"></div>  (start, op, step)
  function patternW(host) {
    var v = host.dataset.pattern.split(","), st = numIn(v[0], 80), op = el("select", ""), k = numIn(v[2], 80), row = el("div", "num-row"), out = el("div", ""), q = el("div", "rt-result");
    op.innerHTML = '<option value="+">add</option><option value="×">multiply by</option><option value="−">subtract</option>'; op.value = v[1];
    op.style.cssText = "font:inherit;padding:8px;border:1px solid var(--line);border-radius:6px";
    row.appendChild(lab("Start at ")); row.appendChild(st); row.appendChild(lab(", then ")); row.appendChild(op); row.appendChild(k); row.appendChild(lab(" each step"));
    host.appendChild(row); host.appendChild(out); host.appendChild(q);
    function draw() {
      var a = parseInt(st.value, 10) || 0, s = parseInt(k.value, 10) || 0, vals = [a];
      for (var i = 1; i < 8; i++) vals.push(op.value === "+" ? vals[i - 1] + s : op.value === "−" ? vals[i - 1] - s : vals[i - 1] * s);
      out.innerHTML = '<table class="data-table"><tr><th>Step</th>' + vals.map(function (_, i) { return "<td class='n'>" + (i + 1) + "</td>"; }).join("") + "</tr><tr><th>Value</th>" + vals.map(function (x) { return "<td class='n'>" + G(x) + "</td>"; }).join("") + "</tr></table>";
      q.innerHTML = op.value === "+" ? "Rule: start at " + a + ", add " + s + ". Step <i>n</i> = " + a + " + " + s + " × (<i>n</i> − 1). Step 20 = <b>" + G(a + s * 19) + "</b>." :
        op.value === "−" ? "Rule: start at " + a + ", subtract " + s + ". Step 20 = <b>" + G(a - s * 19) + "</b>." : "Rule: start at " + a + ", multiply by " + s + " each time. It grows fast!";
    }
    st.oninput = k.oninput = op.onchange = draw; draw();
  }
  // Rectangle explorer: <div data-rect="6,4"></div>
  function rectW(host) {
    var v = host.dataset.rect.split(","), L = el("input", ""), W = el("input", ""), row = el("div", "num-row"), pic = el("div", ""), out = el("div", "rt-result");
    [L, W].forEach(function (i, k) { i.type = "range"; i.min = 1; i.max = 12; i.value = v[k]; });
    var lL = lab(""), lW = lab(""); row.appendChild(lab("Length ")); row.appendChild(L); row.appendChild(lL); row.appendChild(lab("   Width ")); row.appendChild(W); row.appendChild(lW);
    host.appendChild(row); host.appendChild(pic); host.appendChild(out);
    function draw() {
      var l = +L.value, w = +W.value, u = 26, h = "";
      for (var i = 0; i < l; i++) for (var j = 0; j < w; j++) h += '<rect x="' + (30 + i * u) + '" y="' + (16 + j * u) + '" width="' + u + '" height="' + u + '" fill="#DBEAFE" stroke="#93C5FD"/>';
      h += '<rect x="30" y="16" width="' + l * u + '" height="' + w * u + '" fill="none" stroke="#0F1B2D" stroke-width="2.5"/>';
      pic.innerHTML = svgWrap(30 + 12 * u + 20, 16 + 12 * u + 20, h, 360);
      lL.textContent = " " + l + " cm"; lW.textContent = " " + w + " cm";
      out.innerHTML = "Area = " + l + " × " + w + " = <b>" + l * w + " cm²</b> · Perimeter = 2 × (" + l + " + " + w + ") = <b>" + 2 * (l + w) + " cm</b>";
    }
    L.oninput = W.oninput = draw; draw();
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


  /* ---------- Chance simulator: <div data-sim='{"kind":"bag","items":[["red",9,"#DC2626"],["blue",9,"#2563EB"]]}'></div>  or {"kind":"dice","sides":6} ---------- */
  function simW(host) {
    var cfg = JSON.parse(host.dataset.sim), items;
    if (cfg.kind === "dice") { items = []; for (var f = 1; f <= (cfg.sides || 6); f++) items.push([String(f), 1, ["#0EA5A0", "#FB923C", "#3776AB", "#9966FF", "#16A34A", "#DC2626", "#CA8A04", "#0F1B2D"][(f - 1) % 8]]); }
    else items = cfg.items;
    var tot = items.reduce(function (a, it) { return a + it[1]; }, 0), counts = items.map(function () { return 0; }), n = 0, last = "";
    var wrap = el("div", "sim-wrap"), left = el("div", ""), right = el("div", "");
    var btns = el("div", "btn-row");
    [1, 10, 100].forEach(function (k) { var b = el("button", "btn teal", (cfg.kind === "dice" ? "Roll " : "Draw ") + k); b.onclick = function () { go(k); }; btns.appendChild(b); });
    var rs = el("button", "btn ghost", "Reset"); rs.onclick = function () { counts = counts.map(function () { return 0; }); n = 0; last = ""; draw(); }; btns.appendChild(rs);
    var info = el("div", "rt-result", ""), ai = el("div", "demo-note", "");
    left.appendChild(btns); left.appendChild(info); left.appendChild(ai);
    var pic = el("div", ""); right.appendChild(pic);
    wrap.appendChild(left); wrap.appendChild(right); host.appendChild(wrap);
    function pick() { var r = Math.random() * tot, a = 0; for (var i = 0; i < items.length; i++) { a += items[i][1]; if (r < a) return i; } return items.length - 1; }
    function go(k) { for (var j = 0; j < k; j++) { var i = pick(); counts[i]++; last = items[i][0]; } n += k; draw(); }
    function draw() {
      var W = 320, H = 210, L = 34, B = 170, T = 16, mx = Math.max(5, Math.max.apply(null, counts)), bw = (W - L - 8) / items.length;
      var s = '<svg viewBox="0,0,' + W + "," + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:340px;background:#fff;border:1px solid #E2E8F0;border-radius:8px">';
      items.forEach(function (it, i) {
        var h = counts[i] / mx * (B - T), x = L + i * bw + bw * 0.15;
        s += '<rect x="' + x.toFixed(1) + '" y="' + (B - h).toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + it[2] + '"/>';
        s += '<text x="' + (x + bw * 0.35).toFixed(1) + '" y="' + (B - h - 4).toFixed(1) + '" text-anchor="middle" font-family="Helvetica" font-size="12" fill="#0F1B2D">' + counts[i] + "</text>";
        s += '<text x="' + (x + bw * 0.35).toFixed(1) + '" y="' + (B + 16) + '" text-anchor="middle" font-family="Helvetica" font-size="12" fill="#0F1B2D">' + esc(it[0]) + "</text>";
        if (n) { var e = it[1] / tot * n / mx * (B - T); s += '<path d="M' + (x - 3).toFixed(1) + "," + (B - e).toFixed(1) + "L" + (x + bw * 0.7 + 3).toFixed(1) + "," + (B - e).toFixed(1) + '" stroke="#0F1B2D" stroke-width="2" stroke-dasharray="4 3"/>'; }
      });
      s += '<path d="M' + L + "," + T + "L" + L + "," + B + "L" + (W - 4) + "," + B + '" fill="none" stroke="#0F1B2D" stroke-width="2"/></svg>';
      pic.innerHTML = s;
      info.innerHTML = n ? "Total: <b>" + n + "</b>" + (last ? " · last one: <b>" + esc(last) + "</b>" : "") + "<br>" + items.map(function (it, i) { return esc(it[0]) + ": " + counts[i] + "/" + n + " ≈ <b>" + Math.round(counts[i] / n * 100) + "%</b> (chance " + it[1] + "/" + tot + ")"; }).join("<br>") : "Press a button to start. The dashed lines show what the chance predicts.";
      if (n) { var best = 0; counts.forEach(function (c, i) { if (c > counts[best]) best = i; }); ai.innerHTML = "<strong>What a data-only AI would say:</strong> \"Next one is probably <b>" + esc(items[best][0]) + "</b>, " + Math.round(counts[best] / n * 100) + "% sure.\" More data → closer to the true chance."; }
      else ai.innerHTML = "<strong>AI idea:</strong> an AI that has only seen the data guesses from the counts. Watch how its guess changes after 1, 10 and 100 draws.";
    }
    draw();
  }

  /* ---------- Fraction walker on a 480-step stage: <div data-walker='{"width":480,"fracs":["1/2","1/3","1/4"]}'></div> ---------- */
  function walkerW(host) {
    var cfg = JSON.parse(host.dataset.walker), Wd = cfg.width || 480, pos = 0, target = null;
    var stage = el("div", ""), row = el("div", "btn-row"), info = el("div", "rt-result", "");
    (cfg.fracs || []).forEach(function (f) {
      var b = el("button", "btn teal", "Walk " + f); b.onclick = function () { var p = f.split("/"); target = Wd * +p[0] / +p[1]; move(target, "Target " + f + " of " + Wd + " = " + Wd + " × " + f + " = <b>" + fmt(target) + "</b> steps."); }; row.appendChild(b);
    });
    var inp = el("input", "num-input"); inp.placeholder = "your steps"; inp.style.width = "130px"; inp.inputMode = "decimal";
    var go = el("button", "btn", "Walk my steps"); go.onclick = function () { var v = parseFloat(inp.value); if (isNaN(v)) return; move(v, target === null ? "You walked <b>" + fmt(v) + "</b> steps." : "You walked <b>" + fmt(v) + "</b>. Target <b>" + fmt(target) + "</b>. Off by <b>" + fmt(Math.abs(v - target)) + "</b> steps."); };
    var rs = el("button", "btn ghost", "Back to start"); rs.onclick = function () { move(0, "Back at the left edge (x = −" + Wd / 2 + ")."); };
    row.appendChild(inp); row.appendChild(go); row.appendChild(rs);
    host.appendChild(stage); host.appendChild(row); host.appendChild(info);
    function fmt(v) { return Math.round(v * 100) / 100; }
    function svg(p) {
      var W = 520, X = function (v) { return 20 + v / Wd * 480; }, s = '<svg viewBox="0,0,' + W + ',120" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:560px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px">';
      for (var g = 0; g <= Wd; g += Wd / 12) s += '<path d="M' + X(g).toFixed(1) + ',20L' + X(g).toFixed(1) + ',92" stroke="#CBD5E1"/>';
      [[0, "0"], [Wd / 4, "1/4"], [Wd / 3, "1/3"], [Wd / 2, "1/2"], [Wd, "1"]].forEach(function (t) { s += '<text x="' + X(t[0]).toFixed(1) + '" y="110" text-anchor="middle" font-family="Helvetica" font-size="12" fill="#475569">' + t[1] + "</text>"; });
      s += '<path d="M20,92L500,92" stroke="#0F1B2D" stroke-width="2"/>';
      if (target !== null) s += '<path d="M' + X(target).toFixed(1) + ',16L' + X(target).toFixed(1) + ',92" stroke="#DC2626" stroke-width="2" stroke-dasharray="5 4"/><text x="' + X(target).toFixed(1) + '" y="13" text-anchor="middle" font-family="Helvetica" font-size="11" fill="#DC2626">target</text>';
      s += '<g transform="translate(' + X(p).toFixed(1) + ',70)"><circle r="12" fill="#0EA5A0"/><circle cx="-4" cy="-3" r="2" fill="#fff"/><circle cx="4" cy="-3" r="2" fill="#fff"/><path d="M-6,8L-8,22M6,8L8,22" stroke="#0EA5A0" stroke-width="3"/></g></svg>';
      return s;
    }
    function move(to, msg) {
      var from = pos, t0 = null;
      function step(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 600); pos = from + (to - from) * k; stage.innerHTML = svg(pos); if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step); info.innerHTML = msg + " Scratch x = −" + Wd / 2 + " + " + fmt(to) + " = <b>" + fmt(to - Wd / 2) + "</b>.";
    }
    stage.innerHTML = svg(0); info.innerHTML = "The stage is " + Wd + " steps wide. Start: left edge.";
  }


  /* ---------- small helpers for the S9–S12 widgets ---------- */
  function svgWrap(W, H, body, maxw) { return '<svg viewBox="0,0,' + W + "," + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:' + (maxw || W) + 'px;background:#fff;border:1px solid #E2E8F0;border-radius:8px">' + body + "</svg>"; }
  function txt(x, y, t, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || "middle") + '" font-family="Helvetica,Arial" font-size="' + (o.s || 12) + '" font-weight="' + (o.w || 400) + '" fill="' + (o.c || "#0F1B2D") + '">' + t + "</text>"; }

  /* ---------- Guess my number (halving search): <div data-guess='{"max":100}'></div> ---------- */
  function guessW(host) {
    var cfg = JSON.parse(host.dataset.guess), max = cfg.max || 100, secret, lo, hi, tries, hist;
    var pic = el("div", ""), row = el("div", "btn-row"), info = el("div", "rt-result", "");
    var inp = el("input", "num-input"); inp.placeholder = "1 to " + max; inp.style.width = "120px"; inp.inputMode = "numeric";
    var go = el("button", "btn teal", "Guess"), mid = el("button", "btn", "Halfway hint"), nw = el("button", "btn ghost", "New number");
    row.appendChild(inp); row.appendChild(go); row.appendChild(mid); row.appendChild(nw);
    host.appendChild(row); host.appendChild(pic); host.appendChild(info);
    function reset() { secret = 1 + Math.floor(Math.random() * max); lo = 1; hi = max; tries = 0; hist = []; inp.value = ""; draw(); info.innerHTML = "I'm thinking of a number from 1 to " + max + ". Best plan: always guess the middle of what's left."; }
    function draw() {
      var W = 520, X = function (v) { return 20 + (v - 1) / (max - 1) * 480; }, b = '<rect x="20" y="30" width="480" height="22" fill="#F1F5F9"/>';
      b += '<rect x="' + X(lo).toFixed(1) + '" y="30" width="' + Math.max(3, X(hi) - X(lo)).toFixed(1) + '" height="22" fill="#99F6E4"/>';
      hist.forEach(function (h, i) { b += '<path d="M' + X(h).toFixed(1) + ',24L' + X(h).toFixed(1) + ',58" stroke="' + (h === secret ? "#16A34A" : "#DC2626") + '" stroke-width="2"/>' + txt(X(h).toFixed(1), 18, i + 1, { s: 10, c: "#475569" }); });
      b += txt(20, 74, "1", { s: 11 }) + txt(500, 74, max, { s: 11 }) + txt(260, 74, "still possible: " + lo + " to " + hi + " (" + (hi - lo + 1) + " numbers)", { s: 12, w: 700, c: "#0E7490" });
      pic.innerHTML = svgWrap(W, 82, b, 560);
    }
    go.onclick = function () {
      var g = parseInt(inp.value, 10); if (isNaN(g) || g < 1 || g > max) return; tries++; hist.push(g);
      if (g === secret) { lo = hi = g; draw(); info.innerHTML = "🎉 <b>" + g + "</b> is right! You took <b>" + tries + "</b> guess" + (tries > 1 ? "es" : "") + ". Halving always finishes in " + Math.ceil(Math.log(max + 1) / Math.LN2) + " or fewer."; return; }
      if (g < secret) lo = Math.max(lo, g + 1); else hi = Math.min(hi, g - 1);
      draw(); info.innerHTML = "Guess " + tries + ": <b>" + g + "</b> is too <b>" + (g < secret ? "low" : "high") + "</b>. Numbers left: " + (hi - lo + 1) + ".";
      inp.value = ""; inp.focus();
    };
    inp.onkeydown = function (e) { if (e.key === "Enter") go.onclick(); };
    mid.onclick = function () { inp.value = Math.floor((lo + hi) / 2); };
    nw.onclick = reset; reset();
  }

  /* ---------- Card sorter: <div data-sorter='{"nums":[7,3,9,1,5]}'></div> ---------- */
  function sorterW(host) {
    var cfg = JSON.parse(host.dataset.sorter), start = cfg.nums.slice(), a, sw, cmp, sel = -1, busy = false;
    var cardsBox = el("div", ""), row = el("div", "btn-row"), info = el("div", "rt-result", "");
    cardsBox.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin:10px 0";
    var auto = el("button", "btn teal", "Watch bubble sort"), rs = el("button", "btn ghost", "Shuffle back");
    row.appendChild(auto); row.appendChild(rs); host.appendChild(cardsBox); host.appendChild(row); host.appendChild(info);
    function sorted() { for (var i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false; return true; }
    function draw(hl) {
      cardsBox.innerHTML = "";
      a.forEach(function (v, i) {
        var c = el("button", "", String(v)); var on = (hl && hl.indexOf(i) >= 0) || i === sel;
        c.style.cssText = "width:54px;height:70px;border-radius:8px;font:700 22px Helvetica;border:2px solid " + (on ? "#FB923C" : "#0F1B2D") + ";background:" + (on ? "#FFEDD5" : "#fff") + ";cursor:pointer";
        c.onclick = function () { if (busy) return; if (sel < 0) { sel = i; draw(); return; } if (Math.abs(sel - i) === 1) { var t = a[sel]; a[sel] = a[i]; a[i] = t; sw++; } sel = -1; draw(); msg(); };
        cardsBox.appendChild(c);
      });
    }
    function msg() { info.innerHTML = (sorted() ? "✅ Sorted smallest → biggest! " : "Click two cards that are next to each other to swap them. ") + "Swaps: <b>" + sw + "</b>" + (cmp ? " · comparisons: <b>" + cmp + "</b>" : ""); }
    function reset() { a = start.slice(); sw = 0; cmp = 0; sel = -1; busy = false; draw(); msg(); }
    auto.onclick = function () {
      if (busy) return; a = start.slice(); sw = 0; cmp = 0; busy = true; var steps = [];
      var b = a.slice(); for (var p = 0; p < b.length - 1; p++) for (var i = 0; i < b.length - 1 - p; i++) { var s2 = b[i] > b[i + 1]; steps.push([i, s2]); if (s2) { var t = b[i]; b[i] = b[i + 1]; b[i + 1] = t; } }
      var k = 0; (function tick() {
        if (k >= steps.length) { busy = false; draw(); msg(); return; }
        var i = steps[k][0]; cmp++; if (steps[k][1]) { var t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; sw++; }
        draw([i, i + 1]); msg(); k++; setTimeout(tick, 420);
      })();
    };
    rs.onclick = reset; reset();
  }

  /* ---------- Reaction timer with outliers: <div data-react='{}'></div> ---------- */
  function reactW(host) {
    var times = [], state = "idle", t0 = 0, timer = null;
    var pad = el("button", "", "Press START"); pad.style.cssText = "width:100%;max-width:520px;height:120px;border-radius:12px;border:none;font:700 22px Helvetica;color:#fff;background:#0F1B2D;cursor:pointer";
    var row = el("div", "btn-row"), add = el("button", "btn", "Add a sneeze (slow) trial"), rs = el("button", "btn ghost", "Clear");
    row.appendChild(add); row.appendChild(rs);
    var pic = el("div", ""), info = el("div", "rt-result", "");
    host.appendChild(pad); host.appendChild(row); host.appendChild(pic); host.appendChild(info);
    function set(st, label, col) { state = st; pad.textContent = label; pad.style.background = col; }
    pad.onclick = function () {
      if (state === "idle" || state === "done") { set("wait", "Wait for GREEN…", "#DC2626"); timer = setTimeout(function () { set("go", "CLICK!", "#16A34A"); t0 = performance.now(); }, 1200 + Math.random() * 2200); }
      else if (state === "wait") { clearTimeout(timer); set("done", "Too early! Press to try again", "#B45309"); }
      else if (state === "go") { var ms = Math.round(performance.now() - t0); times.push(ms); set("done", ms + " ms · press for another try", "#0F1B2D"); draw(); }
    };
    add.onclick = function () { times.push(1500 + Math.round(Math.random() * 500)); draw(); };
    rs.onclick = function () { times = []; draw(); };
    function stats(v) { var s = v.slice().sort(function (x, y) { return x - y; }), n = s.length, mid = n % 2 ? s[(n - 1) / 2] : Math.round((s[n / 2 - 1] + s[n / 2]) / 2), mean = Math.round(v.reduce(function (x, y) { return x + y; }, 0) / n); return { s: s, mid: mid, mean: mean }; }
    function draw() {
      if (!times.length) { pic.innerHTML = ""; info.innerHTML = "Press START, wait for green, then click as fast as you can. Do 5 tries. Your times appear as dots."; return; }
      var st = stats(times), mx = Math.max(800, Math.max.apply(null, times) * 1.05), X = function (v) { return 20 + v / mx * 480; }, b = '<path d="M20,60L500,60" stroke="#0F1B2D" stroke-width="2"/>';
      for (var g = 0; g <= mx; g += mx > 1200 ? 500 : 200) b += '<path d="M' + X(g).toFixed(1) + ',56L' + X(g).toFixed(1) + ',64" stroke="#0F1B2D"/>' + txt(X(g).toFixed(1), 78, g, { s: 10, c: "#475569" });
      var out = times.filter(function (v) { return v > st.mid * 2; });
      times.forEach(function (v, i) { var o = v > st.mid * 2; b += '<circle cx="' + X(v).toFixed(1) + '" cy="' + (50 - (i % 3) * 9) + '" r="6" fill="' + (o ? "#DC2626" : "#0EA5A0") + '" opacity=".85"/>'; });
      b += '<path d="M' + X(st.mid).toFixed(1) + ',14L' + X(st.mid).toFixed(1) + ',60" stroke="#7C3AED" stroke-width="2" stroke-dasharray="4 3"/>' + txt(X(st.mid).toFixed(1), 11, "middle", { s: 10, c: "#7C3AED", w: 700 });
      pic.innerHTML = svgWrap(520, 86, b, 560);
      var clean = times.filter(function (v) { return v <= st.mid * 2; });
      info.innerHTML = "Times (ms): " + st.s.join(", ") + "<br>Middle value: <b>" + st.mid + "</b> · fair share (mean): <b>" + st.mean + "</b>" +
        (out.length ? "<br><span style='color:#DC2626'><b>Outlier" + (out.length > 1 ? "s" : "") + ":</b> " + out.join(", ") + " (more than double the middle).</span> Mean without " + (out.length > 1 ? "them" : "it") + ": <b>" + Math.round(clean.reduce(function (x, y) { return x + y; }, 0) / clean.length) + "</b>. The middle barely moves, the mean jumps!" : "");
    }
    draw();
  }

  /* ---------- Nearest-neighbour classifier: <div data-knn='{"x":"…","y":"…","pts":[[x,y,"label"],…],"cols":{"label":"#hex"}}'></div> ---------- */
  function knnW(host) {
    var cfg = JSON.parse(host.dataset.knn), k = 1, q = null, N = cfg.n || 10;
    var row = el("div", "btn-row"), b1 = el("button", "btn teal", "1 neighbour"), b3 = el("button", "btn", "3 neighbours (vote)");
    row.appendChild(b1); row.appendChild(b3); var pic = el("div", ""), info = el("div", "rt-result", "");
    host.appendChild(row); host.appendChild(pic); host.appendChild(info);
    b1.onclick = function () { k = 1; draw(); }; b3.onclick = function () { k = 3; draw(); };
    var u = 32, O = 40;
    function X(v) { return O + v * u; } function Y(v) { return O + (N - v) * u; }
    function draw() {
      var b = "";
      for (var i = 0; i <= N; i++) { b += '<path d="M' + X(i) + "," + Y(0) + "L" + X(i) + "," + Y(N) + 'M' + X(0) + "," + Y(i) + "L" + X(N) + "," + Y(i) + '" stroke="#E2E8F0"/>' + txt(X(i), Y(0) + 15, i, { s: 10, c: "#475569" }) + (i ? txt(X(0) - 8, Y(i) + 4, i, { s: 10, c: "#475569", a: "end" }) : ""); }
      b += txt(X(N / 2), Y(0) + 32, cfg.x, { s: 12, w: 700 }) + '<text transform="translate(12,' + Y(N / 2) + ') rotate(-90)" text-anchor="middle" font-family="Helvetica" font-size="12" font-weight="700" fill="#0F1B2D">' + cfg.y + "</text>";
      var near = [];
      if (q) {
        near = cfg.pts.map(function (p, i) { return { i: i, d: Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) }; }).sort(function (a, c) { return a.d - c.d || a.i - c.i; }).slice(0, k);
        near.forEach(function (n) { var p = cfg.pts[n.i]; b += '<path d="M' + X(q[0]) + "," + Y(q[1]) + "L" + X(p[0]) + "," + Y(q[1]) + "L" + X(p[0]) + "," + Y(p[1]) + '" fill="none" stroke="#FB923C" stroke-width="2.5" stroke-dasharray="5 3"/>'; });
      }
      cfg.pts.forEach(function (p) { b += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="9" fill="' + cfg.cols[p[2]] + '" stroke="#fff" stroke-width="2"/>'; });
      if (q) b += '<rect x="' + (X(q[0]) - 9) + '" y="' + (Y(q[1]) - 9) + '" width="18" height="18" fill="#0F1B2D"/>' + txt(X(q[0]), Y(q[1]) + 4, "?", { s: 13, w: 700, c: "#fff" });
      var lg = 0; Object.keys(cfg.cols).forEach(function (l) { b += '<circle cx="' + (X(N) + 22) + '" cy="' + (Y(N) + 8 + lg * 22) + '" r="7" fill="' + cfg.cols[l] + '"/>' + txt(X(N) + 34, Y(N) + 12 + lg * 22, l, { a: "start", s: 12 }); lg++; });
      pic.innerHTML = svgWrap(X(N) + 110, Y(0) + 42, b, 520);
      var svgEl = pic.querySelector("svg"); svgEl.style.cursor = "crosshair";
      svgEl.onclick = function (e) { var r = svgEl.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * (X(N) + 110), sy = (e.clientY - r.top) / r.height * (Y(0) + 42); var gx = Math.round((sx - O) / u), gy = Math.round(N - (sy - O) / u); if (gx < 0 || gy < 0 || gx > N || gy > N) return; q = [gx, gy]; draw(); };
      if (!q) { info.innerHTML = "Click any grid point to drop a new mystery item (■). The AI finds its nearest neighbour by counting grid steps (across + up)."; return; }
      var votes = {}; near.forEach(function (n) { var l = cfg.pts[n.i][2]; votes[l] = (votes[l] || 0) + 1; });
      var best = Object.keys(votes).sort(function (a, c) { return votes[c] - votes[a]; })[0];
      info.innerHTML = "Mystery item at (" + q[0] + ", " + q[1] + "). " + near.map(function (n) { var p = cfg.pts[n.i]; return p[2] + " at (" + p[0] + ", " + p[1] + ") is " + n.d + " steps away"; }).join("; ") + ".<br><b>AI label: " + best + "</b>" + (k > 1 ? " (vote " + Object.keys(votes).map(function (l) { return l + " " + votes[l]; }).join(" vs ") + ", so " + votes[best] + "/" + k + " agree)" : "") + ".";
    }
    draw();
  }

  /* ---------- Rock-paper-scissors bot that learns your habits: <div data-rps='{}'></div> ---------- */
  function rpsW(host) {
    var M = ["rock", "paper", "scissors"], E = { rock: "✊", paper: "✋", scissors: "✌️" }, beats = { rock: "paper", paper: "scissors", scissors: "rock" };
    var counts, after, last, score;
    var row = el("div", "btn-row"); M.forEach(function (m) { var b = el("button", "btn teal", E[m] + " " + m); b.onclick = function () { play(m); }; row.appendChild(b); });
    var rs = el("button", "btn ghost", "Reset the AI"); rs.onclick = reset; row.appendChild(rs);
    var out = el("div", "rt-result", ""), table = el("div", "");
    host.appendChild(row); host.appendChild(out); host.appendChild(table);
    function reset() { counts = { rock: 0, paper: 0, scissors: 0 }; after = {}; M.forEach(function (m) { after[m] = { rock: 0, paper: 0, scissors: 0 }; }); last = null; score = { ai: 0, you: 0, tie: 0 }; out.innerHTML = "Play at least 20 rounds. The AI keeps a tally of what you play after each move, and predicts your next one from the tally."; drawT(); }
    function predict() { var t = last ? after[last] : counts, best = "rock"; M.forEach(function (m) { if (t[m] > t[best]) best = m; }); var tot = t.rock + t.paper + t.scissors; return { m: tot ? best : M[Math.floor(Math.random() * 3)], tot: tot, n: t[best] }; }
    function play(me) {
      var p = predict(), ai = beats[p.m], res = ai === me ? "tie" : beats[me] === ai ? "ai" : "you";
      score[res]++; counts[me]++; if (last) after[last][me]++; last = me;
      var n = score.ai + score.you + score.tie;
      out.innerHTML = "AI predicted <b>" + p.m + "</b>" + (p.tot ? " (" + p.n + " of your last " + p.tot + " moves after this one)" : " (no data yet: random)") + ", so it played " + E[ai] + " <b>" + ai + "</b>. You played " + E[me] + " " + me + ": <b>" + (res === "ai" ? "AI wins" : res === "you" ? "you win" : "tie") + "</b>.<br>After " + n + " rounds the AI has won <b>" + score.ai + "/" + n + "</b>. Random guessing wins about 1/3.";
      drawT();
    }
    function drawT() {
      var h = '<table style="border-collapse:collapse;font:13px Helvetica;margin-top:8px"><tr><th style="padding:4px 8px;text-align:left">After you play…</th>' + M.map(function (m) { return '<th style="padding:4px 8px">' + E[m] + " next</th>"; }).join("") + "</tr>";
      M.forEach(function (r) { h += '<tr><td style="padding:4px 8px;border-top:1px solid #E2E8F0">' + E[r] + " " + r + "</td>" + M.map(function (m) { var v = after[r][m], mx = Math.max(after[r].rock, after[r].paper, after[r].scissors); return '<td style="padding:4px 8px;text-align:center;border-top:1px solid #E2E8F0;' + (v && v === mx ? "background:#FFEDD5;font-weight:700" : "") + '">' + v + "</td>"; }).join("") + "</tr>"; });
      table.innerHTML = h + "</table>";
    }
    reset();
  }


  /* ---------- Python in the browser (Skulpt) ---------- */
  MK.runPy = function (code, inputs) {
    return new Promise(function (resolve) {
      if (!window.Sk) { resolve({ out: "", err: "Python engine not loaded." }); return; }
      var out = "", queue = (inputs || []).slice();
      Sk.configure({ output: function (t) { out += t; }, read: function (f) { if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[f] === undefined) throw "File not found: '" + f + "'"; return Sk.builtinFiles.files[f]; },
        inputfun: function (p) { if (p) out += p; if (queue.length) { var v = String(queue.shift()); out += v + "\n"; return v; } var v2 = window.prompt(p || "input()") || ""; out += v2 + "\n"; return v2; }, inputfunTakesPrompt: true, execLimit: 4000, __future__: Sk.python3 });
      Sk.misceval.asyncToPromise(function () { return Sk.importMainWithBody("<stdin>", false, code, true); })
        .then(function () { resolve({ out: out, err: "" }); }, function (e) { var m = String(e && e.toString ? e.toString() : e); if (/TimeLimitError/.test(m)) m = "Your program ran too long (an endless loop?)."; resolve({ out: out, err: m }); });
    });
  };
  function numsIn(s) { return (String(s).match(/-?\d+(?:\.\d+)?/g) || []).map(Number); }
  MK.testPy = function (code, tests) {
    var i = 0, lines = [], pass = true;
    function next() {
      if (i >= tests.length) return Promise.resolve({ pass: pass, report: lines.join("\n") });
      var t = tests[i++];
      return MK.runPy(code, t.in).then(function (r) {
        var ins = (t.in || []).map(String);
        var printed = numsIn(r.out); var tail = printed.slice(printed.length - t.nums.length);
        var ok = !r.err && tail.length === t.nums.length && t.nums.every(function (v, k) { return Math.abs(v - tail[k]) < 1e-9; });
        if (!ok) pass = false;
        lines.push((ok ? "✅" : "❌") + " Test " + i + (t.in && t.in.length ? " (input " + t.in.join(", ") + ")" : "") + ": " + (ok ? "correct" : (r.err ? "error: " + r.err.split("\n")[0] : "expected " + t.nums.join(", ") + (tail.length ? ", got " + tail.join(", ") : ", got no numbers"))));
        return next();
      });
    }
    return next();
  };
  /* deck widget: <div data-py='{"code":"…","inputs":["275"]}'></div> */
  function pyW(host) {
    var cfg = JSON.parse(host.dataset.py), ed = el("textarea", "py-editor"); ed.value = cfg.code; ed.spellcheck = false; ed.rows = Math.max(5, cfg.code.split("\n").length + 1);
    var bar = el("div", "btn-row"), run = el("button", "btn teal", "▶ Run"), inBox = el("input", "num-input"), rs = el("button", "btn ghost", "Reset"), out = el("pre", "py-out", "Press ▶ Run.");
    inBox.placeholder = "input() value(s)"; inBox.style.width = "200px"; inBox.value = (cfg.inputs || []).join(", ");
    bar.appendChild(run); if (cfg.inputs) bar.appendChild(inBox); bar.appendChild(rs);
    host.appendChild(ed); host.appendChild(bar); host.appendChild(out);
    run.onclick = function () { var ins = inBox.value.trim() ? inBox.value.split(",").map(function (v) { return v.trim(); }) : []; out.textContent = "Running…"; MK.runPy(ed.value, ins).then(function (r) { out.textContent = (r.out || "") + (r.err ? "\n⚠️ " + r.err : "") || "(no output)"; out.className = "py-out" + (r.err ? " err" : ""); }); };
    rs.onclick = function () { ed.value = cfg.code; out.textContent = "Press ▶ Run."; out.className = "py-out"; };
  }

  /* ---------- Line Art (9B): Desmos-style equations → segments, drawing + checking ---------- */
  // Accepts: y = 0.8x + 4 · x = 3 · y = 2 · 2x + 3y = 6 · y - 2 = 3(x - 1) · restrictions {0 <= x <= 2} {y >= 1} (≤ ≥ < > too)
  function exprEval(src) {
    // tiny recursive-descent parser → function(x, y); implicit multiplication (2x, 3(x-1), (x+1)(2)) binds like *
    var s = src.replace(/\s+/g, ""), i = 0;
    if (!s) throw "empty side";
    function peek() { return s[i]; }
    function num() { var m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)); if (!m) return null; i += m[0].length; return parseFloat(m[0]); }
    function atom() {
      var c = peek();
      if (c === "(") { i++; var e = sum(); if (s[i] !== ")") throw "missing )"; i++; return e; }
      if (c === "x" || c === "y") { i++; return c === "x" ? function (x) { return x; } : function (x, y) { return y; }; }
      var n = num(); if (n === null) throw "can't read \"" + (c || "end") + "\""; return function () { return n; };
    }
    function power() { var b = atom(); if (s[i] === "^") { i++; var e = unary(); return function (x, y) { return Math.pow(b(x, y), e(x, y)); }; } return b; }
    function unary() { if (s[i] === "-") { i++; var u = unary(); return function (x, y) { return -u(x, y); }; } if (s[i] === "+") { i++; return unary(); } return power(); }
    function prod() {
      var l = unary();
      for (;;) {
        var c = peek();
        if (c === "*" || c === "/") { i++; var r = unary(); l = (function (l, r, c) { return c === "*" ? function (x, y) { return l(x, y) * r(x, y); } : function (x, y) { return l(x, y) / r(x, y); }; })(l, r, c); }
        else if (c === "(" || c === "x" || c === "y" || (c && /[\d.]/.test(c))) { var r2 = power(); l = (function (l, r) { return function (x, y) { return l(x, y) * r(x, y); }; })(l, r2); }
        else return l;
      }
    }
    function sum() {
      var l = prod();
      while (peek() === "+" || peek() === "-") { var c = s[i++], r = prod(); l = (function (l, r, c) { return c === "+" ? function (x, y) { return l(x, y) + r(x, y); } : function (x, y) { return l(x, y) - r(x, y); }; })(l, r, c); }
      return l;
    }
    var f = sum(); if (i < s.length) throw "can't read \"" + s.slice(i) + "\""; return f;
  }
  MK.parseLine = function (raw) {
    var s = String(raw).toLowerCase().replace(/\\left|\\right/g, "").replace(/\\le(q)?/g, "<=").replace(/\\ge(q)?/g, ">=").replace(/\\\{|\\\}/g, function (m) { return m[1]; })
      .replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/\\cdot/g, "*").replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)");
    var out = { src: String(raw).trim(), xr: [-Infinity, Infinity], yr: [-Infinity, Infinity], restricted: false };
    try {
      var rs = s.match(/\{[^}]*\}/g) || []; s = s.replace(/\{[^}]*\}/g, " ").trim();
      if (/[{}]/.test(s)) throw "check your { } brackets";
      rs.forEach(function (r) {
        var body = r.slice(1, -1).replace(/\s+/g, ""); if (!body) return;
        var parts = body.split(/(<=|>=|<|>)/); if (parts.length < 3) throw "a restriction needs < or <=, like {0 <= x <= 2}";
        for (var k = 0; k + 2 < parts.length; k += 2) {
          var L = parts[k], op = parts[k + 1], R = parts[k + 2], v, c, lowerVar;
          if (L === "x" || L === "y") { v = L; c = exprEval(R)(0, 0); lowerVar = op[0] === ">"; }       // x >= c → lower bound
          else if (R === "x" || R === "y") { v = R; c = exprEval(L)(0, 0); lowerVar = op[0] === "<"; }  // c <= x → lower bound
          else throw "a restriction must compare x or y with a number";
          var rr = v === "x" ? out.xr : out.yr;
          if (lowerVar) rr[0] = Math.max(rr[0], c); else rr[1] = Math.min(rr[1], c);
          out.restricted = true;
        }
      });
      var eq = s.split("=");
      if (eq.length !== 2) throw eq.length < 2 ? "an equation needs one = sign" : "use only one = sign";
      var L = exprEval(eq[0]), R = exprEval(eq[1]), F = function (x, y) { return L(x, y) - R(x, y); };
      var c0 = F(0, 0), a = F(1, 0) - c0, b = F(0, 1) - c0;
      [[2, 3], [-1.5, 0.7], [4, -2.5], [7, 9]].forEach(function (p) { if (!(Math.abs(F(p[0], p[1]) - (a * p[0] + b * p[1] + c0)) < 1e-6)) throw "that's not a straight line (no x², xy or dividing by x)"; });
      if (!isFinite(a) || !isFinite(b) || !isFinite(c0)) throw "can't read that";
      if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) throw "there's no x or y left in this equation";
      out.a = a; out.b = b; out.c = c0; out.ok = true;
      out.kind = Math.abs(b) < 1e-12 ? "vertical" : (Math.abs(a) < 1e-12 ? "horizontal" : "slanted");
      if (out.kind !== "vertical") { out.m = -a / b; out.k = -c0 / b; }
    } catch (e) { out.ok = false; out.err = String(e); }
    return out;
  };
  // clip to window ∩ restrictions → [[x1,y1],[x2,y2]] or null
  MK.lineSeg = function (L, win) {
    var x0 = Math.max(win[0], L.xr[0]), x1 = Math.min(win[1], L.xr[1]), y0 = Math.max(win[2], L.yr[0]), y1 = Math.min(win[3], L.yr[1]), e = 1e-9;
    if (x0 > x1 + e || y0 > y1 + e) return null;
    if (L.kind === "vertical") { var xv = -L.c / L.a; if (xv < x0 - e || xv > x1 + e) return null; return [[xv, y0], [xv, y1]]; }
    var lo = x0, hi = x1;
    if (L.kind === "slanted") { var ta = (y0 - L.k) / L.m, tb = (y1 - L.k) / L.m; lo = Math.max(lo, Math.min(ta, tb)); hi = Math.min(hi, Math.max(ta, tb)); }
    else if (L.k < y0 - e || L.k > y1 + e) return null;
    if (lo > hi + e) return null;
    return [[lo, L.m * lo + L.k], [hi, L.m * hi + L.k]];
  };
  var LINE_COLS = ["#0EA5A4", "#F97316", "#7C3AED", "#2563EB", "#DB2777", "#16A34A", "#CA8A04", "#DC2626"];
  MK.lineArtSVG = function (segs, target, win, size) {
    size = size || 380; var pad = 26, W = size, sx = (W - 2 * pad) / (win[1] - win[0]), sy = (W - 2 * pad) / (win[3] - win[2]);
    var X = function (x) { return (pad + (x - win[0]) * sx).toFixed(1); }, Y = function (y) { return (W - pad - (y - win[2]) * sy).toFixed(1); };
    var span = Math.max(win[1] - win[0], win[3] - win[2]), step = span > 24 ? 5 : (span > 12 ? 2 : 1), h = '<svg class="la-svg" viewBox="0 0 ' + W + " " + W + '" width="' + W + '" height="' + W + '">';
    h += '<rect x="' + pad + '" y="' + pad + '" width="' + (W - 2 * pad) + '" height="' + (W - 2 * pad) + '" fill="#fff" stroke="#CBD5E1"/>';
    for (var gx = Math.ceil(win[0]); gx <= win[1]; gx++) h += '<line x1="' + X(gx) + '" y1="' + Y(win[2]) + '" x2="' + X(gx) + '" y2="' + Y(win[3]) + '" stroke="' + (gx === 0 ? "#334155" : "#E2E8F0") + '" stroke-width="' + (gx === 0 ? 1.6 : 1) + '"/>' + (gx % step === 0 && gx !== 0 ? '<text x="' + X(gx) + '" y="' + (W - pad + 15) + '" font-size="11" text-anchor="middle" fill="#64748B">' + gx + "</text>" : "");
    for (var gy = Math.ceil(win[2]); gy <= win[3]; gy++) h += '<line x1="' + X(win[0]) + '" y1="' + Y(gy) + '" x2="' + X(win[1]) + '" y2="' + Y(gy) + '" stroke="' + (gy === 0 ? "#334155" : "#E2E8F0") + '" stroke-width="' + (gy === 0 ? 1.6 : 1) + '"/>' + (gy % step === 0 && gy !== 0 ? '<text x="' + (pad - 6) + '" y="' + (+Y(gy) + 4) + '" font-size="11" text-anchor="end" fill="#64748B">' + gy + "</text>" : "");
    (target || []).forEach(function (t) { h += '<line x1="' + X(t[0]) + '" y1="' + Y(t[1]) + '" x2="' + X(t[2]) + '" y2="' + Y(t[3]) + '" stroke="#94A3B8" stroke-width="7" stroke-linecap="round" opacity=".35"/>'; });
    (target || []).forEach(function (t) { [[t[0], t[1]], [t[2], t[3]]].forEach(function (p) { h += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="3.5" fill="#64748B"/>'; }); });
    segs.forEach(function (s, k) { if (s.seg) h += '<line x1="' + X(s.seg[0][0]) + '" y1="' + Y(s.seg[0][1]) + '" x2="' + X(s.seg[1][0]) + '" y2="' + Y(s.seg[1][1]) + '" stroke="' + LINE_COLS[k % LINE_COLS.length] + '" stroke-width="3" stroke-linecap="round"/>'; });
    return h + "</svg>";
  };
  MK.drawLines = function (text, win) {
    return String(text).split("\n").map(function (t, i) { return { t: t, i: i }; }).filter(function (o) { return o.t.trim() && !/^\s*(#|\/\/)/.test(o.t); })
      .map(function (o) { var L = MK.parseLine(o.t); L.seg = L.ok ? MK.lineSeg(L, win) : null; L.line = o.i + 1; return L; });
  };
  function near(p, q) { return Math.abs(p[0] - q[0]) < 0.02 && Math.abs(p[1] - q[1]) < 0.02; }
  function segMatch(s, t) { var A = [t[0], t[1]], B = [t[2], t[3]]; return (near(s[0], A) && near(s[1], B)) || (near(s[0], B) && near(s[1], A)); }
  function fmtN(v) { return String(Math.round(v * 100) / 100).replace("-", "−"); }
  MK.checkLines = function (text, cfg) {
    var lines = MK.drawLines(text, cfg.win), used = cfg.target.map(function () { return false; }), msgs = [], pass = true, bad = 0;
    lines.forEach(function (L) {
      if (!L.ok) { pass = false; msgs.push("❌ Line " + L.line + ": " + L.err); return; }
      if (!L.seg) { pass = false; msgs.push("❌ Line " + L.line + " (" + L.src + "): nothing shows on the grid. Check the restriction."); return; }
      var k = cfg.target.findIndex(function (t, j) { return !used[j] && segMatch(L.seg, t); });
      if (k >= 0) { used[k] = true; msgs.push("✅ Line " + L.line + ": matches a segment"); return; }
      pass = false; bad++;
      var why = !L.restricted ? "it has no restriction, so it runs across the whole grid. Add { … }." : "it goes from (" + fmtN(L.seg[0][0]) + ", " + fmtN(L.seg[0][1]) + ") to (" + fmtN(L.seg[1][0]) + ", " + fmtN(L.seg[1][1]) + "), which isn't one of the grey segments.";
      msgs.push("❌ Line " + L.line + " (" + L.src + "): " + why);
    });
    var miss = used.filter(function (u) { return !u; }).length;
    if (miss) { pass = false; msgs.push("⬜ " + miss + " grey segment" + (miss > 1 ? "s are" : " is") + " not drawn yet."); }
    return { pass: pass && lines.length > 0, report: msgs.join("\n") || "Type at least one equation.", lines: lines };
  };
  function lineArtBox(host, cfg, onCheck) {
    var wrap = el("div", "la-wrap"), left = el("div", "la-left"), right = el("div", "la-right");
    var ed = el("textarea", "la-editor"); ed.value = cfg.start || ""; ed.spellcheck = false; ed.rows = Math.min(12, Math.max(5, (cfg.start || "").split("\n").length + 2));
    ed.placeholder = "One equation per line, e.g.\ny = 2 {0 <= x <= 3}";
    var list = el("div", "la-list"), pic = el("div", "la-pic");
    left.appendChild(el("div", "expect", "Equations (one per line)")); left.appendChild(ed);
    var bar = el("div", "btn-row"); left.appendChild(bar); left.appendChild(list);
    right.appendChild(pic); wrap.appendChild(left); wrap.appendChild(right); host.appendChild(wrap);
    function draw() {
      var ls = MK.drawLines(ed.value, cfg.win);
      pic.innerHTML = MK.lineArtSVG(ls, cfg.target, cfg.win, cfg.size);
      list.innerHTML = ls.map(function (L, k) {
        var col = LINE_COLS[k % LINE_COLS.length];
        if (!L.ok) return '<div class="la-row err">⚠️ ' + esc(L.src) + " · " + esc(L.err) + "</div>";
        var info = L.kind === "vertical" ? "vertical · slope undefined" : (L.kind === "horizontal" ? "horizontal · slope 0" : "slope " + fmtN(L.m) + " · y-intercept " + fmtN(L.k));
        return '<div class="la-row"><span class="la-dot" style="background:' + col + '"></span><code>' + esc(L.src) + "</code> <span class='la-info'>" + info + (L.seg ? "" : " · not on the grid") + "</span></div>";
      }).join("");
    }
    ed.addEventListener("input", draw);
    var rs = el("button", "btn ghost", "Reset"); rs.onclick = function () { ed.value = cfg.start || ""; draw(); if (out) { out.textContent = ""; out.className = "py-out"; } };
    var out = null;
    if (cfg.target && onCheck !== false) {
      var chk = el("button", "btn teal", cfg.checkLabel || "Check my drawing"); out = el("pre", "py-out", "");
      bar.appendChild(chk); left.appendChild(out);
      chk.onclick = function () { var r = MK.checkLines(ed.value, cfg); out.textContent = r.report; out.className = "py-out" + (r.pass ? " ok" : " err"); if (onCheck) onCheck(r, chk, ed); };
    }
    bar.appendChild(rs); draw();
    return { ed: ed, draw: draw };
  }
  MK.lineArtBox = lineArtBox;
  /* deck widget: <div data-lines='{"win":[-1,10,-1,10],"start":"y = 2","target":[[0,0,2,0]]}'></div> */
  function linesW(host) { lineArtBox(host, JSON.parse(host.dataset.lines), host.dataset.nocheck ? false : null); }

  /* ---------- Spec builder (9A vibe coding): the spec IS the writing; it also becomes the AI prompt ----------
     <div data-spec='{"key":"moon2","fields":[{"id":"q","label":"…","ph":"…","rows":2}],"prompt":"…{q}…","report":"…{q}…"}'></div> */
  function specW(host) {
    var cfg = JSON.parse(host.dataset.spec), KEY = "rk_spec_" + cfg.key, MEM = (window.__rkSpec = window.__rkSpec || {});
    var store = MEM[KEY] = MEM[KEY] || {};   // shared by every spec box on the page, even without localStorage
    try { var saved = JSON.parse(localStorage.getItem(KEY) || "{}"); for (var sk in saved) if (store[sk] == null) store[sk] = saved[sk]; } catch (e) {}
    var boxes = {};
    cfg.fields.forEach(function (f) {
      var w = el("div", "spec-field");
      w.appendChild(el("label", "spec-label", f.label));
      var t = el("textarea", "spec-ta"); t.rows = f.rows || 2; t.placeholder = f.ph || ""; t.value = store[f.id] || "";
      t.addEventListener("input", function () { store[f.id] = t.value; try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} });
      boxes[f.id] = t; w.appendChild(t); host.appendChild(w);
    });
    var bar = el("div", "btn-row"), mk = el("button", "btn teal", "Make my AI prompt"), rp = el("button", "btn ghost", "Make my report draft"), out = el("pre", "py-out", ""), cp = el("button", "btn ghost", "Copy");
    bar.appendChild(mk); bar.appendChild(rp); host.appendChild(bar); host.appendChild(out);
    var cpRow = el("div", "btn-row"); cpRow.appendChild(cp); cpRow.style.display = "none"; host.appendChild(cpRow);
    function fill(tpl) {
      var miss = [];
      var s = tpl.replace(/\{(\w+)\}/g, function (_, id) { var v = boxes[id] ? boxes[id].value.trim() : String(store[id] || "").trim(); if (!v) miss.push(id); return v || "[" + id + "?]"; });
      return { s: s, miss: miss };
    }
    function show(tpl) {
      var r = fill(tpl);
      out.textContent = r.s; out.className = "py-out" + (r.miss.length ? " err" : " ok"); cpRow.style.display = "";
      if (r.miss.length) out.textContent = "⚠️ Fill in: " + r.miss.map(function (id) { var f = cfg.fields.filter(function (x) { return x.id === id; })[0]; return f ? f.label.replace(/<[^>]+>/g, "") : id; }).join(" · ") + "\n\n" + r.s;
    }
    mk.onclick = function () { show(cfg.prompt); };
    rp.onclick = function () { show(cfg.report); };
    cp.onclick = function () {
      var txt = out.textContent.replace(/^⚠️[^\n]*\n\n/, "");
      var done = function () { cp.textContent = "Copied ✓"; setTimeout(function () { cp.textContent = "Copy"; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {}); else done();
    };
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
    document.querySelectorAll("[data-graphmaker]").forEach(graphMaker);
    document.querySelectorAll("[data-findstar]").forEach(findStar);
    document.querySelectorAll("[data-areamodel]").forEach(areaModelW);
    document.querySelectorAll("[data-timesgrid]").forEach(timesGrid);
    document.querySelectorAll("[data-divider]").forEach(divider);
    document.querySelectorAll("[data-fractions]").forEach(fractionsW);
    document.querySelectorAll("[data-decbuilder]").forEach(decBuilder);
    document.querySelectorAll("[data-pattern]").forEach(patternW);
    document.querySelectorAll("[data-rect]").forEach(rectW);
    document.querySelectorAll("[data-turtle-pic]").forEach(turtlePic);
    document.querySelectorAll("[data-mcset]").forEach(mcSet);
    document.querySelectorAll("[data-twentyfour]").forEach(twentyFour);
    document.querySelectorAll("[data-sim]").forEach(simW);
    document.querySelectorAll("[data-walker]").forEach(walkerW);
    document.querySelectorAll("[data-guess]").forEach(guessW);
    document.querySelectorAll("[data-sorter]").forEach(sorterW);
    document.querySelectorAll("[data-react]").forEach(reactW);
    document.querySelectorAll("[data-knn]").forEach(knnW);
    document.querySelectorAll("[data-rps]").forEach(rpsW);
    document.querySelectorAll("[data-py]").forEach(pyW);
    document.querySelectorAll("[data-lines]").forEach(linesW);
    document.querySelectorAll("[data-spec]").forEach(specW);
    var mount = document.getElementById("mathRoot");
    if (mount && mount.dataset.homework) MK.homeworkPage(mount.dataset.homework);
    if (mount && mount.dataset.quiz) MK.quizPage(mount.dataset.quiz);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

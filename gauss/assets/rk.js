/* RoboKids · Java for AP CSA — shared page script */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Java runner (OneCompiler embed) ---------- */
  const OC_URL = 'https://onecompiler.com/embed/java?listenToEvents=true&hideNew=true&hideNewFileOption=true&hideTitle=true&hideLanguageSelection=true&theme=dark';
  const tplText = id => { const t = document.getElementById(id); return t ? t.textContent : ''; };
  function sendCode(iframe, code) {
    try { iframe.contentWindow.postMessage({ eventType: 'populateCode', language: 'java', files: [{ name: 'Main.java', content: code }] }, '*'); } catch (e) {}
  }
  function buildRunner(el) {
    el.innerHTML = '<div class="jr-placeholder">Java editor loads when you reach this part…</div>' +
      '<div class="jr-bar"><span>Runs real Java (OneCompiler). If the editor is blocked on your network, copy the code into any Java IDE.</span>' +
      '<span class="jr-actions"><button class="jr-btn" data-act="reset">Reset code</button>' +
      '<button class="jr-btn" data-act="copy">Copy code</button>' +
      '<a class="jr-btn" href="https://onecompiler.com/java" target="_blank" rel="noopener">Open in new tab ↗</a></span></div>';
    el._code = tplText(el.dataset.tpl);
  }
  function loadRunner(el) {
    if (el.querySelector('iframe')) return;
    const f = document.createElement('iframe');
    f.title = 'Java code editor'; f.src = OC_URL;
    f.addEventListener('load', () => { sendCode(f, el._code); setTimeout(() => sendCode(f, el._code), 1200); });
    el.querySelector('.jr-placeholder').replaceWith(f);
  }
  window.RK = { loadRunner, sendCode };
  // homework links point to the GitHub Pages site set in assets/config.js
  if (window.HW_BASE) {
    const base = window.HW_BASE.endsWith('/') ? window.HW_BASE : window.HW_BASE + '/';
    $$('.hw-link').forEach(a => { a.href = base + a.dataset.hw; a.style.display = ''; });
  }
  $$('.java-runner').forEach(buildRunner);
  // scrolling pages: load runners as they come into view
  if (document.body.classList.contains('page') && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { loadRunner(e.target); io.unobserve(e.target); } }), { rootMargin: '200px' });
    $$('.java-runner').forEach(r => io.observe(r));
  }
  function copyText(text, btn, label) {
    const done = () => { btn.textContent = 'Copied ✓'; setTimeout(() => btn.textContent = label, 1500); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done);
    else { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); done(); }
  }

  document.addEventListener('click', e => {
    const jb = e.target.closest('.jr-btn');
    if (jb && jb.dataset.act) {
      const el = jb.closest('.java-runner');
      if (jb.dataset.act === 'reset') { const f = el.querySelector('iframe'); if (f) sendCode(f, el._code); }
      if (jb.dataset.act === 'copy') copyText(el._code, jb, 'Copy code');
    }
    // load a snippet into the page's main runner
    const lb = e.target.closest('[data-load]');
    if (lb) {
      const el = document.getElementById(lb.dataset.target || 'mainRunner') || $('.java-runner');
      el._code = tplText(lb.dataset.load);
      loadRunner(el);
      const f = el.querySelector('iframe'); if (f) sendCode(f, el._code);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // reveal buttons (deck lab + page hint/solution)
    const r = e.target.closest('.reveal-btn, .toggle-btn');
    if (r) {
      const box = r.dataset.box ? document.getElementById(r.dataset.box) : r.nextElementSibling;
      const open = box.classList.toggle(box.classList.contains('solution') ? 'show' : 'show');
      r.textContent = r.textContent.replace(open ? 'Show' : 'Hide', open ? 'Hide' : 'Show').replace(open ? '▾' : '▴', open ? '▴' : '▾');
    }
    const sc = e.target.closest('.self-done');
    if (sc) { sc.classList.toggle('check-done'); sc.textContent = sc.classList.contains('check-done') ? '✓ Done' : 'Mark step done'; }
  });

  /* ---------- MCQ blocks (mock + homework) ---------- */
  $$('.q .quiz-option').forEach(o => o.addEventListener('click', () => {
    const q = o.closest('.q');
    if (q.classList.contains('graded')) return;
    $$('.quiz-option', q).forEach(x => x.classList.remove('picked'));
    o.classList.add('picked');
  }));
  function gradeAll() {
    let right = 0, total = 0, blank = 0;
    $$('.q[data-ans]').forEach(q => {
      total++;
      const ans = +q.dataset.ans, opts = $$('.quiz-option', q);
      const picked = opts.findIndex(o => o.classList.contains('picked'));
      if (picked < 0) blank++;
      q.classList.add('graded');
      opts.forEach(o => o.classList.add('locked'));
      opts[ans].classList.add('correct');
      opts.forEach(o => o.classList.remove('picked'));
      if (picked === ans) { right++; q.classList.add('is-right'); }
      else { q.classList.add('is-wrong'); if (picked >= 0) opts[picked].classList.add('wrong'); }
      const w = $('.q-why', q); if (w) w.classList.add('show');
    });
    return { right, total, blank };
  }
  function band(pct) { return pct >= 0.85 ? ['band-5', 'Exam-ready on this topic'] : pct >= 0.6 ? ['band-3', 'Getting there: review the misses'] : ['band-1', 'Re-watch the lesson, then retry']; }
  const stamp = () => new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  Object.assign(window.RK, { gradeAll, band, stamp });

  /* ---------- Mini mock ---------- */
  const mock = $('#mockRoot');
  if (mock) {
    const minutes = +mock.dataset.minutes, tag = $('#sectionTag');
    let left = minutes * 60, timer = null, started = 0, mcqResult = null;
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    tag.textContent = `MOCK · ${fmt(left)}`; tag.classList.add('timer-tag');
    $('#startBtn').addEventListener('click', () => {
      $('#mockArea').classList.remove('locked-area');
      $('#startBtn').disabled = true; $('#nameInput').disabled = true;
      started = Date.now();
      timer = setInterval(() => {
        left--; tag.textContent = `MOCK · ${fmt(Math.max(left, 0))}`;
        if (left <= 120) tag.classList.add('warn');
        if (left <= 0) { tag.classList.add('over'); submit(true); }
      }, 1000);
      $('#mockArea').scrollIntoView({ behavior: 'smooth' });
    });
    function updateScore() {
      const pts = $$('#rubric input:checked').length, max = $$('#rubric input').length;
      const tot = mcqResult.right + pts, totMax = mcqResult.total + max;
      const [cls, msg] = band(tot / totMax);
      $('#scoreBig').textContent = `${tot} / ${totMax}`;
      $('#scoreSub').innerHTML = `Multiple choice <b>${mcqResult.right}/${mcqResult.total}</b> · Written code <b>${pts}/${max}</b> (tick the rubric below)<br>` +
        `<b>${($('#nameInput').value || 'Student')}</b> · ${mock.dataset.session} · time used ${fmt(Math.min(minutes * 60, Math.round((Date.now() - started) / 1000)))} · ${stamp()}`;
      const b = $('#scoreBand'); b.className = 'score-band ' + cls; b.textContent = msg;
    }
    function submit(auto) {
      if (mcqResult) return;
      if (!auto) {
        const blank = $$('.q[data-ans]').filter(q => !$('.picked', q)).length;
        if (blank && !confirm(`You have ${blank} unanswered question(s). Submit anyway?`)) return;
      }
      clearInterval(timer);
      mcqResult = gradeAll();
      $('#frqArea').readOnly = true;
      $('#frqReveal').classList.add('show');
      $('#submitMock').disabled = true;
      $('#scoreCard').classList.add('show');
      $$('#rubric input').forEach(i => i.addEventListener('change', updateScore));
      updateScore();
      $('#scoreCard').scrollIntoView({ behavior: 'smooth' });
    }
    $('#submitMock').addEventListener('click', () => submit(false));
  }

  /* ---------- Homework ---------- */
  const hw = $('#hwRoot');
  if (hw) {
    let res = null;
    function upd() {
      const done = $$('.task-done:checked').length, tmax = $$('.task-done').length;
      $('#scoreBig').textContent = `${res.right} / ${res.total}`;
      const [cls, msg] = band(res.right / res.total);
      $('#scoreSub').innerHTML = `Multiple choice <b>${res.right}/${res.total}</b> · Coding tasks finished <b>${done}/${tmax}</b><br><b>${($('#nameInput').value || 'Student')}</b> · ${hw.dataset.session} · ${stamp()}`;
      const b = $('#scoreBand'); b.className = 'score-band ' + cls; b.textContent = msg;
    }
    $('#checkHw').addEventListener('click', () => {
      if (res) return;
      const blank = $$('.q[data-ans]').filter(q => !$('.picked', q)).length;
      if (blank && !confirm(`You have ${blank} unanswered question(s). Check anyway?`)) return;
      res = gradeAll(); $('#checkHw').disabled = true;
      $('#scoreCard').classList.add('show'); upd();
      $('#scoreCard').scrollIntoView({ behavior: 'smooth' });
    });
    $$('.task-done').forEach(c => c.addEventListener('change', () => { if (res) upd(); }));
  }
})();

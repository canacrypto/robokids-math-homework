/* RoboKids deck: navigation, quizzes, self-check, lab dock, in-deck mini mock, homework share */
const slides = document.querySelectorAll('.slide');
const TOTAL_SLIDES = slides.length;
let currentSlide = 1;
const SECTION_MAP = {1:'INTRO',2:'INTRO',3:'LEARN',4:'LEARN',5:'LEARN',6:'LEARN',7:'LEARN',
  8:'QUIZ',9:'QUIZ',10:'QUIZ',11:'QUIZ',12:'QUIZ',13:'QUIZ',14:'QUIZ',15:'QUIZ',16:'LAB',17:'WRAP'};
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const footCur = document.getElementById('footCur');
const footProgressFill = document.getElementById('footProgressFill');
const sectionTag = document.getElementById('sectionTag');
const stage = document.getElementById('stage');
const dock = document.getElementById('labDock');
document.getElementById('footTotal').textContent = TOTAL_SLIDES;
const slideEl = n => document.querySelector(`.slide[data-slide="${n}"]`);

function refreshTag() {
  const s = slideEl(currentSlide);
  let sec = (s && s.dataset.sec) || SECTION_MAP[currentSlide] || '';
  if (sec === 'MOCK' && window.mockClock) sec = 'MOCK · ' + window.mockClock();
  sectionTag.textContent = `${sec} · ${currentSlide}/${TOTAL_SLIDES}`;
}
window.refreshTag = refreshTag;

function showSlide(n) {
  if (n < 1) n = 1;
  if (n > TOTAL_SLIDES) n = TOTAL_SLIDES;
  slides.forEach(s => s.classList.remove('active'));
  const target = slideEl(n);
  if (target) {
    target.classList.add('active'); target.scrollTop = 0;
    target.querySelectorAll('.java-runner').forEach(r => window.RK && RK.loadRunner(r));
    const lab = !!target.dataset.lab;
    if (stage) stage.classList.toggle('dock-on', lab);
    if (lab && dock) RK.loadRunner(dock.querySelector('.java-runner'));
    if (target.id === 'mockResultSlide' && window.mockUpdateAnswered) window.mockUpdateAnswered();
  }
  currentSlide = n;
  footCur.textContent = n;
  footProgressFill.style.width = `${(n / TOTAL_SLIDES) * 100}%`;
  refreshTag();
  prevBtn.disabled = (n === 1);
  nextBtn.disabled = (n === TOTAL_SLIDES);
  nextBtn.textContent = n === TOTAL_SLIDES ? 'End ▸' : 'Next ▸';
  try { history.replaceState(null, '', '#' + n); } catch (e) {}
}
prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => { if (!nextBtn.disabled) showSlide(currentSlide + 1); });
document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); showSlide(currentSlide - 1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); if (!nextBtn.disabled) showSlide(currentSlide + 1); }
});

function updateSelfCheck() {
  const cbs = document.querySelectorAll('.sc-cb');
  let checked = 0; cbs.forEach(cb => { if (cb.checked) checked++; });
  const banner = document.getElementById('scScoreBanner');
  const msg = document.getElementById('scScoreMsg');
  if (!banner) return;
  document.getElementById('scScoreCount').textContent = checked;
  banner.className = 'sc-score-banner';
  if (checked === 0) msg.textContent = 'Tick the boxes above as you feel ready.';
  else if (checked < 3) { msg.textContent = 'Keep going: review the rules you\'re unsure about.'; banner.classList.add('partial'); }
  else if (checked === 3) { msg.textContent = 'Solid work. You\'ve got the rules down.'; banner.classList.add('good'); }
  else { msg.textContent = window.SC_PERFECT || '🎉 You\'ve got it.'; banner.classList.add('perfect'); }
}

function pickQuizAnswer(slideNum, correctIdx, optionIdx) {
  const slide = slideEl(slideNum);
  const opts = slide.querySelectorAll('.quiz-option');
  const feedback = slide.querySelector('.quiz-feedback-inline');
  if (opts[0].classList.contains('locked')) return;
  opts.forEach(o => o.classList.add('locked'));
  opts[optionIdx].classList.add(optionIdx === correctIdx ? 'correct' : 'wrong');
  if (optionIdx !== correctIdx) opts[correctIdx].classList.add('correct');
  feedback.className = 'quiz-feedback-inline show ' + (optionIdx === correctIdx ? 'correct' : 'wrong');
  feedback.innerHTML = optionIdx === correctIdx
    ? '<strong>Correct!</strong> Click Next ▸ for the explanation.'
    : '<strong>Not quite.</strong> The correct answer is highlighted. Click Next ▸ to learn why.';
}

/* ---------- in-deck mini mock ---------- */
(function () {
  const start = document.getElementById('mockStart');
  if (!start) return;
  const minutes = +start.dataset.minutes, startSlide = +start.dataset.slide;
  const resultSlide = +document.getElementById('mockResultSlide').dataset.slide;
  let left = minutes * 60, timer = null, started = 0, res = null;
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  window.mockClock = () => res ? 'DONE' : fmt(Math.max(left, 0));
  document.body.classList.add('mock-waiting');
  const qs = () => Array.from(document.querySelectorAll('.mock-qslide .q[data-ans]'));
  window.mockUpdateAnswered = () => {
    const el = document.getElementById('mockAnswered');
    if (!el || res) return;
    const done = qs().filter(q => q.querySelector('.picked')).length;
    const frq = document.getElementById('frqArea').value.trim() ? 'written' : '<b>not written yet</b>';
    el.innerHTML = `You've answered <b>${done} of ${qs().length}</b> multiple-choice questions, and Part B is ${frq}. Use ◂ Previous to check your answers before you submit.`;
  };
  document.getElementById('mockStartBtn').addEventListener('click', () => {
    if (timer || res) return;
    document.body.classList.remove('mock-waiting');
    document.getElementById('mockName').disabled = true;
    document.getElementById('mockStartBtn').disabled = true;
    started = Date.now();
    timer = setInterval(() => {
      left--;
      if (left <= 120) sectionTag.classList.add('warn');
      if (left <= 0) { sectionTag.classList.add('over'); submit(true); }
      if (slideEl(currentSlide).dataset.sec === 'MOCK') refreshTag();
    }, 1000);
    showSlide(startSlide + 1);
  });
  function updateScore() {
    const pts = document.querySelectorAll('#rubric input:checked').length;
    const max = document.querySelectorAll('#rubric input').length;
    const tot = res.right + pts, totMax = res.total + max;
    const [cls, msg] = RK.band(tot / totMax);
    const used = Math.min(minutes * 60, Math.round((Date.now() - started) / 1000));
    document.getElementById('mScoreBig').textContent = `${tot} / ${totMax}`;
    document.getElementById('mScoreSub').innerHTML = `Multiple choice <b>${res.right}/${res.total}</b> · Written code <b>${pts}/${max}</b> (tick the rubric below)<br>` +
      `<b>${document.getElementById('mockName').value || 'Student'}</b> · ${start.dataset.session} · time used ${fmt(used)} · ${RK.stamp()}`;
    const b = document.getElementById('mScoreBand'); b.className = 'score-band ' + cls; b.textContent = msg;
  }
  function submit(auto) {
    if (res || !timer) return;
    if (!auto) {
      const blank = qs().filter(q => !q.querySelector('.picked')).length;
      if (blank && !confirm(`You have ${blank} unanswered question(s). Submit anyway?`)) return;
    }
    clearInterval(timer);
    res = RK.gradeAll();
    document.getElementById('frqArea').readOnly = true;
    document.getElementById('mockSubmitBox').style.display = 'none';
    document.getElementById('mockScoreCard').classList.add('show');
    document.getElementById('frqReveal').classList.add('show');
    document.querySelectorAll('#rubric input').forEach(i => i.addEventListener('change', updateScore));
    updateScore();
    showSlide(resultSlide);
  }
  document.getElementById('mockSubmitBtn').addEventListener('click', () => submit(false));
})();

/* ---------- homework share slide ---------- */
(function () {
  const box = document.getElementById('hwShare');
  if (!box) return;
  const base = (window.HW_BASE || '').trim();
  if (!base) { box.classList.add('no-hw'); return; }
  const url = base.replace(/\/?$/, '/');   // homework landing page (all sessions)
  document.getElementById('hwUrl').textContent = url;
  document.getElementById('hwUrl').href = url;
  document.getElementById('hwOpen').href = url;
  try {
    const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
    document.getElementById('hwQr').innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2 });
  } catch (e) {}
  const copy = (text, btn) => {
    const label = btn.textContent;
    const done = () => { btn.textContent = 'Copied ✓'; setTimeout(() => btn.textContent = label, 1500); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallback());
    else fallback();
    function fallback() { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); done(); }
  };
  document.getElementById('hwCopy').addEventListener('click', e => copy(url, e.target));

  // teacher tools: message to parents
  let topics = []; try { topics = JSON.parse(box.dataset.topics); } catch (e) {}
  const course = box.dataset.course || 'Java for AP CSA';   // math decks set data-course
  const subject = `RoboKids ${course} · ${box.dataset.session} · Homework`;
  const msg = document.getElementById('parentMsg');
  msg.value = `Hello parents,\n\nIn today's RoboKids "${course}" class (${box.dataset.session}) we covered:\n` +
    topics.map(t => `  • ${t}`).join('\n') +
    `\n\nThis week's homework is ${box.dataset.session} (about 30–50 minutes, due before ${box.dataset.next}).\n` +
    `All homework is on one page, so you can bookmark it:\n${url}\n\n` +
    `It works on any computer or tablet. ${box.dataset.finish || 'At the end, your child will see a score card. Please ask them to screenshot it and send it to me.'}\n\nThank you!\nRoboKids`;
  try { localStorage.setItem('rk_last_session', String(parseInt(box.dataset.hw.slice(1, 3), 10))); } catch (e) {}
  const emails = document.getElementById('parentEmails');
  try { emails.value = localStorage.getItem('rk_parent_emails') || ''; } catch (e) {}
  emails.addEventListener('input', () => { try { localStorage.setItem('rk_parent_emails', emails.value); } catch (e) {} });
  const list = () => emails.value.split(/[\s,;]+/).filter(x => x.includes('@')).join(',');
  const need = () => { if (!list()) { alert('Add at least one parent email first.'); emails.focus(); return false; } return true; };
  document.getElementById('mailApp').addEventListener('click', () => {
    if (!need()) return;
    location.href = `mailto:?bcc=${encodeURIComponent(list())}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg.value)}`;
  });
  document.getElementById('mailGmail').addEventListener('click', () => {
    if (!need()) return;
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(list())}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg.value)}`, '_blank');
  });
  document.getElementById('copyMsg').addEventListener('click', e => copy(msg.value, e.target));
})();

const START_HASH = location.hash;
showSlide(parseInt(START_HASH.slice(1)) || 1);
if (/tools/.test(START_HASH)) {           // opened from "Homework Link to Parents"
  const tt = document.getElementById('teacherTools');
  if (tt && !tt.classList.contains('show')) document.querySelector('[data-box="teacherTools"]').click();
}

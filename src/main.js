import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import AR from './i18n/ar.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

/* ---------- dynamic numbers ---------- */
const FOUNDED = 2009;
const yrs = $('#yrs');
yrs.textContent = new Date().getFullYear() - FOUNDED;
yrs.dataset.count = yrs.textContent;
$('#cy').textContent = new Date().getFullYear();

/* ---------- hero video: fall back to the photo poster with a deeper tint ---------- */
const heroVid = $('#heroVid');
const noVideo = () => $('#hero').classList.add('no-video');
heroVid.addEventListener('error', noVideo);
setTimeout(() => { if (heroVid.readyState < 2) noVideo(); }, 4000);
heroVid.addEventListener('playing', () => $('#hero').classList.remove('no-video'));

/* ---------- i18n ---------- */
const nodes = $$('[data-i18n]');
const EN = {};
nodes.forEach((n) => { const k = n.dataset.i18n; if (!(k in EN)) EN[k] = n.innerHTML; });

let lang = 'en';
let tbOn = true;
let stmtTrigger = null;
const stmt = $('#stmt');

function splitStatement() {
  const words = stmt.textContent.trim().split(/\s+/);
  stmt.innerHTML = words
    .map((w) => `<span class="w${/^(2009|Dammam\.?|الدمام\.?)$/.test(w) ? ' hl' : ''}">${w}</span>`)
    .join(' ');
  const spans = $$('.w', stmt);
  if (reduce) { spans.forEach((w) => (w.style.opacity = 1)); return; }
  stmtTrigger?.kill();
  stmtTrigger = gsap.to(spans, {
    opacity: 1, stagger: 0.05, ease: 'none',
    scrollTrigger: { trigger: stmt, start: 'top 80%', end: 'bottom 45%', scrub: true },
  }).scrollTrigger;
}

function setThermal(on) {
  tbOn = on;
  if (!$('#tbOn')) return;
  $('#tbOn').setAttribute('aria-pressed', on);
  $('#tbOff').setAttribute('aria-pressed', !on);
  $('#inner').setAttribute('fill', on ? '#5D9BE0' : '#F0844A');
  $('#bridge').setAttribute('fill', on ? '#6E76F0' : '#C9CBDD');
  $('#lb3').textContent = on
    ? (lang === 'ar' ? 'بولي أميد' : 'POLYAMIDE')
    : (lang === 'ar' ? 'ألمنيوم متصل' : 'SOLID ALUMINUM');
  $('#temp').textContent = on ? '~28°C' : '~44°C';
}

function applyLang(l) {
  lang = l;
  root.lang = l;
  root.dir = l === 'ar' ? 'rtl' : 'ltr';
  nodes.forEach((n) => { const k = n.dataset.i18n; n.innerHTML = l === 'ar' && AR[k] ? AR[k] : EN[k]; });
  $('#lang').textContent = l === 'ar' ? 'English' : 'العربية';
  splitStatement();
  setThermal(tbOn);
  try { localStorage.setItem('eaef-lang', l); } catch {}
  ScrollTrigger.refresh();
}

$('#lang').addEventListener('click', () => applyLang(lang === 'en' ? 'ar' : 'en'));
$('#tbOn')?.addEventListener('click', () => setThermal(true));
$('#tbOff')?.addEventListener('click', () => setThermal(false));

/* ---------- quote form (not wired to a backend yet) ---------- */
/* ---------- quote / catalog requests -> company inbox (FormSubmit) ----------
   The first request ever sent triggers a one-time activation email to this
   inbox; click "Activate" in it and every request after that arrives. */
const LEADS_INBOX = 'info@easternextrusion.com';
const MSG = {
  en: { sending: 'Sending…', okQuote: 'Thanks. Your request is with our sales team, and we will reply within one working day.',
        okCatalog: 'Thanks. We will email you our catalog and company profile shortly.',
        need: 'Please add your name and an email or phone number so we can reply.',
        fail: 'We could not send this right now. Please email info@easternextrusion.com or message us on WhatsApp.' },
  ar: { sending: 'جارٍ الإرسال…', okQuote: 'شكرًا. وصل طلبك إلى فريق المبيعات وسنرد خلال يوم عمل.',
        okCatalog: 'شكرًا. سنرسل لك الكتالوج وملف الشركة على بريدك قريبًا.',
        need: 'من فضلك أضف اسمك وبريدك أو رقم هاتفك لنتمكن من الرد.',
        fail: 'تعذّر الإرسال الآن. راسلنا على info@easternextrusion.com أو عبر واتساب.' },
};
const rfq = $('#rfq'), ok = $('#ok'), rfqBtn = $('#rfqBtn');
const say = (key, bad = false) => { ok.hidden = false; ok.classList.toggle('bad', bad); ok.textContent = MSG[lang === 'ar' ? 'ar' : 'en'][key]; };
function setKind(kind) {
  const r = rfq.querySelector(`input[name=kind][value=${kind}]`); if (r) r.checked = true;
  if (kind === 'catalog') $('#q-type').selectedIndex = 1;
}
rfq.addEventListener('change', (e) => { if (e.target.name === 'kind') setKind(e.target.value); });
$$('[data-kind]').forEach((a) => a.addEventListener('click', () => setKind(a.dataset.kind)));
rfq.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(rfq));
  if (d._honey) return;                                   // bot filled the hidden field
  if (!d.name.trim() || !(d.email.trim() || d.phone.trim())) return say('need', true);
  const catalog = d.kind === 'catalog';
  const payload = {
    _subject: `${catalog ? 'Catalog request' : 'Quote request'} · ${d.name}${d.company ? ' · ' + d.company : ''}`,
    _template: 'table', _captcha: 'false',
    ...(d.email ? { _replyto: d.email } : {}),
    'Request type': catalog ? 'Catalog / company profile' : 'Quote',
    Name: d.name, Company: d.company, Email: d.email, 'Phone / WhatsApp': d.phone,
    Product: $('#q-type').selectedOptions[0].textContent, 'Quantity (tons)': d.quantity, Details: d.message,
    'Site language': lang, Page: location.href,
  };
  rfqBtn.disabled = true; say('sending');
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${LEADS_INBOX}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || String(out.success) === 'false') throw new Error(out.message || res.status);
    say(catalog ? 'okCatalog' : 'okQuote'); rfq.reset(); setKind('quote');
  } catch (err) {
    console.warn('Request not sent:', err); say('fail', true);
  } finally { rfqBtn.disabled = false; }
});

/* ---------- nav: solid after scroll, hide when scrolling down ---------- */
const nav = $('#nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 60);
  nav.classList.toggle('hide', y > lastY && y > 400);
  lastY = y;
}, { passive: true });

/* ---------- product hover peek ---------- */
const peek = $('#peek');
const peekImgs = $$('img', peek);
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  const qx = gsap.quickTo(peek, 'x', { duration: 0.5, ease: 'power3' });
  const qy = gsap.quickTo(peek, 'y', { duration: 0.5, ease: 'power3' });
  const plist = $('#plist');
  plist.addEventListener('pointermove', (e) => { qx(e.clientX); qy(e.clientY); });
  $$('.prow', plist).forEach((row) => row.addEventListener('pointerenter', () => {
    const i = +row.dataset.img;
    peekImgs.forEach((im, j) => im.classList.toggle('on', j === i));
    gsap.to(peek, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
  }));
  const hidePeek = () => gsap.to(peek, { opacity: 0, scale: 0.6, duration: 0.3, overwrite: true });
  plist.addEventListener('pointerleave', hidePeek);
  // scrolling moves the list out from under a still pointer without firing pointerleave
  let px = -1, py = -1;
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
  addEventListener('scroll', () => {
    const r = plist.getBoundingClientRect();
    if (px < r.left || px > r.right || py < r.top || py > r.bottom) hidePeek();
  }, { passive: true });
}

/* ---------- initial language: saved choice, else browser language ---------- */
let saved = null;
try { saved = localStorage.getItem('eaef-lang'); } catch {}
const initial = saved || ((navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en');
if (initial === 'ar') applyLang('ar'); else splitStatement();

if (!reduce) initMotion();

function initMotion() {
  /* smooth scroll */
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -10 }); }
  }));

  /* hero: CSS runs the one-shot entrance; on scroll the video frame shrinks and the copy lifts away */
  gsap.set('#heroFrame', { clipPath: 'inset(0% 0% 0% 0% round 0px)' });
  gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=80%', scrub: true, pin: true } })
    .to('#heroFrame', { clipPath: 'inset(8% 5% 8% 5% round 14px)', ease: 'none' }, 0)
    .to('#heroStage', { opacity: 0, y: -40, ease: 'none', duration: 0.4 }, 0);

  /* counters */
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString('en-US')) }),
    });
  });

  /* plant tour: horizontal pinned scroll */
  const track = $('#track');
  const dist = () => track.scrollWidth - innerWidth;
  const hs = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '#tour', start: 'top top', end: () => '+=' + dist(), scrub: 0.6, pin: true, invalidateOnRefresh: true,
      onUpdate: (s) => gsap.set('#prog', { scaleX: s.progress }),
    },
  });
  $$('.stage .ph img').forEach((img) => gsap.fromTo(img, { xPercent: -6 }, {
    xPercent: 6, ease: 'none',
    scrollTrigger: { trigger: img.closest('.stage'), containerAnimation: hs, start: 'left right', end: 'right left', scrub: true },
  }));

  /* reveals */
  $$('.sec-head h2').forEach((h) =>
    gsap.from(h, { yPercent: 40, opacity: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%' } }));
  gsap.from('.prow', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '#plist', start: 'top 85%' } });
  gsap.from('.post', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.ngrid', start: 'top 88%' } });
  gsap.from('.tb', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.tb', start: 'top 88%' } });
  gsap.fromTo('#pImg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#people', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('#people h2', { yPercent: 30, opacity: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '#people', start: 'top 60%' } });
  gsap.from('footer .big', { yPercent: 40, duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: 'footer', start: 'top 95%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
}

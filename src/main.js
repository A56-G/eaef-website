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
  $('#lb1').textContent = l === 'ar' ? 'الخارج 50°م' : 'OUTSIDE 50°C';
  $('#lb2').textContent = l === 'ar' ? 'الداخل' : 'INSIDE';
  splitStatement();
  setThermal(tbOn);
  try { localStorage.setItem('eaef-lang', l); } catch {}
  ScrollTrigger.refresh();
}

$('#lang').addEventListener('click', () => applyLang(lang === 'en' ? 'ar' : 'en'));
$('#tbOn').addEventListener('click', () => setThermal(true));
$('#tbOff').addEventListener('click', () => setThermal(false));

/* ---------- quote form (not wired to a backend yet) ---------- */
$('#rfq').addEventListener('submit', (e) => { e.preventDefault(); $('#ok').hidden = false; });

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
  plist.addEventListener('pointerleave', () => gsap.to(peek, { opacity: 0, scale: 0.6, duration: 0.3 }));
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

  /* hero intro */
  gsap.fromTo('#heroImg', { scale: 1.3 }, { scale: 1.12, duration: 2.2, ease: 'power3.out' });
  gsap.from('#h1 .l>span', { yPercent: 105, duration: 1.2, ease: 'power4.out', stagger: 0.1, delay: 0.2 });
  gsap.from('.hero .under>*,.hero .top-l', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.7 });

  /* hero scroll: photo shrinks into a frame */
  gsap.set('#heroFrame', { clipPath: 'inset(0% 0% 0% 0% round 0px)' });
  gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=90%', scrub: true, pin: true } })
    .to('#heroFrame', { clipPath: 'inset(9% 5% 9% 5% round 14px)', ease: 'none' }, 0)
    .to('#heroImg', { scale: 1, ease: 'none' }, 0)
    .to('.hero .copy', { yPercent: -30, opacity: 0, ease: 'none', duration: 0.35 }, 0)
    .to('.hero .top-l', { opacity: 0, ease: 'none', duration: 0.2 }, 0);

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
  $$('.products h2,.thermal h2,.news h2,.tour-head h2').forEach((h) =>
    gsap.from(h, { yPercent: 40, opacity: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%' } }));
  gsap.from('.prow', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '#plist', start: 'top 85%' } });
  gsap.from('.post', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.ngrid', start: 'top 88%' } });
  gsap.from('.tb', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.tb', start: 'top 88%' } });
  gsap.fromTo('#pImg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#people', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('#people h2', { yPercent: 30, opacity: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '#people', start: 'top 60%' } });
  gsap.from('footer .big', { yPercent: 40, duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: 'footer', start: 'top 95%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
}

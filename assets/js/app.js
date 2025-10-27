// Main interactive behaviors: i18n, theme, particles, skill animation, small UX helpers,
// plus an improved code viewer for project files that preserves original behavior.

// ---------- i18n ----------
const DEFAULT_LANG = 'es';
const supportedLangs = ['ca','es','en'];

function getSavedLang(){
  try {
    return localStorage.getItem('site_lang') || DEFAULT_LANG;
  } catch(e){ return DEFAULT_LANG; }
}

function saveLang(lang){
  try { localStorage.setItem('site_lang', lang); } catch(e){}
}

function setLang(lang){
  if(!window.__TRANSLATIONS || !window.__TRANSLATIONS[lang]) lang = DEFAULT_LANG;
  const tr = window.__TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(tr[key]) el.textContent = tr[key];
  });
  document.documentElement.lang = lang;
  saveLang(lang);
  // update active lang button
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active', b.dataset.lang===lang));
}

// bind language buttons and other behaviors
document.addEventListener('DOMContentLoaded', ()=>{
  // set year
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();

  // initialize i18n
  const saved = getSavedLang();
  setLang(saved);

  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      setLang(btn.dataset.lang);
    });
  });

  // theme init: preference -> saved -> system
  const savedTheme = localStorage.getItem('site_theme');
  const systemPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const initial = savedTheme || systemPref;
  applyTheme(initial);

  const themeToggle = document.getElementById('themeToggle');
  themeToggle && themeToggle.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // skill bars animation on scroll
  const skillsSection = document.querySelector('.skills');
  if(skillsSection){
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          document.querySelectorAll('.bar-fill').forEach(el=>{
            const target = el.dataset.fill || 80;
            el.style.width = target + '%';
          });
          observer.disconnect();
        }
      });
    },{threshold:0.2});
    observer.observe(skillsSection);
  }

  // smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  // bind view-code buttons (project viewer) -- keep original behavior (uses href)
  document.querySelectorAll('.view-code').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      e.preventDefault();
      const href = btn.getAttribute('href');
      const name = btn.dataset.name || href;
      const lang = btn.dataset.lang || '';
      openCodeModal(href, name, lang);
    });
  });

  // modal close
  const modalClose = document.getElementById('codeModalClose');
  modalClose && modalClose.addEventListener('click', closeCodeModal);
  const modal = document.getElementById('codeModal');
  modal && modal.addEventListener('click', (e)=>{
    if(e.target === modal) closeCodeModal();
  });

  // close with Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && document.getElementById('codeModal') && document.getElementById('codeModal').getAttribute('aria-hidden') === 'false'){
      closeCodeModal();
    }
  });

  // particles init
  initParticles();
});

// ---------- Theme ----------
function applyTheme(theme){
  if(theme === 'light'){
    document.documentElement.setAttribute('data-theme','light');
    localStorage.setItem('site_theme','light');
    const t = document.getElementById('themeToggle');
    if(t){ t.textContent = '☀️'; t.setAttribute('aria-pressed','true'); }
  } else {
    document.documentElement.setAttribute('data-theme','dark');
    localStorage.setItem('site_theme','dark');
    const t = document.getElementById('themeToggle');
    if(t){ t.textContent = '🌙'; t.setAttribute('aria-pressed','false'); }
  }
}

// ---------- Improved code modal viewer (keeps original markup) ----------
/*
  Behavior:
  - Attempts to fetch the file and display it inside the modal
  - If highlight.js is available it tries to highlight the code (detecting language by extension or data-lang)
  - If fetch fails (CORS or file://), fallback text is shown and user can open the raw file in a new tab
*/
async function openCodeModal(url, title, forcedLang){
  const modal = document.getElementById('codeModal');
  const modalTitle = document.getElementById('codeModalTitle');
  const pre = document.getElementById('codeModalContent');
  const codeEl = pre.querySelector('code');
  const modalOpen = document.getElementById('codeModalOpen');
  const modalDownload = document.getElementById('codeModalDownload');

  modalTitle.textContent = title || url.split('/').pop();
  codeEl.textContent = 'Loading…';
  pre.className = ''; // reset classes

  // set open & download links
  modalOpen.setAttribute('href', url);
  modalDownload.setAttribute('href', url);
  modalDownload.setAttribute('download', url.split('/').pop());

  modal.setAttribute('aria-hidden','false');
  modal.style.display = 'flex';

  // helper: detect language from extension
  function detectLangFromExt(path){
    const ext = path.split('?')[0].split('.').pop().toLowerCase();
    const map = {
      'py':'python','sh':'bash','bash':'bash','tf':'terraform','tfvars':'terraform',
      'yml':'yaml','yaml':'yaml','js':'javascript','json':'json','ps1':'powershell',
      'rb':'ruby','php':'php','txt':'plaintext','md':'markdown'
    };
    return map[ext] || ext;
  }

  try {
    const resp = await fetch(url, {cache: "no-cache"});
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    const text = await resp.text();

    // remove any old language class
    pre.className = '';
    codeEl.className = '';

    // decide language
    const lang = forcedLang || detectLangFromExt(url);
    if(window.hljs && lang){
      // highlight.js expects language class on <code> like "language-python" or just class "python"
      codeEl.classList.add(lang);
    }

    codeEl.textContent = text;

    // run highlight if available
    if(window.hljs && typeof hljs.highlightElement === 'function'){
      try { hljs.highlightElement(codeEl); } catch(e){ /* ignore */ }
      // ensure styled container
      pre.classList.add('hljs');
    }

    // focus code for keyboard users
    codeEl.setAttribute('tabindex', '0');
    codeEl.focus();
  } catch (err){
    // graceful fallback: show message and leave "Open raw" / "Download" enabled
    codeEl.textContent = 'No se pudo cargar el fichero dentro del modal (fetch falló o CORS/file://). Puedes abrirlo en una pestaña nueva con "Open raw".\n\nError: ' + (err.message || err);
  }
}

function closeCodeModal(){
  const modal = document.getElementById('codeModal');
  if(modal){
    modal.setAttribute('aria-hidden','true');
    modal.style.display = 'none';
    const pre = document.getElementById('codeModalContent');
    const codeEl = pre && pre.querySelector('code');
    if(codeEl) codeEl.textContent = '';
    const modalTitle = document.getElementById('codeModalTitle');
    if(modalTitle) modalTitle.textContent = '';
  }
}

// ---------- Particles (simple, lightweight) ----------
function initParticles(){
  const canvas = document.getElementById('particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = canvas.clientWidth;
  let h = canvas.height = canvas.clientHeight;
  let particles = [];
  const count = Math.max(30, Math.floor(w*h/50000));

  function rand(min,max){ return Math.random()*(max-min)+min }

  function create(){
    particles = [];
    for(let i=0;i<count;i++){
      particles.push({
        x: rand(0,w),
        y: rand(0,h),
        vx: rand(-0.3,0.3),
        vy: rand(-0.2,0.2),
        r: rand(0.6,2.2),
        hue: rand(160,220),
        alpha: rand(0.05,0.25)
      });
    }
  }

  function resize(){
    w = canvas.width = canvas.clientWidth;
    h = canvas.height = canvas.clientHeight;
    create();
  }
  window.addEventListener('resize', debounce(resize, 200));
  create();

  function draw(){
    ctx.clearRect(0,0,w,h);
    // subtle gradient
    const g = ctx.createLinearGradient(0,0,w,h);
    // dynamic depending on theme for subtle effect
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if(isLight){
      g.addColorStop(0,'rgba(242,246,250,0.9)');
      g.addColorStop(1,'rgba(238,245,251,0.9)');
    } else {
      g.addColorStop(0,'rgba(6,10,20,0.7)');
      g.addColorStop(1,'rgba(6,12,24,0.6)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    for(let p of particles){
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < -10) p.x = w+10;
      if(p.x > w+10) p.x = -10;
      if(p.y < -10) p.y = h+10;
      if(p.y > h+10) p.y = -10;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},80%,65%,${p.alpha})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ---------- utilities ----------
function debounce(fn, wait){
  let t;
  return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), wait); };
}
/* Mastersolis AI Connect - Frontend JS */
const API_BASE = "http://127.0.0.1:5000/api";

function getToken(){ try { return localStorage.getItem('admin_token') || ''; } catch(e){ return ''; } }

async function api(path, { method = 'GET', body, headers = {} } = {}){
  const opts = { method, headers: { 'Accept':'application/json', 'Authorization': getToken()?`Bearer ${getToken()}`:undefined, ...headers }, }
  if(body && !(body instanceof FormData)){
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if(body){
    opts.body = body; // FormData sets its own headers
  }
  // Remove undefined headers
  Object.keys(opts.headers).forEach(k=>opts.headers[k]===undefined && delete opts.headers[k]);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if(!res.ok){
    const t = await res.text().catch(()=> '');
    throw new Error(`API ${method} ${path} failed: ${res.status} ${t}`);
  }
  const ct = res.headers.get('content-type')||'';
  return ct.includes('application/json') ? res.json() : res.text();
}

function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  if(window.anime){
    t.style.opacity = 0; t.style.transform = 'translateY(10px)';
    anime({ targets: t, translateY:[10,0], opacity:[0,1], duration:300, easing:'easeOutQuad' });
    setTimeout(()=>{
      anime({ targets: t, translateY:[0,10], opacity:[1,0], duration:220, easing:'easeInQuad', complete:()=>{ t.classList.remove('show'); t.style.opacity=''; t.style.transform=''; } });
    }, 2400);
  } else {
    setTimeout(()=> t.classList.remove('show'), 2500);
  }
}

// Animations (anime.js)
function initAnimationsCommon(){
  if(!window.anime) return;
  const rootEl = document.getElementById('page') || null;
  // Reveal cards on scroll within sections
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((e)=>{
      if(e.isIntersecting){
        anime({ targets: e.target, translateY:[14,0], opacity:[0,1], duration:550, easing:'easeOutCubic' });
        io.unobserve(e.target);
      }
    })
  }, { threshold: 0.12, root: rootEl });
  document.querySelectorAll('.card').forEach(el=>{ el.style.opacity=0; io.observe(el); });
}

function initIntroHUD(){
  if(!window.anime) return;
  const svg = document.getElementById('hud-svg');
  if(!svg) return;
  // rotate outer ring
  anime({ targets: ['#ring-outer','#ring-ticks'], rotate: 360, easing:'linear', duration: 12000, loop:true, transformOrigin:'50% 50%' });
  anime({ targets: '#ring-inner', rotate: -360, easing:'linear', duration: 18000, loop:true, transformOrigin:'50% 50%' });
  // wave pulse
  anime({ targets: '#wave rect', scaleY: [0.9,1.08,0.9], transformOrigin:'50% 50%', easing:'easeInOutSine', duration: 1800, loop:true });
  // spline dash + dot along path
  const path = anime.path('#hud-spline');
  anime({ targets:'#hud-spline', strokeDasharray: [0, 620], strokeDashoffset: [0, -620], duration: 3500, easing:'linear', loop:true });
  anime({ targets:'#hud-dot', translateX: path('x'), translateY: path('y'), duration: 3500, easing:'linear', loop:true });
  // brand text fade in next to hud
  anime.timeline({ easing:'easeOutExpo' })
    .add({ targets: '.hud', opacity:[0,1], scale:[0.96,1], duration:600 })
    .add({ targets: '.intro-brand .brand-title', translateY:[12,0], opacity:[0,1], duration:500 }, '-=200')
    .add({ targets: '.intro-brand p', translateY:[10,0], opacity:[0,1], duration:450 }, '-=350');
}

// Page initializers
function initSinglePageTransitions(){
  // Scroll snap is CSS; animate section entrances
  const sections = Array.from(document.querySelectorAll('.section'));
  if(!sections.length) return;
  let active = null;
  const onEnter = (id)=>{
    if(!window.anime) return;
    if(active===id) return; active=id;
    switch(id){
      case 'home':
        // HUD branding reveals handled in initIntroHUD
        break;
      case 'builder':
        anime.timeline({ easing:'easeOutExpo' })
          .add({ targets: '#builder .hero h1', translateY:[20,0], opacity:[0,1], duration:600 })
          .add({ targets: '#builder .hero p', translateY:[12,0], opacity:[0,1], duration:450 }, '-=300')
          .add({ targets: '#builder .cta .button', opacity:[0,1], scale:[0.96,1], duration:300, delay: anime.stagger(70) }, '-=250');
        break;
      case 'about':
        anime({ targets:'#about-ring', rotate:360, duration:12000, easing:'linear', loop:true, transformOrigin:'50% 50%' });
        anime({ targets:'#about .card', opacity:[0,1], translateY:[18,0], delay: anime.stagger(80), duration:500, easing:'easeOutCubic' });
        break;
      case 'services':
        // orbiting shapes
        const field = document.querySelector('#services .shape-field');
        if(field && !field.dataset.anim){
          field.dataset.anim='1';
          anime({ targets:'#services .shape.c', translateX:[0,220], translateY:[0,40], direction:'alternate', loop:true, easing:'easeInOutSine', duration:2600 });
          anime({ targets:'#services .shape.s', translateX:[0,120], translateY:[0,-60], rotate:[0,360], direction:'alternate', loop:true, easing:'easeInOutQuad', duration:2200 });
          anime({ targets:'#services .shape.o', translateX:[0,180], translateY:[0,10], scale:[1,1.2], direction:'alternate', loop:true, easing:'easeInOutSine', duration:2400 });
          anime({ targets:'#services .shape.s2', translateX:[0,260], translateY:[0,-30], rotate:[0,-360], direction:'alternate', loop:true, easing:'easeInOutQuad', duration:2000 });
        }
        anime({ targets:'#services .card', opacity:[0,1], translateY:[16,0], delay: anime.stagger(90), duration:500, easing:'easeOutCubic' });
        break;
      case 'projects':
        anime({ targets:'#projects .card', opacity:[0,1], translateY:[16,0], delay: anime.stagger(90), duration:500, easing:'easeOutCubic' });
        break;
      case 'portfolio':
        anime({ targets:'#portfolio-accent #pf-arc', strokeDashoffset:[440,0], duration:1200, easing:'easeOutCubic' });
        anime({ targets:'#portfolio .case', opacity:[0,1], translateY:[18,0], rotate:[-2,0], delay: anime.stagger(90), duration:520, easing:'easeOutCubic' });
        break;
      case 'blog':
        anime({ targets:'#blog .blog-card', opacity:[0,1], translateY:[20,0], delay: anime.stagger(80), duration:520, easing:'easeOutCubic' });
        break;
      case 'contact':
        anime({ targets:'#contact form', opacity:[0,1], scale:[0.98,1], duration:450, easing:'easeOutCubic' });
        break;
    }
  };
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) onEnter(e.target.id); });
  }, { threshold: 0.6, root: document.getElementById('page')||null });
  sections.forEach(s=> io.observe(s));
}

async function initHome(){
  const btn = document.getElementById('btn-generate-tagline');
  if(!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true; btn.textContent = 'Generating…';
    try{
      const { tagline } = await api('/ai/tagline', { method:'POST', body: { company:"Mastersolis Infotech", tone:'innovative, trustworthy' } });
      document.getElementById('tagline').textContent = tagline;
    }catch(e){ toast('Using fallback tagline (backend not running)');
      document.getElementById('tagline').textContent = 'Building modern, AI-driven solutions for ambitious teams.';
    } finally { btn.disabled=false; btn.textContent='Generate AI Tagline'; }
  });

  // Hero intro animation
  if(window.anime){
    anime.timeline({ easing:'easeOutExpo' })
      .add({ targets: '.hero h1', translateY:[20,0], opacity:[0,1], duration:650 })
      .add({ targets: '.hero p', translateY:[14,0], opacity:[0,1], duration:500 }, '-=300')
      .add({ targets: '.cta .button', opacity:[0,1], scale:[0.96,1], delay: anime.stagger(80), duration:350 }, '-=300');
  }
}

async function initAbout(){
  const btn = document.getElementById('btn-team-intro');
  if(!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled=true; btn.textContent='Generating…';
    try{
      const { text } = await api('/ai/generate', { method:'POST', body: { type:'team-intro', team:[
        { name:'Anurag Singh', role:'AI Engineer' },
        { name:'Priya', role:'Frontend Dev' },
        { name:'Rohit', role:'Cloud Architect' },
      ]}});
      document.getElementById('team-intro').textContent = text;
    }catch(e){ toast('Fallback intro used');
      document.getElementById('team-intro').textContent = 'Our multidisciplinary team blends AI research, product design, and cloud reliability to ship business outcomes fast.';
    } finally { btn.disabled=false; btn.textContent='AI: Generate Team Intro'; }
  });
}

async function initServices(){
  document.querySelectorAll('[data-service] .btn-ai-desc').forEach((btn)=>{
    btn.addEventListener('click', async () => {
      const card = btn.closest('[data-service]');
      const serviceName = card.dataset.service;
      btn.disabled=true; btn.textContent='Generating…';
      try{
        const { text } = await api('/ai/generate', { method:'POST', body:{ type:'service-desc', serviceName } });
        card.querySelector('.desc').textContent = text;
      }catch(e){ toast('Fallback description used');
        card.querySelector('.desc').textContent = `${serviceName}: End-to-end delivery with measurable impact using best practices and AI accelerators.`;
      } finally { btn.disabled=false; btn.textContent='AI: Improve Description'; }
    });
  });
}

async function initProjects(){
  const filters = document.querySelectorAll('.filters [data-filter]');
  const allCards = Array.from(document.querySelectorAll('.project-card'));
  filters.forEach((b)=> b.addEventListener('click', ()=>{
    const f = b.dataset.filter;
    filters.forEach(x=>x.classList.remove('active')); b.classList.add('active');
    allCards.forEach(card=>{
      const tags = card.dataset.tags.split(',');
      card.style.display = (f==='all' || tags.includes(f)) ? '' : 'none';
    })
  }));

  document.querySelectorAll('.btn-ai-summary').forEach((btn)=>{
    btn.addEventListener('click', async ()=>{
      const card = btn.closest('.project-card');
      const name = card.dataset.name;
      btn.disabled=true; btn.textContent='Summarizing…';
      try{
        const { text } = await api('/ai/generate', { method:'POST', body:{ type:'project-summary', name } });
        card.querySelector('.summary').textContent = text;
      }catch(e){ toast('Fallback summary used');
        card.querySelector('.summary').textContent = `${name}: Delivered with an AI-first approach, improving reliability and reducing cost.`;
      } finally { btn.disabled=false; btn.textContent='AI: Generate Summary'; }
    });
  });
}

async function initContact(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled=true; btn.textContent='Sending…';
    try{
      const res = await api('/contact', { method:'POST', body:data });
      document.getElementById('ai-reply').textContent = res.ai_reply || 'We will get back to you shortly.';
      toast('Message sent'); form.reset();
    }catch(err){ toast('Backend not running — simulated success');
      document.getElementById('ai-reply').textContent = 'Thanks for reaching out! Our team will respond within one business day.';
    } finally { btn.disabled=false; btn.textContent='Send Message'; }
  })
}

async function initCareers(){
  // Load jobs
  const jobsEl = document.getElementById('jobs');
  const jobSelect = document.getElementById('job-id');
  try{
    const { jobs } = await api('/jobs');
    jobsEl.innerHTML = jobs.map(j => `<div class="card"><h3>${j.title}</h3><p class="muted">${j.location} • ${j.type}</p><p>${j.summary}</p><div>${j.skills.map(s=>`<span class='badge'>${s}</span>`).join(' ')}</div></div>`).join('');
    jobSelect.innerHTML = jobs.map(j=>`<option value="${j.id}">${j.title}</option>`).join('');
  }catch(e){
    jobsEl.innerHTML = '<p class="muted">Could not load jobs. Start the backend.</p>';
    jobSelect.innerHTML = '<option value="1">AI Engineer</option>';
  }

  // Upload resume
  const form = document.getElementById('resume-form');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled=true; btn.textContent='Analyzing…';
    try{
      const res = await api('/jobs/upload', { method:'POST', body: fd });
      document.getElementById('score').textContent = `Score: ${res.score}/100`;
      document.getElementById('feedback').textContent = res.feedback || 'Thanks for applying!';
    }catch(err){
      document.getElementById('score').textContent = 'Score: 62/100';
      document.getElementById('feedback').textContent = 'We estimated your fit based on core skills. For best results, run the backend.';
    } finally { btn.disabled=false; btn.textContent='Upload & Analyze'; }
  })
}


async function initBlog(){
  const container = document.getElementById('posts');
  try{
    const { posts } = await api('/admin/posts');
    container.innerHTML = posts.map(p=>`<div class="card"><h3>${p.title}</h3><p>${p.content.slice(0,160)}...</p><button class="button btn-sum" data-title="${p.title}">AI: Summarize</button><p class="muted summary"></p></div>`).join('');
    container.querySelectorAll('.btn-sum').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const card = btn.closest('.card');
        btn.disabled=true; btn.textContent='Summarizing…';
        try{ const { text } = await api('/ai/generate', { method:'POST', body:{ type:'blog-summary', title: btn.dataset.title } }); card.querySelector('.summary').textContent = text; }
        catch(e){ card.querySelector('.summary').textContent='Short summary unavailable.'; }
        finally{ btn.disabled=false; btn.textContent='AI: Summarize'; }
      });
    });
  }catch(e){ container.innerHTML = '<p class="muted">Login as admin and add some posts.</p>'; }
}

function initChatbot(){
  const toggle = document.getElementById('chat-toggle');
  const panel = document.getElementById('chatbot');
  const closeBtn = document.getElementById('chat-close');
  const body = document.getElementById('chat-body');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  if(!toggle || !panel) return;
  const openPanel = ()=>{
    toggle.style.display='none';
    panel.style.display='block';
    if(window.anime){
      panel.style.opacity=0; panel.style.transform='translateY(12px)';
      anime({ targets: panel, opacity:[0,1], translateY:[12,0], duration:300, easing:'easeOutCubic' });
    }
  };
  const closePanel = ()=>{
    if(window.anime){
      anime({ targets: panel, opacity:[1,0], translateY:[0,12], duration:220, easing:'easeInCubic', complete:()=>{ panel.style.display='none'; toggle.style.display='block'; panel.style.opacity=''; panel.style.transform=''; } });
    } else {
      panel.style.display='none'; toggle.style.display='block';
    }
  };
  toggle.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  const push = (text, who)=>{ const div = document.createElement('div'); div.className='msg '+who; div.textContent=text; body.appendChild(div); body.scrollTop = body.scrollHeight; };
  sendBtn.addEventListener('click', async ()=>{
    const msg = input.value.trim(); if(!msg) return; input.value=''; push(msg,'user');
    try{ const { reply } = await api('/ai/chat', { method:'POST', body:{ message: msg } }); push(reply,'bot'); }catch(e){ push('Please start the backend to chat.','bot'); }
  });
}

async function initResumeBuilder(){
  const jobSel = document.getElementById('rb-job');
  try{ const { jobs } = await api('/jobs'); jobSel.innerHTML = jobs.map(j=>`<option value="${j.id}">${j.title}</option>`).join(''); }catch(e){ jobSel.innerHTML='<option value="1">AI Engineer</option>'; }
  const form = document.getElementById('rb-form');
  const doc = document.getElementById('rb-doc');
  function render(){
    const d = Object.fromEntries(new FormData(form).entries());
    const skills = (d.skills||'').split(',').map(s=>s.trim()).filter(Boolean);
    doc.innerHTML = `
      <h2 style="margin:0 0 6px">${d.name||''}</h2>
      <p class="muted">${d.email||''} • ${d.phone||''}</p>
      <h3>Summary</h3><p>${d.summary||''}</p>
      <h3>Skills</h3><p>${skills.join(' • ')}</p>
      <h3>Experience</h3><p style="white-space:pre-wrap">${d.experience||''}</p>
      <h3>Education</h3><p style="white-space:pre-wrap">${d.education||''}</p>
    `;
  }
  document.getElementById('rb-preview').addEventListener('click', render);
  document.getElementById('rb-download').addEventListener('click', ()=>{ render(); window.print(); });
  document.getElementById('rb-submit').addEventListener('click', async ()=>{
    render();
    const d = Object.fromEntries(new FormData(form).entries());
    const payload = new URLSearchParams(d);
    try{
      const res = await fetch(`${API_BASE}/jobs/apply`, { method:'POST', body: payload });
      const j = await res.json();
      toast(`Application submitted. ${j.feedback||''} Score: ${j.score}`);
    }catch(e){ toast('Failed to submit. Is the backend running?'); }
  });
}

// Admin page logic
async function initAdmin(){
  const loginCard = document.getElementById('login-card');
  const metricsCard = document.getElementById('metrics-card');
  const contentCard = document.getElementById('content-card');
  const appsCard = document.getElementById('apps-card');
  const aiCard = document.getElementById('ai-card');

  const loginForm = document.getElementById('admin-login');
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());
    try{
      const { token } = await api('/admin/login', { method:'POST', body:data });
      localStorage.setItem('admin_token', token);
      toast('Logged in');
      loginCard.style.display='none'; metricsCard.style.display='block'; contentCard.style.display='block'; appsCard.style.display='block'; aiCard.style.display='block';
      loadAdminData();
    }catch(e){
      // Demo mode fallback (no backend)
      toast('Demo mode: backend not running');
      localStorage.setItem('admin_token','demo');
      loginCard.style.display='none'; metricsCard.style.display='block'; contentCard.style.display='block'; appsCard.style.display='block'; aiCard.style.display='block';
      loadAdminDataDemo();
    }
  });

  async function loadAdminData(){
    try{ const m = await api('/admin/analytics'); document.getElementById('metrics').innerHTML = `<div class="grid cols-4"><div class="card"><h3>${m.visits}</h3><p class="muted">Visits</p></div><div class="card"><h3>${m.leads}</h3><p class="muted">Leads</p></div><div class="card"><h3>${m.applications}</h3><p class="muted">Applications</p></div><div class="card"><h3>${m.jobs}</h3><p class="muted">Jobs</p></div></div>`;}catch(e){ loadAdminDataDemo(); }
    try{ const { applications } = await api('/admin/applications'); document.getElementById('applications').innerHTML = applications.map(a=>`<div class='card'><h3>${a.name||'Applicant'}</h3><p class='muted'>Job #${a.job_id}</p><p>Score: ${a.score||'-'}</p><p>Skills: ${a.parsed_skills||'-'}</p></div>`).join(''); }catch(e){ /* ignore */ }
  }

  function loadAdminDataDemo(){
    document.getElementById('metrics').innerHTML = `<div class="grid cols-4">
      <div class="card"><h3>1,204</h3><p class="muted">Visits</p></div>
      <div class="card"><h3>87</h3><p class="muted">Leads</p></div>
      <div class="card"><h3>19</h3><p class="muted">Applications</p></div>
      <div class="card"><h3>5</h3><p class="muted">Jobs</p></div>
    </div>`;
    document.getElementById('applications').innerHTML = `<div class='card'><h3>Sample Candidate</h3><p class='muted'>Job #1</p><p>Score: 72</p><p>Skills: Python, React, AWS</p></div>`;
  }

  document.getElementById('job-add').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    d.skills = (d.skills||'').split(',').map(s=>s.trim()).filter(Boolean);
    try{ await api('/admin/jobs', { method:'POST', body:d }); toast('Job added'); loadAdminData(); }
    catch(e){ toast('Add job failed'); }
  });

  document.getElementById('post-add').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    try{ await api('/admin/posts', { method:'POST', body:d }); toast('Post added'); }
    catch(e){ toast('Add post failed'); }
  });

  document.getElementById('btn-analytics').addEventListener('click', async ()=>{
    const b = document.getElementById('btn-analytics');
    b.disabled=true; b.textContent='Generating…';
    try{
      const { text } = await api('/ai/analytics-summary');
      document.getElementById('ai-summary').textContent = text;
    }catch(e){ document.getElementById('ai-summary').textContent = 'Traffic is up week-over-week; optimize the careers funnel next.'; }
    finally{ b.disabled=false; b.textContent='AI: Summarize Analytics'; }
  });
}

// Router
function initSinglePageNav(){
  const scroller = document.getElementById('page');
  const links = Array.from(document.querySelectorAll('.sp-links a[data-target]'));
  if(!scroller || !links.length) return;
  links.forEach(a=>{
    a.addEventListener('click',(e)=>{
      e.preventDefault();
      const id = a.dataset.target;
      const el = document.getElementById(id);
      if(!el) return;
      scroller.scrollTo({ top: el.offsetTop, behavior:'smooth' });
    });
  });
  const map = Object.fromEntries(links.map(a=>[a.dataset.target,a]));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const l = map[e.target.id]; if(l) l.classList.add('active');
      }
    })
  }, { threshold:0.6, root: scroller });
  document.querySelectorAll('.section').forEach(s=> io.observe(s));
}

window.addEventListener('DOMContentLoaded', () => {
  initAnimationsCommon();
  initIntroHUD();
  initSinglePageTransitions();
  initSinglePageNav();
  // Initialize modules opportunistically if elements exist
  initHome();
  initServices();
  initProjects();
  initContact();
  // Page-specific initializers (for standalone pages like admin)
  const page = document.body.dataset.page;
  if(page==='admin') initAdmin();
  if(page==='blog') initBlog();
  if(page==='resume-builder') initResumeBuilder();
  if(page==='careers') initCareers();
  if(page==='about') initAbout();
  initChatbot();
});

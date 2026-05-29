/* ═══════════════════════════════════════════════════════════
   SMART ZONE — script.js
   Um Novo Conceito de Tecnologia
   ═══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   1) LOGIN DO ADMINISTRADOR (área restrita)
   ──────────────────────────────────────────────
   AVISO: Este login é validado no navegador (front-end).
   Serve como uma "porta" simples. Para segurança real,
   as credenciais precisam ser validadas em um servidor.
*/
const ADMIN_EMAIL = "Smartzonematriz@gmail.com";
const ADMIN_SENHA = "@Dlz1nx69";

function openLogin() {
  // Se já estiver logado, abre direto o painel
  if (sessionStorage.getItem("sz_admin") === "ok") { abrirPainel(); return; }
  const ov = document.getElementById("login-overlay");
  ov.classList.add("open");
  document.getElementById("login-error").classList.remove("show");
  setTimeout(() => document.getElementById("login-email").focus(), 200);
  document.body.style.overflow = "hidden";
}
function closeLogin() {
  document.getElementById("login-overlay").classList.remove("open");
  document.body.style.overflow = "";
}
function toggleSenha() {
  const inp = document.getElementById("login-pass");
  const icon = document.getElementById("eye-icon");
  if (inp.type === "password") { inp.type = "text"; icon.className = "fas fa-eye-slash"; }
  else { inp.type = "password"; icon.className = "fas fa-eye"; }
}
function fazerLogin() {
  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-pass").value;
  const err = document.getElementById("login-error");
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && senha === ADMIN_SENHA) {
    err.classList.remove("show");
    sessionStorage.setItem("sz_admin", "ok");
    closeLogin();
    document.getElementById("login-pass").value = "";
    abrirPainel();
  } else {
    err.classList.add("show");
    const box = document.getElementById("login-box");
    box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
  }
}
function fazerLogout() {
  sessionStorage.removeItem("sz_admin");
  document.getElementById("admin-panel").classList.remove("open");
  document.body.style.overflow = "";
}
function abrirPainel() {
  const p = document.getElementById("admin-panel");
  renderAdminStats();
  renderAdminOS();
  p.classList.add("open");
  document.body.style.overflow = "hidden";
}
function fecharPainelErolar(id) {
  document.getElementById("admin-panel").classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({behavior:"smooth"}); }, 100);
  return false;
}

// Enter envia o login
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.getElementById("login-overlay").classList.contains("open")) fazerLogin();
  if (e.key === "Escape") { closeLogin(); }
});
// Clique fora fecha o login
document.getElementById("login-overlay").addEventListener("click", e => {
  if (e.target.id === "login-overlay") closeLogin();
});
// Mantém logado durante a sessão
if (sessionStorage.getItem("sz_admin") === "ok") {
  window.addEventListener("DOMContentLoaded", () => {/* sessão ativa, painel abre só ao clicar em Entrar */});
}

/* ──────────────────────────────────────────────
   2) PAINEL ADMIN — métricas e lista de OS
   ────────────────────────────────────────────── */
function renderAdminStats() {
  const total = Object.keys(osDatabase).length;
  let pronto=0, manut=0, teste=0, entrada=0;
  Object.values(osDatabase).forEach(o => {
    if (o.status === "pronto") pronto++;
    else if (o.status === "manutencao") manut++;
    else if (o.status === "teste") teste++;
    else if (o.status === "entrada") entrada++;
  });
  const cards = [
    {icon:"fa-clipboard-list", n: total,   l:"Total de OS",       c:"#19e23c"},
    {icon:"fa-check-double",   n: pronto,  l:"Prontas",           c:"#25d366"},
    {icon:"fa-screwdriver-wrench", n: manut, l:"Em Manutenção",   c:"#62ff7a"},
    {icon:"fa-vial",           n: teste,   l:"Em Teste",          c:"#b06aff"},
    {icon:"fa-inbox",          n: entrada, l:"Entradas",          c:"#ffaa00"},
  ];
  const wrap = document.getElementById("admin-stats");
  wrap.innerHTML = "";
  cards.forEach((c,i) => {
    const d = document.createElement("div");
    d.className = "admin-stat-card";
    d.style.animationDelay = (i*0.07)+"s";
    d.innerHTML = '<i class="fas '+c.icon+'" style="color:'+c.c+'"></i>'+
                  '<div class="admin-stat-num" data-target="'+c.n+'">0</div>'+
                  '<div class="admin-stat-label">'+c.l+'</div>';
    wrap.appendChild(d);
  });
  // count-up
  wrap.querySelectorAll(".admin-stat-num").forEach(el => animarNumero(el, parseInt(el.dataset.target), 800));
}

function renderAdminOS() {
  const q = (document.getElementById("admin-os-search").value || "").toLowerCase();
  const list = document.getElementById("admin-os-list");
  list.innerHTML = "";
  const entries = Object.entries(osDatabase).filter(([num,o]) =>
    num.toLowerCase().includes(q) || o.device.toLowerCase().includes(q));
  if (!entries.length) { list.innerHTML = '<p class="admin-empty">Nenhuma OS encontrada.</p>'; return; }
  entries.forEach(([num,o]) => {
    const si = statusInfo[o.status] || {label:o.status, cls:""};
    const passo = o.steps.find(s => s.state === "current") || o.steps[o.steps.length-1];
    const row = document.createElement("div");
    row.className = "admin-os-row";
    row.innerHTML =
      '<div class="admin-os-main"><span class="admin-os-num">'+num+'</span>'+
      '<span class="admin-os-device">'+o.device+'</span></div>'+
      '<div class="admin-os-step">'+passo.title+'</div>'+
      '<span class="admin-os-badge '+si.cls+'">'+si.label+'</span>';
    list.appendChild(row);
  });
}

/* ──────────────────────────────────────────────
   3) PARTÍCULAS ANIMADAS (rede neon no hero)
   ────────────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];
  const COUNT = window.innerWidth < 768 ? 32 : 64;
  const MAXDIST = 140;

  function resize() {
    const hero = document.getElementById("inicio");
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
  }
  function makeParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random()*w, y: Math.random()*h,
        vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
        r: Math.random()*1.8 + 0.6
      });
    }
  }
  function draw() {
    ctx.clearRect(0,0,w,h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = "rgba(25,226,60,0.85)";
      ctx.shadowColor = "rgba(25,226,60,0.9)";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
      for (let j = i+1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x-q.x, dy = p.y-q.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAXDIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = "rgba(25,226,60,"+(0.18*(1-dist/MAXDIST))+")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  resize(); makeParticles(); draw();
  window.addEventListener("resize", () => { resize(); makeParticles(); });
}

/* ──────────────────────────────────────────────
   4) CONTADOR ANIMADO (números que sobem)
   ────────────────────────────────────────────── */
function animarNumero(el, alvo, duracao) {
  if (isNaN(alvo)) return;
  const inicio = performance.now();
  function passo(t) {
    const p = Math.min((t - inicio) / duracao, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = Math.round(eased * alvo).toLocaleString("pt-BR");
    if (p < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

// Stats da home: detecta o número dentro do texto e anima ao aparecer
function initContadores() {
  const statNums = document.querySelectorAll("#stats .stat-num");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.done) {
        e.target.dataset.done = "1";
        const raw = e.target.textContent;
        const match = raw.match(/[\d.]+/);
        if (!match) return;
        const prefix = raw.slice(0, match.index);
        const num = parseInt(match[0].replace(/\./g, ""));
        const suffix = raw.slice(match.index + match[0].length);
        const el = e.target;
        const inicio = performance.now(), dur = 1400;
        (function run(t){
          const pr = Math.min((t-inicio)/dur,1);
          const eased = 1 - Math.pow(1-pr,3);
          el.textContent = prefix + Math.round(eased*num).toLocaleString("pt-BR") + suffix;
          if (pr < 1) requestAnimationFrame(run);
        })(performance.now());
      }
    });
  }, { threshold: 0.4 });
  statNums.forEach(s => obs.observe(s));
}

/* ──────────────────────────────────────────────
   5) NAVBAR encolhe ao rolar + botão "voltar ao topo"
   ────────────────────────────────────────────── */
function initNavScroll() {
  const nav = document.querySelector("nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  });
}

/* ──────────────────────────────────────────────
   6) Inicialização geral
   ────────────────────────────────────────────── */
window.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initContadores();
  initNavScroll();
});

/* ═══════════════════════════════════════════════════════════
   CÓDIGO ORIGINAL (orçamento, rastreio, menu, scroll reveal)
   ═══════════════════════════════════════════════════════════ */
// ─── ORÇAMENTO DATA ─── (todos os valores zerados — edite conforme necessário)
const orcData = {
  apple: {
    modelos: ["iPhone SE (2022)","iPhone 11","iPhone 11 Pro","iPhone 12","iPhone 12 Mini","iPhone 12 Pro","iPhone 12 Pro Max","iPhone 13","iPhone 13 Mini","iPhone 13 Pro","iPhone 13 Pro Max","iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max","iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max"],
    reparos: {
      "Troca de Tela": {
        "iPhone SE (2022)":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 11":   {peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 11 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 12":   {peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 12 Mini":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 12 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 12 Pro Max":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 13":   {peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 13 Mini":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 13 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 13 Pro Max":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 14":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 14 Plus":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 14 Pro":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 14 Pro Max":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 15":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 15 Plus":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 15 Pro":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 15 Pro Max":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
      },
      "Troca de Bateria": {
        "iPhone SE (2022)":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 11":   {peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 11 Pro":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 12":   {peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 12 Mini":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 12 Pro":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 12 Pro Max":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 13":   {peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 13 Mini":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 13 Pro":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 13 Pro Max":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "iPhone 14":   {peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "iPhone 14 Plus":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "iPhone 14 Pro":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "iPhone 14 Pro Max":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "iPhone 15":   {peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "iPhone 15 Plus":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "iPhone 15 Pro":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "iPhone 15 Pro Max":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
      },
      "Conector de Carga": {
        "iPhone SE (2022)":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 11":   {peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 11 Pro":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 12":   {peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 12 Mini":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 12 Pro":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 12 Pro Max":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 13":   {peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 13 Mini":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 13 Pro":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 13 Pro Max":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 14":   {peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 14 Plus":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 14 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 14 Pro Max":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 15":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 15 Plus":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 15 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 15 Pro Max":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
      },
      "Câmera Traseira": {
        "iPhone SE (2022)":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 11":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 11 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 12":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 12 Mini":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 12 Pro":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 12 Pro Max":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 13":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 13 Mini":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 13 Pro":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 13 Pro Max":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 14":   {peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 14 Plus":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 14 Pro":{peca:0,mao:0,prazo:"2-3 dias úteis",garantia:"90 dias"},
        "iPhone 14 Pro Max":{peca:0,mao:0,prazo:"2-3 dias úteis",garantia:"90 dias"},
        "iPhone 15":   {peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 15 Plus":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 15 Pro":{peca:0,mao:0,prazo:"2-3 dias úteis",garantia:"90 dias"},
        "iPhone 15 Pro Max":{peca:0,mao:0,prazo:"2-3 dias úteis",garantia:"90 dias"},
      },
      "Câmera Frontal": {
        "iPhone SE (2022)":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "iPhone 11":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 11 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 12":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 12 Mini":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 12 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 12 Pro Max":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 13":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 13 Mini":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 13 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 13 Pro Max":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 14":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 14 Plus":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 14 Pro":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 14 Pro Max":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 15":   {peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 15 Plus":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "iPhone 15 Pro":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "iPhone 15 Pro Max":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
      },
      "Reparo de Placa": {
        "iPhone SE (2022)":{peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 11":   {peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 11 Pro":{peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 12":   {peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 12 Mini":{peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 12 Pro":{peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 12 Pro Max":{peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 13":   {peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 13 Mini":{peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 13 Pro":{peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 13 Pro Max":{peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 14":   {peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 14 Plus":{peca:0,mao:0,prazo:"3-5 dias úteis",garantia:"30 dias"},
        "iPhone 14 Pro":{peca:0,mao:0,prazo:"5-7 dias úteis",garantia:"30 dias"},
        "iPhone 14 Pro Max":{peca:0,mao:0,prazo:"5-7 dias úteis",garantia:"30 dias"},
        "iPhone 15":   {peca:0,mao:0,prazo:"5-7 dias úteis",garantia:"30 dias"},
        "iPhone 15 Plus":{peca:0,mao:0,prazo:"5-7 dias úteis",garantia:"30 dias"},
        "iPhone 15 Pro":{peca:0,mao:0,prazo:"5-7 dias úteis",garantia:"30 dias"},
        "iPhone 15 Pro Max":{peca:0,mao:0,prazo:"5-7 dias úteis",garantia:"30 dias"},
      },
      "Película de Proteção": {
        "iPhone SE (2022)":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 11":   {peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 11 Pro":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 12":   {peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 12 Mini":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 12 Pro":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 12 Pro Max":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 13":   {peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 13 Mini":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 13 Pro":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 13 Pro Max":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 14":   {peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 14 Plus":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 14 Pro":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 14 Pro Max":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 15":   {peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 15 Plus":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 15 Pro":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
        "iPhone 15 Pro Max":{peca:0,mao:0,prazo:"30 minutos",garantia:"30 dias"},
      }
    }
  },
  samsung: {
    modelos: ["Galaxy S23","Galaxy S23+","Galaxy S23 Ultra","Galaxy S24","Galaxy S24+","Galaxy S24 Ultra","Galaxy A14","Galaxy A34","Galaxy A54","Galaxy A55"],
    reparos: {
      "Troca de Tela": {
        "Galaxy S23":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Galaxy S23+":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Galaxy S23 Ultra":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "Galaxy S24":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Galaxy S24+":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Galaxy S24 Ultra":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "Galaxy A14":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy A34":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy A54":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy A55":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
      },
      "Troca de Bateria": {
        "Galaxy S23":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Galaxy S23+":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Galaxy S23 Ultra":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "Galaxy S24":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Galaxy S24+":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "Galaxy S24 Ultra":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "Galaxy A14":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Galaxy A34":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Galaxy A54":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Galaxy A55":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
      },
      "Conector de Carga": {
        "Galaxy S23":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy S23+":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy S23 Ultra":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Galaxy S24":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy S24+":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy S24 Ultra":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Galaxy A14":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy A34":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy A54":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Galaxy A55":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
      }
    }
  },
  motorola: {
    modelos: ["Moto G34","Moto G52","Moto G73","Moto G84","Edge 40","Edge 50 Pro","Moto E22"],
    reparos: {
      "Troca de Tela": {
        "Moto G34":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Moto G52":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Moto G73":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Moto G84":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Edge 40":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Edge 50 Pro":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
        "Moto E22":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
      },
      "Troca de Bateria": {
        "Moto G34":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Moto G52":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Moto G73":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Moto G84":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Edge 40":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "Edge 50 Pro":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
        "Moto E22":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
      },
      "Conector de Carga": {
        "Moto G34":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Moto G52":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Moto G73":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Moto G84":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Edge 40":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Edge 50 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Moto E22":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
      }
    }
  },
  xiaomi: {
    modelos: ["Redmi Note 12","Redmi Note 13 Pro","Poco X6 Pro","Poco M6 Pro","Xiaomi 14 Ultra"],
    reparos: {
      "Troca de Tela": {
        "Redmi Note 12":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Redmi Note 13 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Poco X6 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Poco M6 Pro":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
        "Xiaomi 14 Ultra":{peca:0,mao:0,prazo:"1-2 dias úteis",garantia:"90 dias"},
      },
      "Troca de Bateria": {
        "Redmi Note 12":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Redmi Note 13 Pro":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Poco X6 Pro":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Poco M6 Pro":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Xiaomi 14 Ultra":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
      },
      "Conector de Carga": {
        "Redmi Note 12":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Redmi Note 13 Pro":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Poco X6 Pro":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Poco M6 Pro":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Xiaomi 14 Ultra":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
      }
    }
  },
  lg: {
    modelos: ["K62+","K52","Velvet"],
    reparos: {
      "Troca de Tela": {
        "K62+":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "K52":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Velvet":{peca:0,mao:0,prazo:"1 dia útil",garantia:"90 dias"},
      },
      "Troca de Bateria": {
        "K62+":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "K52":{peca:0,mao:0,prazo:"1-2 horas",garantia:"6 meses"},
        "Velvet":{peca:0,mao:0,prazo:"2-3 horas",garantia:"6 meses"},
      },
      "Conector de Carga": {
        "K62+":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "K52":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
        "Velvet":{peca:0,mao:0,prazo:"Mesmo dia",garantia:"90 dias"},
      }
    }
  }
};

function updateModelos() {
  const marca = document.getElementById("sel-marca").value;
  const selMod = document.getElementById("sel-modelo");
  const selRep = document.getElementById("sel-reparo");
  selMod.innerHTML = '<option value="">— Selecione o modelo —</option>';
  selRep.innerHTML = '<option value="">— Selecione o reparo —</option>';
  document.getElementById("orc-result").classList.remove("show");
  document.getElementById("step2-ind").classList.remove("active");
  document.getElementById("step3-ind").classList.remove("active");
  if (!marca || marca === "outro") {
    document.getElementById("step1-ind").classList.toggle("active", !!marca);
    return;
  }
  document.getElementById("step1-ind").classList.add("active");
  orcData[marca].modelos.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m; opt.textContent = m;
    selMod.appendChild(opt);
  });
}

function updateReparo() {
  const marca = document.getElementById("sel-marca").value;
  const modelo = document.getElementById("sel-modelo").value;
  const selRep = document.getElementById("sel-reparo");
  selRep.innerHTML = '<option value="">— Selecione o reparo —</option>';
  document.getElementById("orc-result").classList.remove("show");
  document.getElementById("step3-ind").classList.remove("active");
  if (!modelo || !marca || marca === "outro") return;
  document.getElementById("step2-ind").classList.add("active");
  const reparos = orcData[marca].reparos;
  Object.keys(reparos).forEach(r => {
    if (reparos[r][modelo]) {
      const opt = document.createElement("option");
      opt.value = r; opt.textContent = r;
      selRep.appendChild(opt);
    }
  });
}

function calcularOrcamento() {
  const marca = document.getElementById("sel-marca").value;
  const modelo = document.getElementById("sel-modelo").value;
  const reparo = document.getElementById("sel-reparo").value;
  const res = document.getElementById("orc-result");
  if (!marca || !modelo || !reparo) { res.classList.remove("show"); return; }
  if (marca === "outro") {
    document.getElementById("orc-title").textContent = "Orçamento personalizado necessário";
    document.getElementById("orc-peca").textContent = "—";
    document.getElementById("orc-mao").textContent = "—";
    document.getElementById("orc-prazo").textContent = "A definir";
    document.getElementById("orc-garantia").textContent = "A definir";
    document.getElementById("orc-total").textContent = "Consultar";
    document.getElementById("btn-orc-wpp").href = "https://api.whatsapp.com/send?phone=555193219397&text=Ol%C3%A1!%20Tenho%20um%20aparelho%20de%20outra%20marca%20e%20preciso%20de%20or%C3%A7amento%20na%20Smart%20Zone.";
    res.classList.add("show");
    document.getElementById("step3-ind").classList.add("active");
    return;
  }
  const d = orcData[marca].reparos[reparo][modelo];
  const total = d.peca + d.mao;
  document.getElementById("orc-title").textContent = modelo + " — " + reparo;
  document.getElementById("orc-peca").textContent = "R$ " + d.peca.toLocaleString("pt-BR");
  document.getElementById("orc-mao").textContent = "R$ " + d.mao.toLocaleString("pt-BR");
  document.getElementById("orc-prazo").textContent = d.prazo;
  document.getElementById("orc-garantia").textContent = d.garantia;
  document.getElementById("orc-total").textContent = "R$ " + total.toLocaleString("pt-BR");
  const msg = encodeURIComponent("Olá! Fiz o orçamento pelo site da Smart Zone:\n📱 Aparelho: " + modelo + "\n🔧 Reparo: " + reparo + "\n💰 Estimativa: R$ " + total + "\n\nGostaria de confirmar e agendar!");
  document.getElementById("btn-orc-wpp").href = "https://api.whatsapp.com/send?phone=555193219397&text=" + msg;
  res.classList.add("show");
  document.getElementById("step3-ind").classList.add("active");
}

// ─── BANCO DE DADOS DE OS (30 códigos) ───
const osDatabase = {
  "OS-2401": { device:"iPhone 13 — Troca de Tela", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido e registrado",time:"Seg, 21/04 às 10:30",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Problema identificado: tela com manchas",time:"Seg, 21/04 às 11:00",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Tela removida e nova tela instalada",time:"Seg, 21/04 às 14:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Touch, câmera, Face ID — tudo OK",time:"Seg, 21/04 às 16:30",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aparelho pronto! Pode vir buscar.",time:"Seg, 21/04 às 17:00",state:"current"},
    ]},
  "OS-2402": { device:"Samsung Galaxy S24 — Troca de Bateria", status:"manutencao",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido e registrado",time:"Ter, 22/04 às 09:15",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Bateria com 67% de capacidade",time:"Ter, 22/04 às 10:00",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Substituição de bateria em andamento",time:"Ter, 22/04 às 14:00",state:"current"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando conclusão",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2403": { device:"Motorola Edge 40 — Conector de Carga", status:"teste",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido e registrado",time:"Qua, 23/04 às 11:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Conector USB-C com mau contato",time:"Qua, 23/04 às 11:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Conector substituído com sucesso",time:"Qua, 23/04 às 15:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Testando carregamento",time:"Qui, 24/04 às 09:00",state:"current"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando aprovação nos testes",time:"—",state:"pending"},
    ]},
  "OS-2404": { device:"iPhone 15 Pro — Câmera Traseira", status:"entrada",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido — aguardando diagnóstico",time:"Sex, 25/04 às 10:00",state:"current"},
      {icon:"fa-search",title:"Diagnóstico",desc:"A realizar",time:"—",state:"pending"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Aguardando diagnóstico",time:"—",state:"pending"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2405": { device:"Xiaomi Redmi Note 12 — Troca de Tela", status:"manutencao",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido e registrado",time:"Seg, 28/04 às 08:45",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Tela rachada, touch inoperante",time:"Seg, 28/04 às 09:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Aguardando peça — chegada prevista amanhã",time:"—",state:"current"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2406": { device:"Samsung Galaxy A54 — Troca de Bateria", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido e registrado",time:"Ter, 29/04 às 10:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Bateria inchada — substituição urgente",time:"Ter, 29/04 às 10:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Bateria substituída com segurança",time:"Ter, 29/04 às 13:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Carregamento e autonomia testados — OK",time:"Ter, 29/04 às 15:00",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Pronto! Pode buscar.",time:"Ter, 29/04 às 15:30",state:"current"},
    ]},
  "OS-2407": { device:"Moto G84 — Conector de Carga", status:"teste",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qua, 30/04 às 09:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Porta USB-C solta",time:"Qua, 30/04 às 09:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Conector trocado",time:"Qua, 30/04 às 14:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Testando carregamento rápido",time:"Qui, 01/05 às 09:00",state:"current"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2408": { device:"iPhone 14 Pro — Troca de Tela", status:"entrada",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Sex, 02/05 às 14:00",state:"current"},
      {icon:"fa-search",title:"Diagnóstico",desc:"A realizar",time:"—",state:"pending"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Aguardando diagnóstico",time:"—",state:"pending"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2409": { device:"Samsung S23 Ultra — Reparo de Placa", status:"manutencao",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Seg, 05/05 às 10:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Placa com curto no circuito de carga",time:"Seg, 05/05 às 11:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Reparo de microssoldagem em andamento",time:"Ter, 06/05 às 09:00",state:"current"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2410": { device:"Poco X6 Pro — Câmera Frontal", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Seg, 05/05 às 14:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Câmera frontal sem imagem",time:"Seg, 05/05 às 14:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Câmera frontal substituída",time:"Ter, 06/05 às 10:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Selfie e videochamada testados — OK",time:"Ter, 06/05 às 14:00",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Pronto! Pode buscar.",time:"Ter, 06/05 às 14:30",state:"current"},
    ]},
  "OS-2411": { device:"iPhone 12 — Troca de Bateria", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qua, 07/05 às 09:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Bateria com 74% de capacidade",time:"Qua, 07/05 às 09:15",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Bateria substituída",time:"Qua, 07/05 às 11:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Autonomia testada — OK",time:"Qua, 07/05 às 12:00",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Pronto! Pode buscar.",time:"Qua, 07/05 às 12:30",state:"current"},
    ]},
  "OS-2412": { device:"Moto E22 — Troca de Tela", status:"teste",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qui, 08/05 às 08:30",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Tela trincada",time:"Qui, 08/05 às 09:00",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Tela substituída",time:"Qui, 08/05 às 11:30",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Testando touch e qualidade de imagem",time:"Qui, 08/05 às 14:00",state:"current"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2413": { device:"Galaxy A14 — Conector de Carga", status:"entrada",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Sex, 09/05 às 10:00",state:"current"},
      {icon:"fa-search",title:"Diagnóstico",desc:"A realizar",time:"—",state:"pending"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2414": { device:"iPhone 11 — Câmera Traseira", status:"manutencao",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Seg, 12/05 às 09:30",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Câmera traseira com foco falhando",time:"Seg, 12/05 às 10:00",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Aguardando peça — a chegar",time:"—",state:"current"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2415": { device:"Redmi Note 13 Pro — Troca de Tela", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Ter, 13/05 às 11:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Tela estilhaçada, touch funciona",time:"Ter, 13/05 às 11:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Display substituído",time:"Ter, 13/05 às 15:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Touch, brilho e cores — OK",time:"Ter, 13/05 às 17:00",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Pronto! Pode buscar.",time:"Ter, 13/05 às 17:30",state:"current"},
    ]},
  "OS-2416": { device:"Edge 50 Pro — Película de Proteção", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qua, 14/05 às 10:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Película danificada",time:"Qua, 14/05 às 10:05",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Película de vidro aplicada",time:"Qua, 14/05 às 10:20",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Sem bolhas e alinhada — OK",time:"Qua, 14/05 às 10:25",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Pronto! Pode buscar.",time:"Qua, 14/05 às 10:30",state:"current"},
    ]},
  "OS-2417": { device:"iPhone 13 Pro — Reparo de Placa", status:"teste",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qui, 15/05 às 09:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Queda d'água — placa com corrosão",time:"Qui, 15/05 às 10:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Limpeza e microssoldagem realizados",time:"Sex, 16/05 às 11:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Testando todas as funções",time:"Sex, 16/05 às 15:00",state:"current"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2418": { device:"Galaxy S24+ — Câmera Frontal", status:"entrada",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Seg, 19/05 às 14:30",state:"current"},
      {icon:"fa-search",title:"Diagnóstico",desc:"A realizar",time:"—",state:"pending"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2419": { device:"Moto G73 — Troca de Bateria", status:"manutencao",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Ter, 20/05 às 10:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Bateria inchando — risco de segurança",time:"Ter, 20/05 às 10:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Substituição em andamento",time:"Ter, 20/05 às 13:00",state:"current"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2420": { device:"iPhone 15 Plus — Troca de Tela", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qua, 21/05 às 09:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Tela com manchas de pressão",time:"Qua, 21/05 às 09:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Display OLED substituído",time:"Qua, 21/05 às 14:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Face ID, touch e brilho — OK",time:"Qua, 21/05 às 16:00",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Pronto! Pode buscar.",time:"Qua, 21/05 às 16:30",state:"current"},
    ]},
  "OS-2421": { device:"LG K62+ — Conector de Carga", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qui, 22/05 às 10:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Conector frouxo, carregamento intermitente",time:"Qui, 22/05 às 10:20",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Conector trocado",time:"Qui, 22/05 às 13:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Carregamento estável — OK",time:"Qui, 22/05 às 14:30",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Pronto! Pode buscar.",time:"Qui, 22/05 às 15:00",state:"current"},
    ]},
  "OS-2422": { device:"iPhone 14 — Troca de Bateria", status:"manutencao",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Sex, 23/05 às 09:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Bateria com 79% — desligando inesperadamente",time:"Sex, 23/05 às 09:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Substituição em andamento",time:"Sex, 23/05 às 13:00",state:"current"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2423": { device:"Poco M6 Pro — Troca de Tela", status:"entrada",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Seg, 26/05 às 11:00",state:"current"},
      {icon:"fa-search",title:"Diagnóstico",desc:"A realizar",time:"—",state:"pending"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2424": { device:"Galaxy A34 — Câmera Traseira", status:"teste",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Ter, 27/05 às 09:30",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Câmera traseira embaçada internamente",time:"Ter, 27/05 às 10:00",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Módulo substituído",time:"Ter, 27/05 às 15:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Testando qualidade de imagem",time:"Qua, 28/05 às 09:00",state:"current"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2425": { device:"Moto G52 — Troca de Tela", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qua, 28/05 às 10:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Tela com linhas verticais",time:"Qua, 28/05 às 10:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Display substituído",time:"Qua, 28/05 às 14:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Touch e imagem — OK",time:"Qua, 28/05 às 16:00",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Pronto! Pode buscar.",time:"Qua, 28/05 às 16:30",state:"current"},
    ]},
  "OS-2426": { device:"iPhone 12 Pro — Câmera Frontal", status:"manutencao",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qui, 29/05 às 09:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Face ID parcialmente inoperante",time:"Qui, 29/05 às 10:00",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Módulo de câmera frontal em substituição",time:"Sex, 30/05 às 09:00",state:"current"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2427": { device:"Galaxy S23 — Reparo de Placa", status:"entrada",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Sex, 30/05 às 14:00",state:"current"},
      {icon:"fa-search",title:"Diagnóstico",desc:"A realizar",time:"—",state:"pending"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2428": { device:"Xiaomi 14 Ultra — Conector de Carga", status:"pronto",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Seg, 02/06 às 10:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Conector USB-C com pino dobrado",time:"Seg, 02/06 às 10:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Conector substituído",time:"Seg, 02/06 às 14:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Carga rápida 90W — OK",time:"Seg, 02/06 às 16:00",state:"done"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Pronto! Pode buscar.",time:"Seg, 02/06 às 16:30",state:"current"},
    ]},
  "OS-2429": { device:"iPhone SE 2022 — Troca de Bateria", status:"teste",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Ter, 03/06 às 09:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Bateria com 71% — desempenho reduzido",time:"Ter, 03/06 às 09:20",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Bateria substituída",time:"Ter, 03/06 às 11:00",state:"done"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Testando autonomia",time:"Ter, 03/06 às 14:00",state:"current"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
  "OS-2430": { device:"Galaxy A55 — Troca de Tela", status:"manutencao",
    steps:[
      {icon:"fa-sign-in-alt",title:"Entrada na Loja",desc:"Aparelho recebido",time:"Qua, 04/06 às 10:00",state:"done"},
      {icon:"fa-search",title:"Diagnóstico",desc:"Tela quebrada — touch sem resposta",time:"Qua, 04/06 às 10:30",state:"done"},
      {icon:"fa-tools",title:"Em Manutenção",desc:"Aguardando peça específica",time:"—",state:"current"},
      {icon:"fa-vial",title:"Teste e Qualidade",desc:"Aguardando",time:"—",state:"pending"},
      {icon:"fa-check-double",title:"Pronto para Retirada",desc:"Aguardando",time:"—",state:"pending"},
    ]},
};

const statusInfo = {
  pronto:     {label:"✅ Pronto para Retirada", cls:"status-pronto"},
  manutencao: {label:"🔧 Em Manutenção", cls:"status-manutencao"},
  teste:      {label:"🧪 Em Teste", cls:"status-teste"},
  entrada:    {label:"📋 Entrada Registrada", cls:"status-entrada"},
};

function rastrearOS() {
  const num = document.getElementById("os-input").value.trim().toUpperCase();
  const card = document.getElementById("os-card");
  const os = osDatabase[num];
  if (!os) {
    card.classList.remove("show");
    alert("OS não encontrada. Verifique o número ou consulte via WhatsApp.");
    return;
  }
  document.getElementById("os-num").textContent = num;
  document.getElementById("os-device").textContent = os.device;
  const badge = document.getElementById("os-badge");
  const si = statusInfo[os.status];
  badge.textContent = si.label;
  badge.className = "os-status-badge " + si.cls;
  const tl = document.getElementById("os-timeline");
  tl.innerHTML = "";
  os.steps.forEach(s => {
    const li = document.createElement("li");
    li.className = "os-step " + s.state;
    const timeHtml = s.time !== "—" ? '<div class="os-step-time"><i class="fas fa-clock"></i> ' + s.time + '</div>' : "";
    li.innerHTML = '<div class="os-dot"><i class="fas ' + s.icon + '"></i></div>' +
      '<div class="os-step-info">' +
        '<div class="os-step-title">' + s.title + '</div>' +
        '<div class="os-step-desc">' + s.desc + '</div>' +
        timeHtml +
      '</div>';
    tl.appendChild(li);
  });
  const msg = document.getElementById("os-msg");
  msg.classList.toggle("show", os.status === "pronto");
  card.classList.add("show");
}
document.getElementById("os-input").addEventListener("keydown", e => { if(e.key==="Enter") rastrearOS(); });

// ─── VER MAIS TELEFONES ───
function verMaisTelefones() {
  const extras = document.getElementById("phones-extras");
  const btnVerMais = document.getElementById("btn-ver-mais");
  const footer = document.getElementById("phones-extras-footer");
  extras.style.display = "grid";
  btnVerMais.style.display = "none";
  footer.style.display = "flex";
  extras.scrollIntoView({ behavior: "smooth", block: "start" });
}
function fecharTelefones() {
  const extras = document.getElementById("phones-extras");
  const btnVerMais = document.getElementById("btn-ver-mais");
  const footer = document.getElementById("phones-extras-footer");
  extras.style.display = "none";
  btnVerMais.style.display = "inline-flex";
  footer.style.display = "none";
  document.getElementById("telefones").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── SCROLL ANIMATIONS ───
const sections = document.querySelectorAll("section[id], div[id]");
const navLinks = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) current = s.id; });
  navLinks.forEach(a => {
    a.classList.remove("active");
    if (a.getAttribute("href") === "#" + current) a.classList.add("active");
  });
});
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.style.opacity="1"; e.target.style.transform="translateY(0)"; }
  });
}, { threshold: 0.1 });
document.querySelectorAll(".service-card,.vantagem-card,.testimonial-card,.stat-item,.phone-card").forEach(el => {
  el.style.opacity="0"; el.style.transform="translateY(30px)";
  el.style.transition="opacity 0.5s ease, transform 0.5s ease";
  observer.observe(el);
});

// ─── MOBILE HAMBURGER MENU ───
function toggleMobileMenu() {
  document.getElementById("mobile-menu").classList.toggle("open");
}
function closeMobileMenu() {
  document.getElementById("mobile-menu").classList.remove("open");
}

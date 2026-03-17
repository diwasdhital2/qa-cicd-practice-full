/**
 * ⚠️  INTENTIONALLY VULNERABLE WEB APP — SECURITY TESTING PRACTICE ONLY
 * ⚠️  DO NOT USE IN PRODUCTION
 *
 * Vulnerabilities (silent — UI looks like a real shop):
 *   XSS-1  — Reflected XSS   : /products/<payload>  (raw id in error page)
 *   XSS-2  — Stored XSS      : POST /products/:id/review (raw text rendered)
 *   XSS-3  — DOM XSS         : /welcome#<payload>   (innerHTML from hash)
 *   BAC-1  — IDOR            : /account/orders?userId=N
 *   BAC-2  — Weak Token      : token cookie = base64(username)
 *   BAC-3  — Privilege Esc.  : role field accepted on register / profile
 *   CF-1   — Plaintext Pwds  : /admin shows all passwords
 *   CF-2   — Data Leak       : /health exposes DB config + admin secret
 *   CF-3   — Weak Token      : base64 forgeable
 *   INJ-1  — SQL-style Inj.  : /search?q= reflected unsanitized in query
 *   INJ-2  — HTML Injection  : login error reflects raw username
 */

'use strict';

const http = require('http');
const url  = require('url');
const PORT = 3001;

// ── Sensitive config (CF-1, CF-2) ──────────────────────────────────────────
const ADMIN_SECRET = 'shopAdmin@99';
const DB_CONFIG    = { host:'localhost', port:5432, database:'shopdb', username:'shop_admin', password:'Sh0pS3cr3t!Pass' };

// ── Store ───────────────────────────────────────────────────────────────────
let users=[], products=[], orders=[], reviews=[];
let nextUid=1, nextOid=1, nextRid=1;

function resetStore(){
  users=[
    {id:1,username:'alice', password:'alice123',    email:'alice@shopease.com', role:'user', balance:500},
    {id:2,username:'bob',   password:'bob12345',    email:'bob@shopease.com',   role:'user', balance:200},
    {id:3,username:'carol', password:'carol9999',   email:'carol@shopease.com', role:'user', balance:750},
    {id:4,username:'admin', password:'shopAdmin@99',email:'admin@shopease.com', role:'admin',balance:0  },
  ];
  products=[
    {id:1,name:'Wireless Headphones',price:59.99,category:'Electronics',stock:40,emoji:'🎧',desc:'Premium sound with active noise cancellation and 30-hour battery life.'},
    {id:2,name:'Running Shoes',      price:89.99,category:'Footwear',   stock:25,emoji:'👟',desc:'Lightweight mesh upper with responsive cushioning for daily training.'},
    {id:3,name:'Coffee Maker',       price:39.99,category:'Kitchen',    stock:60,emoji:'☕',desc:'12-cup programmable brewer with keep-warm plate and auto shut-off.'},
    {id:4,name:'Yoga Mat',           price:24.99,category:'Sports',     stock:80,emoji:'🧘',desc:'6mm thick non-slip mat with alignment lines, eco-friendly TPE.'},
    {id:5,name:'Desk Lamp',          price:19.99,category:'Home',       stock:55,emoji:'💡',desc:'LED lamp with 3 colour temperatures and touch-dimmer control.'},
    {id:6,name:'Travel Backpack',    price:49.99,category:'Bags',       stock:35,emoji:'🎒',desc:'30L waterproof backpack with laptop sleeve and hidden pockets.'},
  ];
  orders=[
    {id:1,userId:1,productId:1,quantity:1,total:59.99,status:'delivered',date:'2026-03-10'},
    {id:2,userId:2,productId:3,quantity:2,total:79.98,status:'shipped',  date:'2026-03-14'},
    {id:3,userId:3,productId:2,quantity:1,total:89.99,status:'pending',  date:'2026-03-16'},
  ];
  reviews=[
    {id:1,productId:1,author:'Alice',text:'Absolutely love these headphones — crystal clear sound!',rating:5,date:'2026-03-12'},
    {id:2,productId:1,author:'Bob',  text:'Great value for the price. Would buy again.',            rating:4,date:'2026-03-13'},
  ];
  nextUid=5; nextOid=4; nextRid=3;
}
resetStore();

const sessions={};

// ── Helpers ─────────────────────────────────────────────────────────────────
function parseBody(req){
  return new Promise(res=>{
    let d='';
    req.on('data',c=>d+=c);
    req.on('end',()=>{
      const o={};
      if(!d) return res(o);
      if((req.headers['content-type']||'').includes('application/json')){
        try{return res(JSON.parse(d));}catch{return res(o);}
      }
      d.split('&').forEach(p=>{
        const[k,v]=p.split('=');
        if(k) o[decodeURIComponent(k.replace(/\+/g,' '))]=decodeURIComponent((v||'').replace(/\+/g,' '));
      });
      res(o);
    });
  });
}

function parseCookies(req){
  const o={};
  (req.headers['cookie']||'').split(';').forEach(p=>{
    const[k,v]=p.trim().split('=');
    if(k) o[k.trim()]=(v||'').trim();
  });
  return o;
}

function esc(s){ // HTML escape — used for safe output; intentionally NOT used in vuln spots
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
}

function stars(n){ return '★'.repeat(n)+'☆'.repeat(5-n); }
function tok(u){ return Buffer.from(u).toString('base64'); } // CF-3: weak token

// ── CSS ──────────────────────────────────────────────────────────────────────
const CSS=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Nunito:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --ink:#1c1917;--ink2:#57534e;--ink3:#a8a29e;
  --bg:#fafaf9;--card:#ffffff;--border:#e7e5e4;
  --green:#16a34a;--green-bg:#f0fdf4;--green-bd:#bbf7d0;
  --blue:#2563eb;--blue-bg:#eff6ff;--blue-bd:#bfdbfe;
  --red:#dc2626;--red-bg:#fef2f2;--red-bd:#fecaca;
  --amber:#d97706;--amber-bg:#fffbeb;--amber-bd:#fde68a;
  --accent:#0f766e;--accent-h:#0d9488;
  --r:10px;--shadow:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
  --shadow-lg:0 10px 25px rgba(0,0,0,.08),0 4px 10px rgba(0,0,0,.05);
}
body{background:var(--bg);color:var(--ink);font-family:'Nunito',sans-serif;font-size:15px;line-height:1.65;min-height:100vh}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
img{display:block}

/* ── Header ── */
header{background:#fff;border-bottom:1px solid var(--border);height:62px;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;position:sticky;top:0;z-index:50;box-shadow:var(--shadow)}
.logo{font-family:'Playfair Display',serif;font-size:1.45rem;color:var(--accent);font-weight:600;letter-spacing:-.3px}
.logo em{color:var(--amber);font-style:normal}
nav{display:flex;align-items:center;gap:1.25rem}
nav a{color:var(--ink2);font-size:.875rem;font-weight:600;padding:6px 10px;border-radius:6px;transition:background .15s,color .15s}
nav a:hover{background:#f5f5f4;color:var(--ink);text-decoration:none}
.chip{display:inline-flex;align-items:center;gap:5px;background:var(--green-bg);border:1px solid var(--green-bd);border-radius:20px;padding:3px 10px;font-size:.78rem;color:var(--green);font-weight:700}
.chip.admin{background:var(--red-bg);border-color:var(--red-bd);color:var(--red)}

/* ── Layout ── */
.wrap{max-width:1100px;margin:0 auto;padding:2rem 1.5rem}
.page-head{margin-bottom:2rem}
.page-head h1{font-family:'Playfair Display',serif;font-size:2rem;font-weight:600;margin-bottom:.25rem}
.page-head p{color:var(--ink2);font-size:.9rem}

/* ── Grid ── */
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:1.75rem;align-items:start}
.g-side{display:grid;grid-template-columns:210px 1fr;gap:2rem}
@media(max-width:800px){.g3{grid-template-columns:1fr 1fr}.g2,.g-side{grid-template-columns:1fr}}
@media(max-width:480px){.g3{grid-template-columns:1fr}}

/* ── Card ── */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:1.5rem;box-shadow:var(--shadow)}
.pcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);transition:box-shadow .2s,transform .2s}
.pcard:hover{box-shadow:var(--shadow-lg);transform:translateY(-3px)}
.pcard-img{height:158px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg,#f5f5f4,#e7e5e4)}
.pcard-body{padding:1rem 1.1rem 1.1rem}
.pcat{font-size:.72rem;text-transform:uppercase;letter-spacing:.6px;color:var(--ink3);margin-bottom:.3rem;font-weight:700}
.pname{font-weight:700;font-size:.95rem;margin-bottom:.3rem;color:var(--ink)}
.pdesc{color:var(--ink2);font-size:.8rem;line-height:1.5;margin-bottom:.75rem}
.pprice{font-family:'Playfair Display',serif;font-size:1.25rem;color:var(--accent)}

/* ── Forms ── */
.field{margin-bottom:1rem}
.field label{display:block;font-size:.8rem;font-weight:700;color:var(--ink2);margin-bottom:5px;text-transform:uppercase;letter-spacing:.4px}
input,textarea,select{width:100%;background:#fafaf9;border:1.5px solid var(--border);border-radius:7px;color:var(--ink);font-family:'Nunito',sans-serif;font-size:.9rem;padding:.55rem .85rem;outline:none;transition:border-color .2s,box-shadow .2s}
input:focus,textarea:focus,select:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(15,118,110,.1)}
textarea{resize:vertical;min-height:95px}

/* ── Buttons ── */
.btn{display:inline-block;background:var(--accent);border:none;border-radius:7px;color:#fff;cursor:pointer;font-family:'Nunito',sans-serif;font-size:.875rem;font-weight:700;padding:.55rem 1.3rem;transition:background .15s,transform .1s;letter-spacing:.1px}
.btn:hover{background:var(--accent-h);text-decoration:none;color:#fff}
.btn:active{transform:scale(.98)}
.btn-sm{padding:.3rem .8rem;font-size:.8rem;border-radius:6px}
.btn-ghost{background:transparent;border:1.5px solid var(--border);color:var(--ink2)}
.btn-ghost:hover{background:#f5f5f4;color:var(--ink)}
.btn-danger{background:var(--red)}
.btn-danger:hover{background:#b91c1c}
.btn-outline{background:transparent;border:1.5px solid var(--accent);color:var(--accent)}
.btn-outline:hover{background:var(--green-bg)}
.btn-white{background:#fff;color:var(--accent);border:none}
.btn-white:hover{background:#f0fdf4}

/* ── Alerts ── */
.alert{border-radius:8px;padding:.7rem 1rem;margin-bottom:1rem;font-size:.875rem;border:1px solid}
.alert-ok  {background:var(--green-bg);border-color:var(--green-bd);color:#15803d}
.alert-err {background:var(--red-bg);  border-color:var(--red-bd);  color:#991b1b}
.alert-info{background:var(--blue-bg); border-color:var(--blue-bd); color:#1d4ed8}

/* ── Table ── */
table{width:100%;border-collapse:collapse;font-size:.875rem}
th{background:#f5f5f4;padding:.55rem .9rem;text-align:left;font-size:.74rem;text-transform:uppercase;letter-spacing:.5px;color:var(--ink2);border-bottom:2px solid var(--border);font-weight:700}
td{padding:.65rem .9rem;border-bottom:1px solid var(--border);color:var(--ink)}
tr:last-child td{border-bottom:none}
tr:hover td{background:#fafaf9}

/* ── Badge ── */
.badge{display:inline-block;padding:2px 9px;border-radius:20px;font-size:.72rem;font-weight:700;letter-spacing:.2px}
.b-green {background:var(--green-bg);color:#15803d;border:1px solid var(--green-bd)}
.b-blue  {background:var(--blue-bg); color:#1d4ed8;border:1px solid var(--blue-bd)}
.b-amber {background:var(--amber-bg);color:#92400e;border:1px solid var(--amber-bd)}
.b-red   {background:var(--red-bg);  color:#991b1b;border:1px solid var(--red-bd)}

/* ── Sidebar nav ── */
.snav{display:flex;flex-direction:column;gap:3px}
.snav-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--ink3);padding:.4rem .75rem;margin-bottom:.25rem}
.snav a{display:block;padding:.5rem .75rem;border-radius:7px;color:var(--ink2);font-size:.875rem;font-weight:500;transition:background .15s,color .15s}
.snav a:hover{background:#f5f5f4;color:var(--ink);text-decoration:none}
.snav a.on{background:var(--green-bg);color:var(--green);font-weight:700}

/* ── Hero ── */
.hero{background:linear-gradient(130deg,var(--accent) 0%,#134e4a 100%);border-radius:14px;padding:3.5rem 2.5rem;color:#fff;margin-bottom:2.5rem;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;right:-60px;top:-60px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.05)}
.hero::after{content:'';position:absolute;left:40%;bottom:-80px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.04)}
.hero h1{font-family:'Playfair Display',serif;font-size:2.5rem;margin-bottom:.5rem;line-height:1.2;position:relative}
.hero p{font-size:1rem;opacity:.85;margin-bottom:1.75rem;max-width:480px;position:relative}

/* ── Review ── */
.rev{padding:.9rem 0;border-bottom:1px solid var(--border)}
.rev:last-child{border-bottom:none}
.rev-top{display:flex;align-items:center;gap:.6rem;margin-bottom:.3rem}
.rev-author{font-weight:700;font-size:.875rem}
.rev-stars{color:var(--amber);font-size:.875rem}
.rev-date{color:var(--ink3);font-size:.76rem;margin-left:auto}
.rev-text{color:var(--ink2);font-size:.875rem}

/* ── Search bar ── */
.sbar{display:flex;gap:.5rem;margin-bottom:1.5rem}
.sbar input{margin-bottom:0}

/* ── Divider ── */
hr.div{border:none;border-top:1px solid var(--border);margin:1.75rem 0}

/* ── Misc ── */
.sec-title{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:600;margin-bottom:1rem}
.row{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem}
.muted{color:var(--ink2)}
.small{font-size:.8rem}
.mono{font-family:monospace}
code{background:#f5f5f4;padding:1px 5px;border-radius:4px;font-size:.82rem;font-family:monospace;color:var(--accent)}
footer{background:#fff;border-top:1px solid var(--border);padding:1.25rem 2rem;text-align:center;color:var(--ink3);font-size:.78rem;margin-top:5rem}

/* ── Qty input ── */
.qty-row{display:flex;gap:.75rem;align-items:center;margin-top:1.5rem}
.qty-row input{width:72px;text-align:center}

/* ── Password field style ── */
.pw-exposed{font-family:monospace;color:var(--red);font-size:.875rem}
</style>`;

// ── Layout ───────────────────────────────────────────────────────────────────
function layout(title,body,u){
  const nav=u
    ?`<div class="chip ${u.role==='admin'?'admin':''}">👤 ${esc(u.username)}</div>
       <a href="/account/orders">Orders</a>
       <a href="/account/profile">Profile</a>
       ${u.role==='admin'?'<a href="/admin">Admin</a>':''}
       <a href="/logout">Sign out</a>`
    :`<a href="/login">Sign in</a><a href="/register" class="btn btn-sm">Register</a>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)} — ShopEase</title>
  ${CSS}
</head>
<body>
<header>
  <a href="/" class="logo">Shop<em>Ease</em></a>
  <nav>
    <a href="/products">Shop</a>
    <a href="/search">Search</a>
    ${nav}
  </nav>
</header>
<div class="wrap">${body}</div>
<footer>© 2026 ShopEase &nbsp;·&nbsp; All rights reserved &nbsp;·&nbsp; Node ${process.version}</footer>
</body></html>`;
}

// ── Pages ────────────────────────────────────────────────────────────────────

function pgHome(u){
  const cards=products.slice(0,3).map(p=>`
    <div class="pcard">
      <div class="pcard-img">${p.emoji}</div>
      <div class="pcard-body">
        <div class="pcat">${esc(p.category)}</div>
        <div class="pname">${esc(p.name)}</div>
        <div class="pdesc">${esc(p.desc)}</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="pprice">$${p.price.toFixed(2)}</span>
          <a href="/products/${p.id}" class="btn btn-sm">View</a>
        </div>
      </div>
    </div>`).join('');
  return layout('Home',`
    <div class="hero">
      <h1>Quality goods,<br>delivered fast.</h1>
      <p>Discover our curated collection of everyday essentials — from electronics to outdoor gear.</p>
      <a href="/products" class="btn btn-white">Browse all products →</a>
    </div>
    <div class="row"><span class="sec-title">Featured Products</span><a href="/products" class="btn btn-outline btn-sm">View all</a></div>
    <div class="g3">${cards}</div>
  `,u);
}

function pgProducts(u,cat){
  const cats=[...new Set(products.map(p=>p.category))];
  const list=cat?products.filter(p=>p.category.toLowerCase()===cat.toLowerCase()):products;
  const catNav=cats.map(c=>`<a href="/products?category=${encodeURIComponent(c)}" class="${cat===c?'on':''}">${c}</a>`).join('');
  const cards=list.map(p=>`
    <div class="pcard">
      <div class="pcard-img">${p.emoji}</div>
      <div class="pcard-body">
        <div class="pcat">${esc(p.category)}</div>
        <div class="pname">${esc(p.name)}</div>
        <div class="pdesc">${esc(p.desc)}</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="pprice">$${p.price.toFixed(2)}</span>
          <a href="/products/${p.id}" class="btn btn-sm">View</a>
        </div>
      </div>
    </div>`).join('');
  return layout('Products',`
    <div class="g-side">
      <div>
        <div class="snav">
          <div class="snav-title">Categories</div>
          <a href="/products" class="${!cat?'on':''}">All Products</a>
          ${catNav}
        </div>
      </div>
      <div>
        <div class="row">
          <span class="sec-title">${cat||'All Products'} <span class="muted small">(${list.length})</span></span>
        </div>
        <div class="g3">${cards||'<p class="muted">No products found.</p>'}</div>
      </div>
    </div>`,u);
}

function pgProductDetail(u,pid,msg,err){
  const p=products.find(x=>x.id===Number(pid));
  if(!p){
    // 🔴 XSS-1: pid injected raw — no escaping
    return layout('Not found',`
      <div class="alert alert-err">We couldn't find a product matching <strong>${pid}</strong>.</div>
      <a href="/products" class="btn btn-ghost btn-sm" style="margin-top:.5rem">← Back to shop</a>
    `,u);
  }
  const revs=reviews.filter(r=>r.productId===p.id);
  const revHtml=revs.length?revs.map(r=>`
    <div class="rev">
      <div class="rev-top">
        <span class="rev-author">${esc(r.author)}</span>
        <span class="rev-stars">${stars(r.rating)}</span>
        <span class="rev-date">${r.date}</span>
      </div>
      <!-- 🔴 XSS-2: r.text rendered as raw HTML (stored XSS) -->
      <div class="rev-text">${r.text}</div>
    </div>`).join('')
    :`<p class="muted" style="padding:.75rem 0">No reviews yet — be the first!</p>`;

  const form=u?`
    <div class="card" style="margin-top:1.5rem">
      <div class="sec-title" style="font-size:1rem;margin-bottom:1rem">Write a Review</div>
      ${err?`<div class="alert alert-err">${esc(err)}</div>`:''}
      <form method="POST" action="/products/${p.id}/review">
        <div class="field">
          <label>Rating</label>
          <select name="rating">
            <option value="5">★★★★★  Excellent</option>
            <option value="4">★★★★☆  Good</option>
            <option value="3">★★★☆☆  Average</option>
            <option value="2">★★☆☆☆  Below average</option>
            <option value="1">★☆☆☆☆  Poor</option>
          </select>
        </div>
        <div class="field">
          <label>Your review</label>
          <textarea name="text" placeholder="Share your experience with this product…"></textarea>
        </div>
        <button type="submit" class="btn">Post review</button>
      </form>
    </div>`:
    `<div class="alert alert-info" style="margin-top:1rem"><a href="/login">Sign in</a> to leave a review.</div>`;

  return layout(p.name,`
    <div style="margin-bottom:1rem"><a href="/products" class="small muted">← Back to shop</a></div>
    ${msg?`<div class="alert alert-ok">${esc(msg)}</div>`:''}
    <div class="g2">
      <div style="background:linear-gradient(135deg,#f5f5f4,#e7e5e4);border-radius:12px;height:300px;display:flex;align-items:center;justify-content:center;font-size:6rem">${p.emoji}</div>
      <div>
        <div class="pcat" style="margin-bottom:.5rem">${esc(p.category)}</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:600;margin-bottom:.75rem">${esc(p.name)}</h1>
        <p class="muted" style="margin-bottom:1.25rem">${esc(p.desc)}</p>
        <div style="font-family:'Playfair Display',serif;font-size:2.1rem;color:var(--accent);margin-bottom:.5rem">$${p.price.toFixed(2)}</div>
        <p class="small muted" style="margin-bottom:1.5rem">${p.stock} units in stock</p>
        ${u?`
          <form method="POST" action="/orders">
            <input type="hidden" name="productId" value="${p.id}">
            <div class="qty-row">
              <div class="field" style="margin:0"><label class="small">Qty</label><input type="number" name="quantity" value="1" min="1" max="${p.stock}" style="width:72px;text-align:center"></div>
              <button type="submit" class="btn" style="margin-top:1.3rem">Add to order</button>
            </div>
          </form>`
          :`<div class="alert alert-info"><a href="/login">Sign in</a> to place an order.</div>`}
      </div>
    </div>
    <hr class="div">
    <div class="sec-title">Customer Reviews</div>
    <div class="card">${revHtml}</div>
    ${form}`,u);
}

function pgSearch(u,q){
  let res='';
  if(q!==null&&q!==undefined){
    const lq=q.toLowerCase();
    const found=products.filter(p=>p.name.toLowerCase().includes(lq)||p.category.toLowerCase().includes(lq)||p.desc.toLowerCase().includes(lq));
    // 🔴 INJ-1: q injected raw into "SQL" display and result count line
    res=`
      <p class="small muted" style="margin-bottom:1rem">
        ${found.length} result${found.length!==1?'s':''} for <strong>${q}</strong>
      </p>
      ${found.length
        ?`<div class="g3">${found.map(p=>`
            <div class="pcard">
              <div class="pcard-img">${p.emoji}</div>
              <div class="pcard-body">
                <div class="pcat">${esc(p.category)}</div>
                <div class="pname">${esc(p.name)}</div>
                <div class="pprice">$${p.price.toFixed(2)}</div>
                <a href="/products/${p.id}" class="btn btn-sm" style="margin-top:.6rem;display:inline-block">View</a>
              </div>
            </div>`).join('')}</div>`
        :`<div class="alert alert-info">No products matched your search. Try a different keyword.</div>`}`;
  }
  return layout('Search',`
    <div class="page-head"><h1>Search</h1><p>Find products by name, category or description.</p></div>
    <form method="GET" action="/search" class="sbar">
      <input type="text" name="q" value="${q?esc(q):''}" placeholder="e.g. headphones, running shoes…" style="max-width:480px">
      <button type="submit" class="btn">Search</button>
    </form>
    ${res}`,u);
}

function pgLogin(u,err){
  // 🔴 INJ-2: err contains raw username, not escaped
  return layout('Sign in',`
    <div style="max-width:420px;margin:3rem auto">
      <div class="page-head"><h1>Welcome back</h1><p>Sign in to your ShopEase account.</p></div>
      <div class="card">
        ${err?`<div class="alert alert-err">${err}</div>`:''}
        <form method="POST" action="/login">
          <div class="field"><label>Username</label><input type="text" name="username" placeholder="Your username" autocomplete="username"></div>
          <div class="field"><label>Password</label><input type="password" name="password" placeholder="Your password" autocomplete="current-password"></div>
          <button type="submit" class="btn" style="width:100%">Sign in</button>
        </form>
        <p class="small muted" style="text-align:center;margin-top:1rem">No account? <a href="/register">Register free</a></p>
      </div>
    </div>`,u);
}

function pgRegister(u,err){
  return layout('Register',`
    <div style="max-width:420px;margin:3rem auto">
      <div class="page-head"><h1>Create account</h1><p>Join ShopEase — it's free.</p></div>
      <div class="card">
        ${err?`<div class="alert alert-err">${esc(err)}</div>`:''}
        <form method="POST" action="/register">
          <div class="field"><label>Username</label><input type="text" name="username" placeholder="Choose a username"></div>
          <div class="field"><label>Email</label><input type="email" name="email" placeholder="you@example.com"></div>
          <div class="field"><label>Password</label><input type="password" name="password" placeholder="Choose a password"></div>
          <!-- 🔴 BAC-3: role field accepted from user — privilege escalation -->
          <input type="hidden" name="role" value="user">
          <button type="submit" class="btn" style="width:100%">Create account</button>
        </form>
        <p class="small muted" style="text-align:center;margin-top:1rem">Already registered? <a href="/login">Sign in</a></p>
      </div>
    </div>`,u);
}

function pgOrders(u,viewUid,msg){
  // 🔴 BAC-1 IDOR: viewUid from URL param, no ownership check
  const tid=viewUid?Number(viewUid):u.id;
  const tuser=users.find(x=>x.id===tid);
  const list=orders.filter(o=>o.userId===tid);
  const rows=list.map(o=>{
    const p=products.find(x=>x.id===o.productId);
    return `<tr>
      <td>#${o.id}</td>
      <td>${p?esc(p.name):'—'}</td>
      <td>${o.quantity}</td>
      <td>$${o.total.toFixed(2)}</td>
      <td><span class="badge ${o.status==='delivered'?'b-green':o.status==='shipped'?'b-blue':'b-amber'}">${o.status}</span></td>
      <td><a href="/orders/${o.id}" class="btn btn-ghost btn-sm">Details</a></td>
    </tr>`;
  }).join('');
  return layout('My Orders',`
    <div class="row page-head" style="margin-bottom:1.5rem">
      <div><h1>My Orders</h1><p>${tid!==u.id&&tuser?`Viewing orders for <strong>${esc(tuser.username)}</strong>`:'Your order history'}</p></div>
    </div>
    ${msg?`<div class="alert alert-ok">${esc(msg)}</div>`:''}
    <div class="card">
      ${rows?`<table><thead><tr><th>Order</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
            :`<p class="muted" style="padding:.5rem 0">You haven't placed any orders yet.</p>`}
    </div>`,u);
}

function pgOrderDetail(u,oid){
  // 🔴 BAC-1: no ownership check
  const o=orders.find(x=>x.id===Number(oid));
  if(!o) return layout('Not found',`<div class="alert alert-err">Order not found.</div><a href="/account/orders" class="btn btn-ghost btn-sm" style="margin-top:.5rem">← My orders</a>`,u);
  const p=products.find(x=>x.id===o.productId);
  return layout(`Order #${o.id}`,`
    <div style="margin-bottom:1rem"><a href="/account/orders" class="small muted">← My orders</a></div>
    <div class="page-head"><h1>Order #${o.id}</h1></div>
    <div style="max-width:460px">
      <div class="card">
        <table>
          <tr><td><strong>Product</strong></td><td>${p?esc(p.name):'Unknown'}</td></tr>
          <tr><td><strong>Quantity</strong></td><td>${o.quantity}</td></tr>
          <tr><td><strong>Total</strong></td><td>$${o.total.toFixed(2)}</td></tr>
          <tr><td><strong>Status</strong></td><td><span class="badge ${o.status==='delivered'?'b-green':o.status==='shipped'?'b-blue':'b-amber'}">${o.status}</span></td></tr>
          <tr><td><strong>Date</strong></td><td>${o.date}</td></tr>
        </table>
      </div>
    </div>`,u);
}

function pgProfile(u,msg){
  return layout('Profile',`
    <div class="page-head"><h1>My Profile</h1><p>Manage your account information.</p></div>
    ${msg?`<div class="alert alert-ok">${esc(msg)}</div>`:''}
    <div style="max-width:500px">
      <div class="card">
        <form method="POST" action="/account/profile">
          <div class="field"><label>Username</label><input type="text" name="username" value="${esc(u.username)}"></div>
          <div class="field"><label>Email</label><input type="email" name="email" value="${esc(u.email)}"></div>
          <div class="field"><label>New password</label><input type="password" name="password" placeholder="Leave blank to keep current"></div>
          <!-- 🔴 BAC-3: role field editable — change to admin to escalate -->
          <div class="field"><label>Role</label><input type="text" name="role" value="${esc(u.role)}"></div>
          <button type="submit" class="btn">Save changes</button>
        </form>
      </div>
    </div>`,u);
}

function pgAdmin(u){
  // 🔴 BAC-2: bypassable via forged base64 token cookie
  if(!u||u.role!=='admin'){
    return layout('Admin',`
      <div class="alert alert-err" style="max-width:480px">You do not have permission to view this page.</div>
      <a href="/" class="btn btn-ghost btn-sm" style="margin-top:1rem">← Home</a>`,u);
  }
  // 🔴 CF-1: plaintext passwords exposed
  const urows=users.map(x=>`<tr>
    <td>${x.id}</td><td>${esc(x.username)}</td><td>${esc(x.email)}</td>
    <td class="pw-exposed">${esc(x.password)}</td>
    <td><span class="badge ${x.role==='admin'?'b-red':'b-green'}">${x.role}</span></td>
    <td>$${x.balance}</td></tr>`).join('');
  const orows=orders.map(o=>{
    const p=products.find(x=>x.id===o.productId);
    const ou=users.find(x=>x.id===o.userId);
    return `<tr><td>#${o.id}</td><td>${ou?esc(ou.username):o.userId}</td><td>${p?esc(p.name):'—'}</td><td>$${o.total.toFixed(2)}</td><td><span class="badge ${o.status==='delivered'?'b-green':o.status==='shipped'?'b-blue':'b-amber'}">${o.status}</span></td></tr>`;
  }).join('');
  return layout('Admin',`
    <div class="page-head"><h1>Admin Panel</h1><p>Full system overview.</p></div>
    <div class="sec-title" style="margin-bottom:.75rem">Users</div>
    <div class="card" style="margin-bottom:1.75rem;overflow-x:auto">
      <table><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Password</th><th>Role</th><th>Balance</th></tr></thead><tbody>${urows}</tbody></table>
    </div>
    <div class="sec-title" style="margin-bottom:.75rem">Orders</div>
    <div class="card" style="overflow-x:auto">
      <table><thead><tr><th>ID</th><th>User</th><th>Product</th><th>Total</th><th>Status</th></tr></thead><tbody>${orows}</tbody></table>
    </div>`,u);
}

function pgWelcome(u){
  // 🔴 XSS-3: DOM XSS via innerHTML + location.hash
  return layout('Welcome',`
    <div style="max-width:520px;margin:3rem auto">
      <div class="card">
        <div id="msg" class="alert alert-info">Loading…</div>
      </div>
    </div>
    <script>
      const h=decodeURIComponent(window.location.hash.substring(1));
      // 🔴 XSS-3: innerHTML with user-controlled hash — no sanitization
      document.getElementById('msg').innerHTML = h
        ? '👋 Welcome back, <strong>'+h+'</strong>! Good to see you.'
        : 'Add your name to the URL: <code>/welcome#YourName</code>';
    </script>`,u);
}

// ── Server ────────────────────────────────────────────────────────────────────
const server=http.createServer(async(req,res)=>{
  const parsed=url.parse(req.url,true);
  const path=parsed.pathname.replace(/\/+$/,'')||'/';
  const cookies=parseCookies(req);
  const sid=cookies['session'];
  let me=sid&&sessions[sid]?users.find(u=>u.id===sessions[sid])||null:null;

  // 🔴 BAC-2: forged base64 token cookie
  if(!me&&cookies['token']){
    try{const d=Buffer.from(cookies['token'],'base64').toString('utf8');me=users.find(u=>u.username===d)||null;}catch{}
  }

  function html(body,code=200){
    // 🔴 No CSP / X-Frame-Options / X-Content-Type-Options headers
    res.writeHead(code,{'Content-Type':'text/html;charset=utf-8'});
    res.end(body);
  }
  function redir(to){res.writeHead(302,{Location:to});res.end();}

  if(req.method==='GET'&&path==='/') return html(pgHome(me));
  if(req.method==='GET'&&path==='/products') return html(pgProducts(me,parsed.query.category||null));
  if(req.method==='GET'&&path.match(/^\/products\/[^/]+$/)) return html(pgProductDetail(me,path.split('/')[2],parsed.query.msg,parsed.query.err));

  if(req.method==='POST'&&path.match(/^\/products\/(\d+)\/review$/)){
    if(!me) return redir('/login');
    const pid=Number(path.split('/')[2]);
    const b=await parseBody(req);
    if(!(b.text||'').trim()) return redir(`/products/${pid}?err=Review+text+is+required`);
    // 🔴 XSS-2: raw text stored
    reviews.push({id:nextRid++,productId:pid,author:me.username,text:b.text,rating:Math.min(5,Math.max(1,Number(b.rating)||5)),date:new Date().toISOString().split('T')[0]});
    return redir(`/products/${pid}?msg=Review+posted!`);
  }

  if(req.method==='GET'&&path==='/search') return html(pgSearch(me,parsed.query.q!==undefined?parsed.query.q:null));
  if(req.method==='GET'&&path==='/welcome') return html(pgWelcome(me));
  if(req.method==='GET'&&path==='/login') return html(pgLogin(me,null));

  if(req.method==='POST'&&path==='/login'){
    const b=await parseBody(req);
    const found=users.find(u=>u.username===b.username);
    // 🔴 INJ-2: raw username in error, not escaped
    if(!found) return html(pgLogin(null,`No account found for: ${b.username}`));
    // 🔴 CF-1: plaintext comparison
    if(found.password!==b.password) return html(pgLogin(null,`Incorrect password for: ${esc(b.username)}`));
    const ns=Math.random().toString(36).slice(2)+Date.now().toString(36);
    sessions[ns]=found.id;
    // 🔴 CF-3: weak token cookie, no HttpOnly, no Secure
    res.writeHead(302,{'Set-Cookie':[`session=${ns};Path=/`,`token=${tok(found.username)};Path=/`],Location:'/'});
    return res.end();
  }

  if(req.method==='GET'&&path==='/register') return html(pgRegister(me,null));

  if(req.method==='POST'&&path==='/register'){
    const b=await parseBody(req);
    if(!b.username||!b.password) return html(pgRegister(null,'Username and password are required'));
    if(users.find(u=>u.username===b.username)) return html(pgRegister(null,'That username is already taken'));
    // 🔴 BAC-3: role accepted from body
    users.push({id:nextUid++,username:b.username,email:b.email||'',password:b.password,role:b.role||'user',balance:100});
    return redir('/login');
  }

  if(req.method==='POST'&&path==='/orders'){
    if(!me) return redir('/login');
    const b=await parseBody(req);
    const pid=Number(b.productId),qty=Number(b.quantity)||1;
    const p=products.find(x=>x.id===pid);
    if(!p) return redir('/products');
    if(p.stock<qty) return redir(`/products/${pid}?err=Not+enough+stock`);
    p.stock-=qty;
    orders.push({id:nextOid++,userId:me.id,productId:pid,quantity:qty,total:parseFloat((p.price*qty).toFixed(2)),status:'pending',date:new Date().toISOString().split('T')[0]});
    return redir('/account/orders?msg=Order+placed+successfully!');
  }

  if(req.method==='GET'&&path==='/account/orders'){
    if(!me) return redir('/login');
    // 🔴 BAC-1: userId from URL
    return html(pgOrders(me,parsed.query.userId,parsed.query.msg));
  }

  if(req.method==='GET'&&path.match(/^\/orders\/\d+$/)){
    if(!me) return redir('/login');
    return html(pgOrderDetail(me,path.split('/')[2]));
  }

  if(req.method==='GET'&&path==='/account/profile'){if(!me) return redir('/login');return html(pgProfile(me,parsed.query.msg));}

  if(req.method==='POST'&&path==='/account/profile'){
    if(!me) return redir('/login');
    const b=await parseBody(req);
    const i=users.findIndex(u=>u.id===me.id);
    if(i!==-1){
      if(b.username) users[i].username=b.username;
      if(b.email)    users[i].email=b.email;
      if(b.password) users[i].password=b.password;
      // 🔴 BAC-3: role from form
      if(b.role)     users[i].role=b.role;
    }
    return redir('/account/profile?msg=Changes+saved!');
  }

  if(req.method==='GET'&&path==='/admin') return html(pgAdmin(me));

  // 🔴 CF-2: exposes DB credentials + admin secret
  if(req.method==='GET'&&path==='/health'){
    res.writeHead(200,{'Content-Type':'application/json'});
    return res.end(JSON.stringify({status:'ok',version:'1.0.0',nodeVersion:process.version,environment:'production',uptime:process.uptime(),database:DB_CONFIG,adminSecret:ADMIN_SECRET},null,2));
  }

  if(req.method==='GET'&&path==='/logout'){
    if(sid) delete sessions[sid];
    res.writeHead(302,{'Set-Cookie':['session=;Path=/;Max-Age=0','token=;Path=/;Max-Age=0'],Location:'/'});
    return res.end();
  }

  if(req.method==='POST'&&path==='/test/reset'){
    resetStore();
    res.writeHead(200,{'Content-Type':'application/json'});
    return res.end(JSON.stringify({success:true}));
  }

  html(layout('Not found',`
    <div class="alert alert-err" style="max-width:480px">Page not found: <strong>${esc(path)}</strong></div>
    <a href="/" class="btn btn-ghost btn-sm" style="margin-top:1rem">← Home</a>`,me),404);
});

server.listen(PORT,()=>{
  console.log('');
  console.log('  ⚠️  VULNERABLE WEB APP — FOR SECURITY TESTING ONLY');
  console.log('');
  console.log(`  🚀  http://localhost:${PORT}`);
  console.log('');
  console.log('  Accounts:  alice/alice123  ·  bob/bob12345  ·  admin/shopAdmin@99');
  console.log('');
  console.log('  Vulnerabilities:');
  console.log(`  XSS-1 Reflected  →  /products/<script>alert(1)</script>`);
  console.log(`  XSS-2 Stored     →  /products/1  post review with <img src=x onerror=alert(1)>`);
  console.log(`  XSS-3 DOM        →  /welcome#<svg onload=alert(1)>`);
  console.log(`  BAC-1 IDOR       →  /account/orders?userId=1`);
  console.log(`  BAC-2 FakeToken  →  set cookie token=${Buffer.from('admin').toString('base64')}`);
  console.log(`  BAC-3 PrivEsc    →  POST /register with role=admin in body`);
  console.log(`  CF-1  Plaintext  →  /admin (login as admin first)`);
  console.log(`  CF-2  DataLeak   →  /health`);
  console.log(`  CF-3  WeakToken  →  token cookie = btoa(username)`);
  console.log(`  INJ-1 SQLi-style →  /search?q=' OR '1'='1`);
  console.log(`  INJ-2 HTMLInj    →  login, username field: <b>test</b>`);
  console.log('');
  console.log(`  ZAP target: http://localhost:${PORT}`);
  console.log('');
});
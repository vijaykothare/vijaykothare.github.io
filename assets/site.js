(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MODE = window.__MODE || "static";
const PROTOS = window.__PROTOS || {};
const EMAIL = "vijaykothare@gmail.com";

/* ---------- global chrome ---------- */
const menu = $("#menu");
const setMenu = o => { if (!menu) return; menu.classList.toggle("open", o); $("#menuBtn")?.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; };
$("#menuBtn")?.addEventListener("click", () => setMenu(true));
$("#menuClose")?.addEventListener("click", () => setMenu(false));
menu?.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
addEventListener("keydown", e => { if (e.key === "Escape") { setMenu(false); closeLb(); } });
const tick = () => $$(".js-clock").forEach(c => { try { c.textContent = new Date().toLocaleTimeString("en-IN", {timeZone:"Asia/Kolkata", hour:"2-digit", minute:"2-digit", hour12:false}) + " IST"; } catch(e){} });
tick(); setInterval(tick, 20000);

let lb = null;
function openLb(src, alt){ closeLb(); lb = document.createElement("div"); lb.className = "lightbox"; lb.setAttribute("role","dialog"); lb.setAttribute("aria-label","Image preview"); lb.innerHTML = `<img src="${src}" alt="${alt||""}">`; lb.onclick = closeLb; document.body.appendChild(lb); }
function closeLb(){ if (lb) { lb.remove(); lb = null; } }
document.addEventListener("click", e => { const im = e.target.closest(".gal img"); if (im) openLb(im.currentSrc || im.src, im.alt); });

/* ---------- scroll effects ---------- */
const prog = $("#progress"), hdr = $("#hdr"), badge = $("#badgeSvg");
let active = document;
function onScroll(){
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  if (prog) prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  if (badge) badge.style.transform = `rotate(${y * .15}deg)`;
  let dark = false; $$(".dark, footer").forEach(s => { if (s.offsetParent === null && s.tagName !== "FOOTER") return; const r = s.getBoundingClientRect(); if (r.top < 40 && r.bottom > 40) dark = true; });
  hdr?.classList.toggle("on-dark", dark);
  const man = $(".manifesto", active);
  if (man && man.offsetParent !== null) {
    const words = $$(".w", man), m = man.getBoundingClientRect();
    const pr = reduce ? 1 : Math.min(1, Math.max(0, (-m.top + innerHeight * .15) / (m.height - innerHeight)));
    const n = Math.round(pr * words.length);
    words.forEach((w, i) => { w.classList.toggle("on", i < n); w.classList.toggle("hot", i === n - 1 || (w.classList.contains("k") && i < n)); const st = $(".stk", w); if (st) st.classList.toggle("on", i < n); });
  }
  const poly = $(".js-poly", active); if (poly) { const t = poly.getBoundingClientRect(); poly.style.setProperty("--r", `${(t.top / innerHeight) * -40}deg`); }
  const st = $(".js-steps", active), pl = $(".js-pline", active);
  if (st && pl) { const pp = st.getBoundingClientRect(); pl.style.setProperty("--p", Math.min(1, Math.max(0, (innerHeight - pp.top) / (pp.height + innerHeight * .6)))); }
  if (spy) spy();
}
addEventListener("scroll", onScroll, {passive:true});

/* ---------- per-page init ---------- */
const inited = new WeakSet();
function initView(v){
  active = v;
  if (inited.has(v)) { onScroll(); return; }
  inited.add(v);
  // manifesto words
  const mani = $(".js-mani", v);
  if (mani) {
    const stickers = {"listening.":"Human first","detail,":"Pixel picky","template.":"Allergic to templates"};
    mani.innerHTML = mani.textContent.trim().split(/\s+/).map(w => `<span class="w${/listening|detail|template/.test(w) ? " k" : ""}">${w}</span>`).join(" ");
    $$(".w", mani).forEach(w => { const s = stickers[w.textContent]; if (s) { w.style.position = "relative"; w.insertAdjacentHTML("beforeend", `<span class="chip stk" aria-hidden="true" style="left:50%;top:-.9em;translate:-50% 0">${s}</span>`); } });
  }
  // hero slot
  const slot = $(".js-slot", v);
  if (slot && !reduce) { let i = 0; setInterval(() => { const im = $$("img", slot); if (!im.length) return; im[i].classList.remove("on"); i = (i + 1) % im.length; im[i].classList.add("on"); }, 1900); }
  // filters
  const fl = $(".js-filters", v);
  if (fl) fl.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("button", fl).forEach(x => x.setAttribute("aria-pressed", x === b)); const k = b.dataset.k; $$(".pcard", v).forEach(c => c.hidden = !(k === "all" || c.dataset.tag === k)); });
  // prototype
  const dev = $(".js-device", v); if (dev && PROTOS[dev.dataset.proto]) mountProto(v, PROTOS[dev.dataset.proto]);
  // form
  const form = $(".js-form", v); if (form) initForm(form, v);
  setupReveal(v);
  onScroll();
}

let spy = null;
function setSpy(v){
  const blks = $$(".blk, .proto", v), toc = $$(".toc a", v);
  spy = toc.length ? () => { let cur = blks[0]?.id; blks.forEach(b => { if (b.getBoundingClientRect().top < innerHeight * .35) cur = b.id; }); toc.forEach(a => a.classList.toggle("on", a.dataset.s === cur)); } : null;
}
document.addEventListener("click", e => { const a = e.target.closest("[data-s]"); if (a) { e.preventDefault(); document.getElementById(a.dataset.s)?.scrollIntoView({behavior: reduce ? "auto" : "smooth"}); } });

function setupReveal(root){
  if (reduce || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } }), {rootMargin:"0px 0px -8% 0px"});
  requestAnimationFrame(() => $$(".sec-head, .svc-row, .step, .stat, .pcard, .blk, .dec, .val, .tl-row, .names span", root).forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("rv", "pre"); io.observe(el); } }));
}

/* ---------- prototype player ---------- */
function mountProto(v, P0){
  const dev = $(".js-device", v), trail = $(".js-trail", v), stat = $(".js-pstat", v);
  let cur = P0.start, step = 0, hist = [];
  const order = P0.order;
  dev.className = "device js-device " + P0.kind;
  dev.innerHTML = `${P0.kind === "desk" ? `<div class="bar"><i></i><i></i><i></i><span>${P0.url || ""}</span></div>` : ""}<div class="screen" style="aspect-ratio:${P0.W}/${P0.H}"><div class="layer"></div><div class="scroll-ctl"><button type="button" class="up" aria-label="Scroll up">↑</button><button type="button" class="dn" aria-label="Scroll down">↓</button></div></div>`;
  const scr = $(".screen", dev), lay = $(".layer", dev), sctl = $(".scroll-ctl", dev);
  trail.innerHTML = order.map((id, i) => `<button type="button" data-id="${id}" aria-label="Go to screen ${i + 1}"><img src="${P0.nodes[id].sprite}" alt="" loading="lazy"></button>`).join("");
  trail.onclick = e => { const b = e.target.closest("button"); if (b) go(b.dataset.id, true); };
  function render(fade){
    const nd = P0.nodes[cur], pct = 100 / nd.steps;
    lay.innerHTML = `<div class="sprite${fade ? " fade" : ""}" style="height:${nd.steps * 100}%;transform:translateY(-${step * pct}%)"><img src="${nd.sprite}" alt="Prototype screen" style="width:100%;height:100%;display:block" draggable="false">${nd.hot.map((h, i) => `<button type="button" class="hs" data-i="${i}" aria-label="Go to next screen" style="left:${h.r[0] / P0.W * 100}%;width:${(h.r[2] - h.r[0]) / P0.W * 100}%;top:${(h.k + h.r[1] / P0.H) * pct}%;height:${(h.r[3] - h.r[1]) / P0.H * pct}%"></button>`).join("")}</div>`;
    $(".up", dev).disabled = step === 0; $(".dn", dev).disabled = step >= nd.steps - 1; sctl.hidden = nd.steps < 2;
    stat.textContent = nd.overlay ? "Interaction state · tap an empty spot to go back" : `Screen ${order.indexOf(cur) + 1} of ${order.length}` + (nd.steps > 1 ? ` · part ${step + 1} of ${nd.steps}` : "");
    $$("button", trail).forEach(b => { const on = b.dataset.id === cur; b.classList.toggle("on", on); if (on) trail.scrollTo({left: b.offsetLeft - trail.clientWidth / 2 + b.clientWidth / 2, behavior: reduce ? "auto" : "smooth"}); });
  }
  function go(id, push){ if (!P0.nodes[id]) return; if (push) hist.push([cur, step]); cur = id; step = 0; render(true); }
  function back(){ const h = hist.pop(); if (h) { cur = h[0]; step = h[1]; render(true); } }
  lay.addEventListener("click", e => {
    const b = e.target.closest(".hs"); if (b) { go(P0.nodes[cur].hot[+b.dataset.i].t, true); return; }
    if (P0.nodes[cur].overlay) { back(); return; }
    scr.classList.add("flash"); setTimeout(() => scr.classList.remove("flash"), 800);
  });
  const by = d => { const nd = P0.nodes[cur], s = Math.min(nd.steps - 1, Math.max(0, step + d)); if (s !== step) { step = s; render(false); } };
  $(".up", dev).onclick = () => by(-1); $(".dn", dev).onclick = () => by(1);
  let wl = 0;
  scr.addEventListener("wheel", e => { const nd = P0.nodes[cur]; const d = e.deltaY > 0 ? 1 : -1; if (!((d > 0 && step < nd.steps - 1) || (d < 0 && step > 0))) return; e.preventDefault(); const now = Date.now(); if (now - wl < 450) return; wl = now; by(d); }, {passive:false});
  let ty = null; scr.addEventListener("touchstart", e => { ty = e.touches[0].clientY; }, {passive:true});
  scr.addEventListener("touchend", e => { if (ty === null) return; const d = ty - e.changedTouches[0].clientY; if (Math.abs(d) > 40) by(d > 0 ? 1 : -1); ty = null; });
  $(".js-pback", v).onclick = back;
  $(".js-prestart", v).onclick = () => { hist = []; go(P0.start, false); };
  $(".js-phs", v).onclick = e => { const on = e.currentTarget.getAttribute("aria-pressed") !== "true"; e.currentTarget.setAttribute("aria-pressed", on); scr.classList.toggle("showhs", on); };
  render(false);
}

/* ---------- enquiry form ---------- */
function initForm(form, v){
  const out = $(".js-out", v);
  const val = n => (form.elements[n]?.value || "").trim();
  const setErr = (n, msg) => { const el = form.elements[n]; if (!el) return; el.setAttribute("aria-invalid", msg ? "true" : "false"); const e = $(`#err-${n}`, form); if (e) e.textContent = msg || ""; };
  const mailto = d => `mailto:${EMAIL}?subject=${encodeURIComponent(`Project enquiry from ${d.name}`)}&body=${encodeURIComponent(`${d.message}\n\n— ${d.name} (${d.email})${d.company ? ", " + d.company : ""}\nInterested in: ${d.type}`)}`;
  const fallback = (d, why) => {
    out.innerHTML = `<div class="note warn" role="status"><b>${why}</b> Your message is still here, so nothing is lost. Email it to me directly instead:<div class="mailrow"><code>${EMAIL}</code><button type="button" class="js-copy">Copy email</button><a href="${mailto(d)}">Open in email app</a></div></div>`;
    $(".js-copy", out).onclick = async e => { try { await navigator.clipboard.writeText(EMAIL); e.target.textContent = "Copied"; } catch(_) { const r = document.createRange(); r.selectNodeContents($("code", out)); getSelection().removeAllRanges(); getSelection().addRange(r); e.target.textContent = "Selected, press Ctrl/Cmd+C"; } };
  };
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const d = {name: val("name"), email: val("email"), company: val("company"), type: [...form.querySelectorAll('input[name="type"]:checked')].map(x => x.value).join(", ") || "Not specified", message: val("message")};
    let bad = false;
    setErr("name", d.name ? "" : (bad = true, "Please add your name."));
    setErr("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) ? "" : (bad = true, "Please enter a valid email so I can reply."));
    setErr("message", d.message.length >= 10 ? "" : (bad = true, "Tell me a little more (at least 10 characters)."));
    if (bad) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
    const btn = form.querySelector('button[type="submit"]'); btn.disabled = true; btn.textContent = "Sending…"; out.innerHTML = "";
    let ok = false;
    try {
      if (MODE === "artifact" && window.claude?.use) {
        const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
        const id = user ? await user.id() : null;
        if (db && id) {
          const ref = db.doc("enquiries/" + id); const snap = await ref.get();
          const prev = snap.exists ? (snap.data().messages || []) : [];
          await ref.set({messages: [...prev, {...d, at: new Date().toISOString()}].slice(-20), updatedAt: new Date().toISOString()});
          ok = true;
        } else { fallback(d, "This preview can't send messages for you."); }
      } else if (MODE === "artifact") {
        fallback(d, "This preview can't send messages for you.");
      } else {
        const r = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {method:"POST", headers:{"Content-Type":"application/json", Accept:"application/json"}, body: JSON.stringify({name:d.name, email:d.email, company:d.company, interested_in:d.type, message:d.message, _subject:`New enquiry from ${d.name} via vijaykothare.com`, _template:"table", _captcha:"false"})});
        ok = r.ok; if (!ok) fallback(d, "The message didn't go through.");
      }
    } catch(err) { fallback(d, "The message didn't go through."); }
    btn.disabled = false; btn.textContent = "Send message →";
    if (ok) { out.innerHTML = `<div class="note ok" role="status"><b>Thanks, ${d.name.split(" ")[0]}!</b> Your message reached my inbox. I usually reply within two working days.</div>`; form.reset(); }
  });
  // owner inbox (artifact only)
  if (MODE === "artifact" && window.claude?.use) (async () => {
    const user = await window.claude.use("user"); if (!user?.isOwner?.()) return;
    const db = await window.claude.use("db"); if (!db) return;
    const box = $(".js-inbox", v); box.hidden = false; const list = $(".js-inbox-list", box);
    const t = setTimeout(() => { list.textContent = "Couldn't load enquiries right now."; }, 10000);
    db.collection("enquiries").onSnapshot(qs => { clearTimeout(t);
      const msgs = qs.docs.flatMap(dc => (dc.data().messages || [])).sort((a, b) => (b.at || "").localeCompare(a.at || ""));
      list.innerHTML = msgs.length ? "" : `<p class="muted">No enquiries yet. New messages from the form will appear here.</p>`;
      msgs.forEach(m => { const el = document.createElement("article"); el.className = "msg"; const h = document.createElement("header"); const a = document.createElement("span"); a.textContent = `${m.name} · ${m.email}${m.company ? " · " + m.company : ""}`; const b = document.createElement("span"); b.className = "mono muted"; b.textContent = new Date(m.at).toLocaleString(); h.append(a, b); const ty = document.createElement("div"); ty.className = "mono muted"; ty.textContent = m.type; const p = document.createElement("p"); p.textContent = m.message; el.append(h, ty, p); list.append(el); });
    }, () => { clearTimeout(t); list.textContent = "Couldn't load enquiries right now."; });
  })();
}

/* ---------- routing (artifact) ---------- */
const views = $$(".view");
function route(){
  if (MODE !== "artifact") { const v = views[0] || document.body; setSpy(v); initView(v); return; }
  let h = decodeURIComponent(location.hash.slice(1)) || "home";
  if (!views.some(v => v.dataset.route === h)) h = "home";
  views.forEach(v => v.hidden = v.dataset.route !== h);
  const v = views.find(x => x.dataset.route === h);
  document.title = v.dataset.title;
  $$(".navl a").forEach(a => a.toggleAttribute("aria-current", a.dataset.r === (v.dataset.section || h)));
  $$(".navl a[aria-current]").forEach(a => a.setAttribute("aria-current", "page"));
  scrollTo({top: 0, behavior: "instant"});
  setSpy(v); initView(v);
}
addEventListener("hashchange", route);
route();
})();

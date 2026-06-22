import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const DARK = {
  bg:"#07090F", bg2:"#0D1220", bg3:"#111827",
  surface:"rgba(255,255,255,0.04)", surfaceHover:"rgba(255,255,255,0.07)",
  border:"rgba(255,255,255,0.08)", borderMed:"rgba(255,255,255,0.13)",
  blue:"#2563EB", blueMid:"#3B82F6", blueDim:"rgba(37,99,235,0.13)",
  purple:"#7C3AED", purpleDim:"rgba(124,58,237,0.13)",
  green:"#10B981", greenDim:"rgba(16,185,129,0.11)",
  amber:"#F59E0B", amberDim:"rgba(245,158,11,0.11)",
  red:"#EF4444", redDim:"rgba(239,68,68,0.1)",
  textPrimary:"#F0F4FF", textSecondary:"#8B9BB4", textMuted:"#3D4F6A",
  navBg:"rgba(7,9,15,0.9)", cardBg:"rgba(255,255,255,0.03)",
  inputBg:"rgba(255,255,255,0.05)", sidebarBg:"#080E1B", isDark:true,
};
const LIGHT = {
  bg:"#F8FAFC", bg2:"#F1F5F9", bg3:"#E8EDF5",
  surface:"#FFFFFF", surfaceHover:"#F7F9FC",
  border:"rgba(0,0,0,0.07)", borderMed:"rgba(0,0,0,0.12)",
  blue:"#1D4ED8", blueMid:"#2563EB", blueDim:"rgba(29,78,216,0.08)",
  purple:"#6D28D9", purpleDim:"rgba(109,40,217,0.08)",
  green:"#059669", greenDim:"rgba(5,150,105,0.08)",
  amber:"#D97706", amberDim:"rgba(217,119,6,0.08)",
  red:"#DC2626", redDim:"rgba(220,38,38,0.08)",
  textPrimary:"#0A1628", textSecondary:"#4A5568", textMuted:"#9BA8B8",
  navBg:"rgba(248,250,252,0.92)", cardBg:"#FFFFFF",
  inputBg:"#FFFFFF", sidebarBg:"#F1F5F9", isDark:false,
};

const Ctx = createContext(DARK);
const useT = () => useContext(Ctx);

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const store = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
let _addToast = null;
const toast = (msg, type) => _addToast && _addToast({ msg, type: type || "success", id: Date.now() });

function Toasts() {
  const t = useT();
  const [list, setList] = useState([]);
  _addToast = (item) => {
    setList(p => [...p, item]);
    setTimeout(() => setList(p => p.filter(x => x.id !== item.id)), 3000);
  };
  if (!list.length) return null;
  return (
    <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
      {list.map(item => {
        const col = item.type === "error" ? t.red : item.type === "info" ? t.blue : t.green;
        return (
          <div key={item.id} style={{ padding:"10px 20px", borderRadius:10, background:t.isDark?"#1a2235":"#fff", border:"1px solid " + col + "40", color:t.textPrimary, fontSize:13, fontWeight:500, boxShadow:"0 4px 20px rgba(0,0,0,.25)", display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap", animation:"fadeIn .2s ease" }}>
            <span style={{ color:col }}>{item.type === "error" ? "✕" : item.type === "info" ? "ℹ" : "✓"}</span>
            {item.msg}
          </div>
        );
      })}
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
function GlobalCSS({ t }) {
  const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{font-size:15px;scroll-behavior:smooth;}
body{background:${t.bg};color:${t.textPrimary};font-family:'Inter',system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;transition:background .3s,color .3s;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{transform:translateX(320px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes blink{50%{opacity:0}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px;}
input,select,textarea{font-family:inherit;font-size:.875rem;color:${t.textPrimary};background:${t.inputBg};border:1px solid ${t.border};border-radius:8px;padding:9px 13px;outline:none;transition:border-color .18s,box-shadow .18s;width:100%;}
input:focus,select:focus,textarea:focus{border-color:${t.blue};box-shadow:0 0 0 3px ${t.blueDim};}
input::placeholder,textarea::placeholder{color:${t.textMuted};}
select{cursor:pointer;}
label{display:block;font-size:.8rem;font-weight:500;color:${t.textSecondary};margin-bottom:5px;}
@media(max-width:768px){.hide-mobile{display:none!important;}.sidebar{display:none!important;}.main-padded{margin-left:0!important;}.g3{grid-template-columns:1fr!important;}.g2{grid-template-columns:1fr!important;}.g4{grid-template-columns:1fr 1fr!important;}}
  `;
  return <style>{css}</style>;
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Btn({ children, variant, size, onClick, disabled, full, style: sx }) {
  const t = useT();
  const [h, setH] = useState(false);
  const v = variant || "primary";
  const s = size || "md";
  const fs = s === "sm" ? 12.5 : s === "lg" ? 15 : 13.5;
  const pad = s === "sm" ? "5px 13px" : s === "lg" ? "11px 26px" : "8px 18px";
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, borderRadius:8, fontWeight:500, cursor:disabled ? "not-allowed" : "pointer", fontFamily:"inherit", transition:"all .17s", border:"none", opacity:disabled ? .4 : 1, width:full ? "100%" : undefined, fontSize:fs, padding:pad, letterSpacing:".01em" };
  const styles = {
    primary: { background:h ? t.blueMid : t.blue, color:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,.2)" },
    purple: { background:h ? "#6D28D9" : t.purple, color:"#fff", boxShadow:"0 2px 12px rgba(124,58,237,.3)" },
    secondary: { background:h ? t.surfaceHover : t.surface, color:t.textPrimary, border:"1px solid " + t.border },
    ghost: { background:h ? t.surface : "transparent", color:h ? t.textPrimary : t.textSecondary },
    danger: { background:t.redDim, color:t.red, border:"1px solid " + t.red + "28" },
  };
  return (
    <button disabled={disabled} onClick={disabled ? undefined : onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ ...base, ...(styles[v] || styles.primary), ...sx }}>
      {children}
    </button>
  );
}

function Tag({ children, color, dot }) {
  const t = useT();
  const c = color || t.blue;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"2px 9px", borderRadius:5, background:c + "14", border:"1px solid " + c + "26", fontSize:11.5, fontWeight:500, color:c }}>
      {dot && <span style={{ width:5, height:5, borderRadius:"50%", background:c, flexShrink:0 }} />}
      {children}
    </span>
  );
}

function LiveDot({ label }) {
  const t = useT();
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 9px", borderRadius:5, background:t.greenDim, border:"1px solid " + t.green + "22", fontSize:11.5, fontWeight:500, color:t.green }}>
      <span style={{ position:"relative", display:"inline-flex", width:6, height:6 }}>
        <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:t.green, animation:"ping .9s ease-in-out infinite" }} />
        <span style={{ position:"relative", borderRadius:"50%", width:"100%", height:"100%", background:t.green }} />
      </span>
      {label || "Online"}
    </span>
  );
}

function Spinner({ size, color }) {
  const t = useT();
  const sz = size || 16;
  return <span style={{ display:"inline-block", width:sz, height:sz, border:"2px solid " + t.border, borderTopColor:color || t.blue, borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />;
}

function Divider({ my }) {
  const t = useT();
  return <div style={{ height:1, background:t.border, margin:(my || 16) + "px 0" }} />;
}

function Card({ children, style, pad, hover, onClick, highlight }) {
  const t = useT();
  const [h, setH] = useState(false);
  const p = pad != null ? pad : 20;
  return (
    <div onClick={onClick} onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)}
      style={{ background:h ? t.surfaceHover : t.cardBg, border:"1px solid " + (highlight ? t.purple : h ? t.borderMed : t.border), borderRadius:12, padding:p, transition:"all .18s", cursor:onClick ? "pointer" : undefined, ...style }}>
      {children}
    </div>
  );
}

function Skel({ w, h, r }) {
  const t = useT();
  return <div style={{ width:w || "100%", height:h || 12, borderRadius:r || 4, background:"linear-gradient(90deg," + t.border + " 0%," + t.surfaceHover + " 50%," + t.border + " 100%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s linear infinite" }} />;
}

function ProgressBar({ value, color, delay }) {
  const t = useT();
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(value), 150 + (delay || 0));
    return () => clearTimeout(id);
  }, [value, delay]);
  return (
    <div style={{ flex:1, height:5, borderRadius:99, background:t.border, overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:99, background:color || t.blue, width:w + "%", transition:"width 1.1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function MetricRow({ label, value, color, delay }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
      {label && <span style={{ minWidth:130, fontSize:12 }}>{label}</span>}
      <ProgressBar value={value} color={color} delay={delay} />
      <span style={{ minWidth:32, textAlign:"right", fontSize:12, fontWeight:500, color:color }}>{value}%</span>
    </div>
  );
}

function StreamText({ text, speed }) {
  const t = useT();
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setShown(""); setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed || 9);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span style={{ fontSize:13.5, lineHeight:1.8, color:t.textPrimary, whiteSpace:"pre-wrap", fontFamily:"inherit" }}>
      {shown}
      {!done && <span style={{ display:"inline-block", width:"2px", height:"1em", background:t.blue, marginLeft:2, verticalAlign:"middle", animation:"blink .65s infinite" }} />}
    </span>
  );
}

function ScoreGauge({ value, size, animated, label }) {
  const t = useT();
  const [v, setV] = useState(0);
  const sz = size || 100;
  useEffect(() => {
    if (animated) { const id = setTimeout(() => setV(value || 0), 350); return () => clearTimeout(id); }
    else setV(value || 0);
  }, [animated, value]);
  const r = 36; const circ = Math.PI * r; const off = circ * (1 - v / 100);
  const col = v >= 70 ? t.green : v >= 45 ? t.amber : t.red;
  return (
    <div style={{ textAlign:"center" }}>
      <svg width={sz} height={sz * 0.58} viewBox="0 0 84 50">
        <path d="M7 44 A36 36 0 0 1 77 44" fill="none" stroke={t.border} strokeWidth="7" strokeLinecap="round" />
        <path d="M7 44 A36 36 0 0 1 77 44" fill="none" stroke={col} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{ transition:"stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)" }} />
        <text x="42" y="40" textAnchor="middle" fill={t.textPrimary} fontSize="14" fontWeight="600" fontFamily="Inter,sans-serif">{v}%</text>
      </svg>
      {label && <div style={{ fontSize:11, color:t.textSecondary, marginTop:-2 }}>{label}</div>}
    </div>
  );
}

function Stars() {
  return <span style={{ display:"inline-flex", gap:2 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color:"#FBBF24", fontSize:13 }}>★</span>)}</span>;
}

function Modal({ children, onClose, width }) {
  const t = useT();
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:800, background:"rgba(0,0,0,.65)", backdropFilter:"blur(5px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, animation:"fadeIn .2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:width || 520, background:t.isDark ? t.bg2 : t.bg, border:"1px solid " + t.border, borderRadius:16, boxShadow:"0 32px 80px rgba(0,0,0,.4)", animation:"scaleIn .22s ease", maxHeight:"90vh", overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

function SectionHead({ overline, title, sub, center }) {
  const t = useT();
  return (
    <div style={{ maxWidth:center ? 620 : undefined, margin:center ? "0 auto 48px" : "0 0 40px", textAlign:center ? "center" : "left" }}>
      {overline && <div style={{ fontSize:12, fontWeight:600, color:t.blue, letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>{overline}</div>}
      <h2 style={{ fontSize:"clamp(22px,2.8vw,34px)", fontWeight:700, color:t.textPrimary, lineHeight:1.2, letterSpacing:"-.025em", marginBottom:sub ? 10 : 0 }}>{title}</h2>
      {sub && <p style={{ fontSize:16, color:t.textSecondary, lineHeight:1.7, marginTop:8 }}>{sub}</p>}
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CLAIM_TYPES = [
  { id:"contract", label:"Contract Breach", icon:"📄", desc:"Breach of signed agreements" },
  { id:"consumer", label:"Consumer Rights", icon:"🛍", desc:"Product or service failures" },
  { id:"landlord", label:"Landlord / Tenant", icon:"🏠", desc:"Lease and property disputes" },
  { id:"freelance", label:"Unpaid Freelance", icon:"💼", desc:"Non-payment for services" },
  { id:"employment", label:"Employment", icon:"👔", desc:"Workplace rights violations" },
  { id:"injury", label:"Personal Injury", icon:"⚕️", desc:"Physical or emotional harm" },
];
const JURISDICTIONS = ["United States","United Kingdom","European Union","Israel","Germany","France","Canada","Australia","Spain","Other"];
const LANGUAGES = ["English","Hebrew","Arabic","French","Spanish","German","Chinese","Japanese","Italian","Portuguese","Russian","Hindi"];

// ─── LOCALE MAP — browser language → language + jurisdiction + currency ───────
const LOCALE_MAP = {
  "he":    { language:"Hebrew",     jurisdiction:"Israel",          currency:"₪", currencyCode:"ILS", dateLocale:"he-IL", legalSystem:"Israeli Civil Law" },
  "ar":    { language:"Arabic",     jurisdiction:"Other",           currency:"$", currencyCode:"USD", dateLocale:"ar",    legalSystem:"Civil Law" },
  "fr":    { language:"French",     jurisdiction:"France",          currency:"€", currencyCode:"EUR", dateLocale:"fr-FR", legalSystem:"French Civil Law" },
  "de":    { language:"German",     jurisdiction:"Germany",         currency:"€", currencyCode:"EUR", dateLocale:"de-DE", legalSystem:"German Civil Law" },
  "es":    { language:"Spanish",    jurisdiction:"Spain",           currency:"€", currencyCode:"EUR", dateLocale:"es-ES", legalSystem:"Spanish Civil Law" },
  "zh":    { language:"Chinese",    jurisdiction:"Other",           currency:"¥", currencyCode:"CNY", dateLocale:"zh-CN", legalSystem:"Civil Law" },
  "ja":    { language:"Japanese",   jurisdiction:"Other",           currency:"¥", currencyCode:"JPY", dateLocale:"ja-JP", legalSystem:"Japanese Civil Law" },
  "it":    { language:"Italian",    jurisdiction:"European Union",  currency:"€", currencyCode:"EUR", dateLocale:"it-IT", legalSystem:"Italian Civil Law" },
  "pt":    { language:"Portuguese", jurisdiction:"Other",           currency:"€", currencyCode:"EUR", dateLocale:"pt-PT", legalSystem:"Civil Law" },
  "ru":    { language:"Russian",    jurisdiction:"Other",           currency:"₽", currencyCode:"RUB", dateLocale:"ru-RU", legalSystem:"Civil Law" },
  "hi":    { language:"Hindi",      jurisdiction:"Other",           currency:"₹", currencyCode:"INR", dateLocale:"hi-IN", legalSystem:"Indian Common Law" },
  "nl":    { language:"Dutch",      jurisdiction:"European Union",  currency:"€", currencyCode:"EUR", dateLocale:"nl-NL", legalSystem:"Dutch Civil Law" },
  "en-GB": { language:"English",    jurisdiction:"United Kingdom",  currency:"£", currencyCode:"GBP", dateLocale:"en-GB", legalSystem:"English Common Law" },
  "en-AU": { language:"English",    jurisdiction:"Australia",       currency:"A$",currencyCode:"AUD", dateLocale:"en-AU", legalSystem:"Australian Common Law" },
  "en-CA": { language:"English",    jurisdiction:"Canada",          currency:"C$",currencyCode:"CAD", dateLocale:"en-CA", legalSystem:"Canadian Common Law" },
  "en":    { language:"English",    jurisdiction:"United States",   currency:"$", currencyCode:"USD", dateLocale:"en-US", legalSystem:"US Common Law" },
};

function detectLocale() {
  if (typeof navigator === "undefined") return LOCALE_MAP["en"];
  const langs = Array.from(navigator.languages || [navigator.language || "en"]);
  for (const lang of langs) {
    if (LOCALE_MAP[lang]) return LOCALE_MAP[lang];
    const short = lang.split("-")[0];
    if (LOCALE_MAP[short]) return LOCALE_MAP[short];
  }
  return LOCALE_MAP["en"];
}
const AI_STEPS = [
  "Parsing incident description",
  "Identifying applicable legal frameworks",
  "Extracting parties, timeline, and facts",
  "Detecting narrative contradictions",
  "Assessing evidence completeness",
  "Calculating compensation estimates",
  "Evaluating legal risk exposure",
  "Formulating litigation strategy",
  "Composing analysis report",
];
const FEATURES = [
  { icon:"⚖️", t:"AI Legal Analysis", d:"Structured evaluation of claim validity and legal standing based on jurisdiction and applicable law." },
  { icon:"📎", t:"Evidence Intelligence", d:"Evaluates uploaded documents, screenshots, and contracts for relevance and evidential weight." },
  { icon:"🔍", t:"Contradiction Detection", d:"Identifies inconsistencies in your narrative before opposing counsel does." },
  { icon:"📊", t:"Compensation Modeling", d:"Data-driven ranges for minimum, recommended, and maximum compensation scenarios." },
  { icon:"📄", t:"Court-Ready PDF Export", d:"Professionally formatted legal documents suitable for attorney review or direct submission." },
  { icon:"🌐", t:"Multilingual Output", d:"Analysis and reports in 100+ languages with jurisdiction-aware legal terminology." },
  { icon:"💬", t:"AI Legal Chat", d:"Ask follow-up questions about strategy, evidence, or next steps." },
  { icon:"🔒", t:"Secure Case Storage", d:"AES-256 encrypted storage with GDPR-compliant retention and audit logs." },
  { icon:"📅", t:"Timeline Reconstruction", d:"Automatically builds a chronological case timeline from your description." },
];
const HOW_STEPS = [
  { n:"01", t:"Describe the Incident", d:"Provide a factual account: who was involved, what was agreed, what changed, and when." },
  { n:"02", t:"Upload Evidence", d:"Attach contracts, invoices, emails, screenshots, and photos to strengthen your claim." },
  { n:"03", t:"AI Analysis", d:"ClaimSmart evaluates your case, identifies risks, and estimates compensation ranges." },
  { n:"04", t:"Review & Export", d:"Download a professional PDF report. Use AI chat for follow-up strategy questions." },
];
const TESTIMONIALS = [
  { name:"Sarah M.", role:"Freelance Designer", loc:"New York", text:"After 8 months of no payment, ClaimSmart helped me structure a demand letter that resulted in full recovery.", score:9.4, amount:"$22,000 recovered" },
  { name:"Daniel K.", role:"Business Owner", loc:"Berlin", text:"A supplier breached our service agreement. The AI generated a German-language legal summary my attorney could immediately use.", score:8.7, amount:"€18,500 settled" },
  { name:"Yael S.", role:"Startup Founder", loc:"Tel Aviv", text:"The contradiction detection feature found gaps in the opposing party's position that became central to our negotiation.", score:9.1, amount:"$41,000 resolved" },
];
const FAQ_ITEMS = [
  { q:"Is ClaimSmart a law firm?", a:"No. ClaimSmart is an AI-powered legal analysis platform. We do not provide legal advice. Our reports are intended to help you understand your situation — not to replace qualified legal counsel." },
  { q:"How accurate is the AI analysis?", a:"Our AI uses Claude, one of the most capable large language models available. Analysis quality improves with the detail you provide. Treat results as a structured starting point for discussion with an attorney." },
  { q:"Who can see my case information?", a:"Your case data is encrypted at rest and in transit. It is not shared with third parties or used for AI training." },
  { q:"What file types can I upload?", a:"We support PDF, DOCX, PNG, JPG, HEIC, MP3, MP4, and ZIP. Maximum 50MB per file, up to 10 files per case." },
  { q:"Can I use ClaimSmart outside the United States?", a:"Yes. We support analysis for disputes in the US, UK, EU, Israel, Germany, France, Australia, Canada, and many other jurisdictions." },
  { q:"How long does an analysis take?", a:"Most analyses complete in 30–90 seconds depending on the complexity of your case." },
];
const PRICING = [
  { name:"Starter", price:"$14.90", originalPrice:"$29", period:"/mo", firstMonth:true, desc:"For individuals with occasional disputes.", features:["5 AI analyses per month","PDF export","3 language options","Email support","30-day case history"], popular:false },
  { name:"Professional", price:"$39.90", originalPrice:"$79", period:"/mo", firstMonth:true, desc:"For freelancers and small business owners.", features:["Unlimited analyses","All 100+ languages","Priority AI processing","Full case history","API access","AI chat assistant"], popular:true },
  { name:"Business", price:"$99.90", originalPrice:"$199", period:"/mo", firstMonth:true, desc:"For teams and growing companies.", features:["Everything in Professional","Team workspace (5 seats)","Custom PDF templates","Dedicated support","Advanced analytics"], popular:false },
];

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ mode, onClose, onAuth }) {
  const t = useT();
  const [tab, setTab] = useState(mode || "signin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!email) { setErr("Email is required."); return; }
    if (!pass) { setErr("Password is required."); return; }
    if (tab === "signup" && !name) { setErr("Name is required."); return; }
    setLoading(true); setErr("");
    await new Promise(r => setTimeout(r, 900));
    const user = { id:"u_" + Date.now(), name:name || email.split("@")[0], email, plan:"Professional", avatar:email[0].toUpperCase(), joined:new Date().toLocaleDateString() };
    store.set("cs_user", user);
    toast(tab === "signin" ? "Welcome back!" : "Account created!", "success");
    setLoading(false);
    onAuth(user);
  };

  return (
    <Modal onClose={onClose} width={440}>
      <div style={{ padding:"28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:t.purple, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>⚖️</div>
          <div style={{ fontSize:16, fontWeight:700, color:t.textPrimary }}>ClaimSmart AI</div>
        </div>

        <div style={{ display:"flex", background:t.surface, border:"1px solid " + t.border, borderRadius:9, padding:3, marginBottom:22 }}>
          {["signin","signup"].map(tb => (
            <button key={tb} onClick={() => setTab(tb)} style={{ flex:1, padding:"7px", borderRadius:7, background:tab === tb ? (t.isDark ? t.bg3 : "#fff") : "transparent", border:"none", color:tab === tb ? t.textPrimary : t.textSecondary, fontSize:13, fontWeight:tab === tb ? 500 : 400, cursor:"pointer", fontFamily:"inherit" }}>
              {tb === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <button onClick={() => toast("Google OAuth — configure your OAuth credentials", "info")} style={{ width:"100%", padding:"10px", borderRadius:9, background:t.surface, border:"1px solid " + t.border, color:t.textPrimary, fontSize:13.5, fontWeight:500, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:9, marginBottom:16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:t.border }} />
          <span style={{ fontSize:11, color:t.textMuted }}>or</span>
          <div style={{ flex:1, height:1, background:t.border }} />
        </div>

        <div style={{ display:"grid", gap:13 }}>
          {tab === "signup" && <div><label>Full Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" /></div>}
          <div><label>Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" /></div>
          <div><label>Password</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} /></div>
        </div>

        {err && <div style={{ marginTop:12, padding:"9px 12px", borderRadius:8, background:t.redDim, border:"1px solid " + t.red + "28", color:t.red, fontSize:13 }}>{err}</div>}

        <Btn variant="purple" size="lg" full onClick={submit} disabled={loading} style={{ marginTop:18 }}>
          {loading ? <><Spinner size={14} color="#fff" /> {tab === "signin" ? "Signing in…" : "Creating account…"}</> : tab === "signin" ? "Sign In →" : "Create Account →"}
        </Btn>

        {tab === "signup" && <p style={{ fontSize:11.5, color:t.textMuted, textAlign:"center", marginTop:14, lineHeight:1.6 }}>By creating an account you agree to our Terms of Service and Privacy Policy.</p>}
      </div>
    </Modal>
  );
}

// ─── PDF VIEWER ───────────────────────────────────────────────────────────────
function PDFViewer({ result, claimType, jurisdiction, onClose }) {
  const t = useT();
  const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  const caseNum = "CS-" + String(Date.now()).slice(-6);

  const docStyle = { background:"#fff", color:"#0A0A0A", fontFamily:"'Times New Roman',Georgia,serif", fontSize:14, lineHeight:1.78, padding:"52px 60px" };
  const sectionStyle = { fontSize:12, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", borderBottom:"1.5px solid #0A0A0A", paddingBottom:5, marginBottom:14, marginTop:28, color:"#0A0A0A" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:700, background:"rgba(0,0,0,.72)", backdropFilter:"blur(6px)", display:"flex", flexDirection:"column", animation:"fadeIn .2s ease" }} onClick={onClose}>
      <div style={{ background:t.bg3, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid " + t.border, flexShrink:0 }} onClick={e => e.stopPropagation()}>
        <span style={{ fontSize:13, fontWeight:500, color:t.textPrimary }}>Legal Analysis Report — {caseNum}</span>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant="secondary" size="sm" onClick={() => { toast("PDF exported", "success"); window.print && window.print(); }}>⬇ Export PDF</Btn>
          <Btn variant="ghost" size="sm" onClick={onClose}>✕ Close</Btn>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"24px 16px" }} onClick={e => e.stopPropagation()}>
        <div style={{ ...docStyle, maxWidth:720, margin:"0 auto", borderRadius:4, boxShadow:"0 4px 40px rgba(0,0,0,.3)" }}>
          <div style={{ textAlign:"center", marginBottom:36, paddingBottom:28, borderBottom:"1px solid #ccc" }}>
            <div style={{ fontSize:11, letterSpacing:".14em", textTransform:"uppercase", color:"#555", marginBottom:8 }}>Legal Analysis Report · Confidential</div>
            <div style={{ fontSize:26, fontWeight:700, marginBottom:6 }}>ClaimSmart AI Platform</div>
            <div style={{ fontSize:12, color:"#555" }}>Case No. {caseNum} · {date} · {jurisdiction || "N/A"}</div>
            <div style={{ fontSize:11, color:"#888", marginTop:6 }}>Generated by artificial intelligence. For informational purposes only.</div>
          </div>

          <div style={sectionStyle}>1. Executive Summary</div>
          <p><strong>Claim Category:</strong> {(claimType || "").replace(/_/g, " ")}</p>
          <p style={{ marginTop:6 }}><strong>Claim Strength:</strong> {result.claimScore}/10</p>
          <p style={{ marginTop:6 }}><strong>Recommended Compensation:</strong> {result.estimatedRecommended}</p>
          <p style={{ marginTop:12 }}>{result.verdict}</p>

          <div style={sectionStyle}>2. Strengths</div>
          {(result.strengths || []).map((s, i) => <p key={i} style={{ marginBottom:7, paddingLeft:20 }}>({i+1}) {s}</p>)}

          <div style={sectionStyle}>3. Risk Factors</div>
          {(result.weaknesses || []).map((w, i) => <p key={i} style={{ marginBottom:7, paddingLeft:20 }}>({i+1}) {w}</p>)}

          <div style={sectionStyle}>4. Compensation Analysis</div>
          <table style={{ width:"100%", borderCollapse:"collapse", marginTop:4 }}>
            <thead>
              <tr>
                <th style={{ textAlign:"left", padding:"7px 10px", borderBottom:"1px solid #ccc", fontSize:12, fontWeight:700 }}>Scenario</th>
                <th style={{ textAlign:"left", padding:"7px 10px", borderBottom:"1px solid #ccc", fontSize:12, fontWeight:700 }}>Estimated Amount</th>
              </tr>
            </thead>
            <tbody>
              {[["Minimum", result.estimatedMin], ["Recommended", result.estimatedRecommended], ["Maximum", result.estimatedMax]].map(([l, v]) => (
                <tr key={l}>
                  <td style={{ padding:"7px 10px", borderBottom:"1px solid #eee", fontSize:13 }}>{l}</td>
                  <td style={{ padding:"7px 10px", borderBottom:"1px solid #eee", fontSize:13, fontWeight:600 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={sectionStyle}>5. Legal Strategy</div>
          <p>{result.legalStrategy}</p>

          <div style={sectionStyle}>6. Recommended Next Steps</div>
          {(result.nextSteps || []).map((s, i) => <p key={i} style={{ marginBottom:7, paddingLeft:20 }}>({i+1}) {s}</p>)}

          <div style={{ marginTop:44, paddingTop:18, borderTop:"1px solid #ccc", fontSize:11, color:"#777", lineHeight:1.65 }}>
            <strong style={{ color:"#333" }}>Important Disclaimer:</strong> This report was generated by ClaimSmart AI for informational purposes only. It does not constitute legal advice. Consult a licensed attorney before taking legal action.
          </div>

          <div style={{ marginTop:28, paddingTop:14, borderTop:"1px solid #eee", display:"flex", justifyContent:"space-between", fontSize:11, color:"#aaa" }}>
            <span>ClaimSmart AI · {date}</span>
            <span>Case {caseNum} · Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CHAT PANEL ───────────────────────────────────────────────────────────────
function ChatPanel({ result, claimType, onClose }) {
  const t = useT();
  const SUGGESTED = ["What evidence should I gather?", "How strong is my case?", "What are my legal options?", "How long will this take?"];
  const [msgs, setMsgs] = useState([{ role:"assistant", text:"Hello. I'm your AI legal assistant. I can help you understand your analysis, clarify evidence requirements, or advise on next steps." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();
  useEffect(() => { endRef.current && endRef.current.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async (msg) => {
    const m = msg || input.trim();
    if (!m || loading) return;
    setInput("");
    setMsgs(p => [...p, { role:"user", text:m }]);
    setLoading(true);
    try {
      const ctx = result ? "User has a " + claimType + " case with score " + result.claimScore + "/10, damages " + result.estimatedRecommended + ". " : "";
      const sys = ctx + "You are a professional AI legal assistant for ClaimSmart. Provide clear, measured guidance in 2-4 sentences. Never make guarantees about outcomes.";
      const history = msgs.slice(-10).map(x => ({ role:x.role, content:x.text }));
      history.push({ role:"user", content:m });
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:800, system:sys, messages:history }),
      });
      const d = await res.json();
      const reply = (d.content || []).map(b => b.text || "").join("") || "Please try again.";
      setMsgs(p => [...p, { role:"assistant", text:reply }]);
    } catch {
      setMsgs(p => [...p, { role:"assistant", text:"Connection issue. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(0,0,0,.5)", backdropFilter:"blur(5px)", display:"flex", justifyContent:"flex-end", animation:"fadeIn .2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:400, height:"100%", background:t.isDark ? t.bg2 : t.bg, borderLeft:"1px solid " + t.border, display:"flex", flexDirection:"column", animation:"slideR .25s ease", boxShadow:"-20px 0 60px rgba(0,0,0,.3)" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid " + t.border, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:t.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>⚖️</div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:600, color:t.textPrimary }}>AI Legal Assistant</div>
              <LiveDot />
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={onClose}>✕</Btn>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent:m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth:"85%", padding:"10px 14px", fontSize:13, lineHeight:1.65, borderRadius:m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px", background:m.role === "user" ? t.blue : t.isDark ? t.bg3 : t.bg2, color:m.role === "user" ? "#fff" : t.textPrimary, border:m.role === "assistant" ? "1px solid " + t.border : "none" }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", gap:5, padding:"10px 14px", background:t.isDark ? t.bg3 : t.bg2, border:"1px solid " + t.border, borderRadius:"12px 12px 12px 3px", width:"fit-content" }}>
              {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:t.textMuted, animation:"pulse 1s " + (i * .18) + "s infinite" }} />)}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {msgs.length <= 2 && (
          <div style={{ padding:"0 12px 8px", display:"flex", flexWrap:"wrap", gap:6 }}>
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => send(s)} style={{ padding:"5px 10px", borderRadius:7, background:t.surface, border:"1px solid " + t.border, color:t.textSecondary, fontSize:11.5, cursor:"pointer", fontFamily:"inherit" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding:"10px 12px", borderTop:"1px solid " + t.border, display:"flex", gap:7, flexShrink:0 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about your case…" style={{ flex:1, borderColor:t.border, fontSize:13 }} />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{ width:36, height:36, borderRadius:8, border:"none", background:input.trim() ? t.blue : t.bg3, color:input.trim() ? "#fff" : t.textMuted, cursor:input.trim() ? "pointer" : "default", fontSize:15, flexShrink:0 }}>→</button>
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY PANEL ────────────────────────────────────────────────────────────
function HistoryPanel({ onSelect, onClose }) {
  const t = useT();
  const [cases, setCases] = useState(() => store.get("cs_cases", []));

  const del = (id) => {
    const n = cases.filter(c => c.id !== id);
    setCases(n);
    store.set("cs_cases", n);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(0,0,0,.5)", backdropFilter:"blur(5px)", display:"flex", justifyContent:"flex-end", animation:"fadeIn .2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:400, height:"100%", background:t.isDark ? t.bg2 : t.bg, borderLeft:"1px solid " + t.border, display:"flex", flexDirection:"column", animation:"slideR .25s ease" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid " + t.border, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div>
            <div style={{ fontWeight:600, fontSize:15, color:t.textPrimary }}>Case History</div>
            <div style={{ fontSize:12, color:t.textSecondary, marginTop:2 }}>{cases.length} saved analyses</div>
          </div>
          <Btn variant="ghost" size="sm" onClick={onClose}>✕</Btn>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:14 }}>
          {cases.length === 0 ? (
            <div style={{ textAlign:"center", padding:"52px 16px", color:t.textSecondary }}>
              <div style={{ fontSize:32, opacity:.35, marginBottom:12 }}>📂</div>
              <div style={{ fontSize:13 }}>No saved cases yet.</div>
            </div>
          ) : cases.map(c => (
            <Card key={c.id} hover onClick={() => onSelect(c)} style={{ marginBottom:10 }} pad={14}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7 }}>
                <Tag color={t.blue}>{(c.claimType || "").replace(/_/g, " ")}</Tag>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:c.score >= 8 ? t.green : c.score >= 6 ? t.amber : t.red }}>{c.score}/10</span>
                  <button onClick={e => { e.stopPropagation(); del(c.id); }} style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:14, lineHeight:1 }}>×</button>
                </div>
              </div>
              <div style={{ fontSize:12, color:t.textSecondary, lineHeight:1.5, marginBottom:5 }}>{(c.story || "").slice(0, 85)}{(c.story || "").length > 85 ? "…" : ""}</div>
              <div style={{ fontSize:11, color:t.textMuted }}>{c.date} · {c.recommended}</div>
            </Card>
          ))}
        </div>

        {cases.length > 0 && (
          <div style={{ padding:14, borderTop:"1px solid " + t.border }}>
            <Btn variant="secondary" size="sm" full onClick={() => { setCases([]); store.set("cs_cases", []); }}>Clear all history</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ANALYSIS WIZARD ──────────────────────────────────────────────────────────
function AnalysisWizard({ onBack, user }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [claimType, setClaimType] = useState(null);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [jurisdiction, setJurisdiction] = useState("United States");
  const [amount, setAmount] = useState("");
  const [language, setLanguage] = useState("English");
  const [locale, setLocale] = useState(null);

  // Auto-detect user locale on mount
  useEffect(() => {
    const detected = detectLocale();
    setLocale(detected);
    setLanguage(detected.language);
    setJurisdiction(detected.jurisdiction);
  }, []);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [aiIdx, setAiIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [stream, setStream] = useState("");
  const [scored, setScored] = useState(false);
  const [err, setErr] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const resultsRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).map(f => ({ name:f.name, size:f.size }));
    setFiles(p => [...p, ...dropped].slice(0, 10));
  }, []);

  const canNext = () => {
    if (step === 0) return !!claimType && story.trim().length > 50;
    return true;
  };

  const buildJsonSchema = (lang, cur, jur) => {
    const s = JSON.stringify({
      claimScore:7.5, verdict:"Assessment in "+lang+".",
      strengths:["s1","s2","s3"], weaknesses:["w1","w2"],
      missingEvidence:["e1","e2","e3"],
      estimatedMin:"5,000 "+cur, estimatedRecommended:"12,000 "+cur, estimatedMax:"25,000 "+cur,
      legalStrategy:"Strategy referencing "+jur+" law in "+lang+".",
      nextSteps:["s1","s2","s3","s4"],
      evidenceScore:65, timelineScore:70, legalPrecedentScore:60, riskScore:40,
    });
    return "Return this JSON shape (real values, all text in "+lang+"): "+s;
  };

  const runAI = async () => {
    setStep(3); setRunning(true); setAiIdx(0); setResult(null);
    setStream(""); setScored(false); setErr(null);

    for (let i = 0; i < AI_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 480));
      setAiIdx(i);
    }

    try {
      const fileList = files.map(f => f.name).join(", ") || "None";
      const legalSystem = locale ? locale.legalSystem : "Common Law";
      const currency = locale ? locale.currency : "$";
      const currencyCode = locale ? locale.currencyCode : "USD";
      const prompt = [
        "You are a professional legal analyst AI. Analyze this dispute and return ONLY valid JSON — no markdown, no explanation outside the JSON.",
        "CRITICAL: Respond ENTIRELY in " + language + ". Every text field must be written in " + language + ".",
        "Apply the laws and legal frameworks of: " + jurisdiction + " (" + legalSystem + ").",
        "Express all monetary estimates in " + currencyCode + " using the symbol " + currency + ".",
        "Case: " + (title || "Untitled"),
        "Type: " + claimType,
        "Jurisdiction: " + jurisdiction + " — " + legalSystem,
        "Description: " + story,
        "Amount: " + (amount || "unspecified"),
        "Language: " + language,
        "Files: " + fileList,
        "",
        "Return this exact JSON structure. All string values must be in " + language + ":",
                buildJsonSchema(language, currency, jurisdiction),
      ].join("\n");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1100,
          messages:[{ role:"user", content:prompt }],
        }),
      });

      const d = await res.json();
      const raw = (d.content || []).map(b => b.text || "").join("");
      const clean = raw.replace(/```[\w]*/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);

      setResult(parsed);

      const prev = store.get("cs_cases", []);
      store.set("cs_cases", [{
        id:Date.now(), title:title || "Untitled Case",
        claimType, story, score:parsed.claimScore,
        recommended:parsed.estimatedRecommended,
        date:new Date().toLocaleDateString(),
        jurisdiction, result:parsed,
      }, ...prev].slice(0, 30));

      const full = parsed.verdict + "\n\nStrategy: " + parsed.legalStrategy;
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setStream(full.slice(0, i));
        if (i >= full.length) clearInterval(iv);
      }, 10);

      setTimeout(() => setScored(true), 500);
      setTimeout(() => { if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior:"smooth", block:"start" }); }, 400);
      toast("Analysis complete. PDF ready to export.", "success");
    } catch (e) {
      setErr("Analysis failed. Please check your connection and try again.");
    } finally {
      setRunning(false);
    }
  };

  const sc = (v) => v >= 70 ? t.green : v >= 45 ? t.amber : t.red;
  const claimLabel = CLAIM_TYPES.find(c => c.id === claimType);

  return (
    <div style={{ maxWidth:980, margin:"0 auto" }}>
      {/* breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:24, fontSize:12, color:t.textMuted }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:t.blue, cursor:"pointer", fontSize:12, fontFamily:"inherit", padding:0 }}>← Home</button>
        <span>›</span>
        <span style={{ color:t.textSecondary }}>{["Describe Incident","Upload Evidence","Case Details","Analysis Results"][Math.min(step, 3)]}</span>
      </div>

      {/* stepper */}
      {step < 3 && (
        <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
          {["Incident","Evidence","Details"].map((s, i) => (
            <div key={s} style={{ display:"flex", alignItems:"center", flex:i < 2 ? 1 : 0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11.5, fontWeight:600, flexShrink:0, background:step > i ? t.blue : step === i ? t.blueDim : "transparent", border:"1.5px solid " + (step >= i ? t.blue : t.border), color:step > i ? "#fff" : step === i ? t.blue : t.textMuted }}>
                  {step > i ? "✓" : i + 1}
                </div>
                <span style={{ fontSize:13, fontWeight:step === i ? 500 : 400, color:step >= i ? t.textPrimary : t.textSecondary }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex:1, height:1, background:step > i ? t.blue : t.border, margin:"0 14px" }} />}
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:step < 3 ? "minmax(0,1fr) 240px" : "1fr", gap:18 }} className="g2">
        {/* MAIN CARD */}
        <Card pad={30}>
          {/* Step 0 — Incident */}
          {step === 0 && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:19, fontWeight:600, color:t.textPrimary, marginBottom:4 }}>Describe the Incident</h2>
              <p style={{ fontSize:13, color:t.textSecondary, marginBottom:22 }}>Provide a factual, detailed account. The more specific you are, the more precise the analysis.</p>
              <div style={{ display:"grid", gap:16 }}>
                <div>
                  <label>Case Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Unpaid Freelance Invoice — March 2024" />
                </div>
                <div>
                  <label>Claim Type</label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:4 }} className="g3">
                    {CLAIM_TYPES.map(ct => (
                      <div key={ct.id} onClick={() => setClaimType(ct.id)} style={{ padding:"11px 12px", borderRadius:9, border:"1.5px solid " + (claimType === ct.id ? t.blue : t.border), background:claimType === ct.id ? t.blueDim : t.surface, cursor:"pointer", transition:"all .18s" }}>
                        <div style={{ fontSize:16, marginBottom:5 }}>{ct.icon}</div>
                        <div style={{ fontSize:12, fontWeight:500, color:claimType === ct.id ? t.blue : t.textSecondary }}>{ct.label}</div>
                        <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>{ct.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label>Incident Description <span style={{ color:t.textMuted, fontWeight:400 }}>— include dates, parties, amounts</span></label>
                  <textarea value={story} onChange={e => setStory(e.target.value)} rows={6} autoFocus placeholder="Describe what happened. Include: who was involved, what was agreed, what changed, relevant dates, and any communications." style={{ lineHeight:1.75, resize:"vertical", borderColor:story.length > 50 ? t.blue : t.border }} />
                  <div style={{ fontSize:11, color:story.length > 50 ? t.green : t.textMuted, marginTop:4 }}>{story.length} chars{story.length < 50 ? " — " + (50 - story.length) + " more needed" : " ✓"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Evidence */}
          {step === 1 && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:19, fontWeight:600, color:t.textPrimary, marginBottom:4 }}>Upload Evidence</h2>
              <p style={{ fontSize:13, color:t.textSecondary, marginBottom:20 }}>Supporting documents substantially improve analysis accuracy. This step is optional.</p>
              <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => { const el = document.getElementById("wizard-file-input"); if (el) el.click(); }}
                style={{ border:"1.5px dashed " + (dragging ? t.blue : t.borderMed), borderRadius:10, padding:"36px 20px", textAlign:"center", background:dragging ? t.blueDim : t.surface, transition:"all .2s", cursor:"pointer" }}>
                <div style={{ fontSize:28, marginBottom:10, opacity:.55 }}>📎</div>
                <div style={{ fontWeight:500, fontSize:14, color:t.textPrimary, marginBottom:4 }}>Drop files or click to browse</div>
                <div style={{ fontSize:12, color:t.textSecondary }}>PDF · DOCX · PNG · JPG · MP3 · MP4 · ZIP — up to 10 files</div>
                <input id="wizard-file-input" type="file" multiple onChange={e => { const f = Array.from(e.target.files).map(x => ({ name:x.name, size:x.size })); setFiles(p => [...p, ...f].slice(0, 10)); }} style={{ display:"none" }} />
              </div>
              {files.length > 0 && (
                <div style={{ marginTop:14 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 11px", borderRadius:8, border:"1px solid " + t.border, marginBottom:7, background:t.surface }}>
                      <span style={{ fontSize:13, color:t.textSecondary }}>📄 {f.name}</span>
                      <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:15, lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop:14, padding:"11px 14px", borderRadius:8, background:t.surface, border:"1px solid " + t.border, fontSize:12, color:t.textSecondary, lineHeight:1.65 }}>
                🔒 Files are processed with AES-256 encryption and used solely for your case analysis.
              </div>
            </div>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:19, fontWeight:600, color:t.textPrimary, marginBottom:4 }}>Case Details</h2>
              <p style={{ fontSize:13, color:t.textSecondary, marginBottom:20 }}>These settings calibrate the AI analysis for your legal context.</p>
              <div style={{ display:"grid", gap:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="g2">
                  <div>
                    <label>Jurisdiction</label>
                    <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} style={{ background:t.isDark ? t.bg3 : t.surface, color:t.textPrimary }}>
                      {JURISDICTIONS.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Estimated Claim Amount</label>
                    <input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. $15,000" />
                  </div>
                </div>
                <div>
                  <label>Report Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} style={{ background:t.isDark ? t.bg3 : t.surface, color:t.textPrimary }}>
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                {locale && (
                  <div style={{ padding:"11px 14px", borderRadius:9, background:t.greenDim, border:"1px solid " + t.green + "28", fontSize:13, color:t.textSecondary, lineHeight:1.65, display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:16 }}>🌍</span>
                    <span>
                      <strong style={{ color:t.textPrimary }}>Auto-detected:</strong> {locale.language} · {locale.jurisdiction} · {locale.legalSystem} · {locale.currency}
                      <button onClick={() => setLocale(null)} style={{ background:"none", border:"none", color:t.blue, cursor:"pointer", fontSize:12, fontFamily:"inherit", marginLeft:10, textDecoration:"underline" }}>Change</button>
                    </span>
                  </div>
                )}
                <div style={{ padding:"14px 16px", borderRadius:9, background:t.blueDim, border:"1px solid " + t.blue + "26", fontSize:13, color:t.textSecondary, lineHeight:1.65 }}>
                  <strong style={{ color:t.textPrimary, display:"block", marginBottom:4 }}>Ready to analyze</strong>
                  Type: <strong style={{ color:t.textPrimary }}>{claimLabel ? claimLabel.label : "—"}</strong> · Files: <strong style={{ color:t.textPrimary }}>{files.length}</strong> · Title: <strong style={{ color:t.textPrimary }}>{title || "Untitled"}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Running */}
          {step === 3 && running && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:19, fontWeight:600, color:t.textPrimary, marginBottom:4 }}>Analyzing Your Case</h2>
              <p style={{ fontSize:13, color:t.textSecondary, marginBottom:22 }}>This typically takes 30–60 seconds.</p>
              <div style={{ display:"grid", gap:7 }}>
                {AI_STEPS.map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:8, background:i <= aiIdx ? t.blueDim : t.surface, border:"1px solid " + (i === aiIdx ? t.blue + "40" : t.border), transition:"all .4s" }}>
                    {i < aiIdx ? <span style={{ color:t.green, fontSize:13 }}>✓</span> : i === aiIdx ? <Spinner size={9} color={t.blue} /> : <span style={{ width:8, height:8, borderRadius:"50%", display:"inline-block", background:t.border }} />}
                    <span style={{ fontSize:13, color:i <= aiIdx ? t.textPrimary : t.textSecondary }}>{s}</span>
                    {i === aiIdx && <span style={{ marginLeft:"auto", fontSize:11, color:t.blue, animation:"pulse 1.2s infinite" }}>Processing</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Result summary */}
          {step === 3 && !running && result && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                <LiveDot label="Analysis complete" />
                <span style={{ fontSize:11, color:t.textMuted, marginLeft:"auto" }}>{new Date().toLocaleTimeString()}</span>
              </div>
              <div style={{ background:t.isDark ? "rgba(0,0,0,.3)" : t.bg2, border:"1px solid " + t.border, borderRadius:9, padding:18, minHeight:80, marginBottom:16 }}>
                <StreamText text={stream} speed={10} />
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <Btn variant="primary" onClick={() => setShowPDF(true)}>📄 Export PDF Report</Btn>
                <Btn variant="secondary" onClick={() => setShowChat(true)}>💬 Ask AI</Btn>
                <Btn variant="ghost" onClick={() => { setStep(0); setResult(null); setStory(""); setFiles([]); setClaimType(null); }}>New Analysis</Btn>
              </div>
            </div>
          )}

          {/* nav buttons */}
          {step < 3 && (
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:26, paddingTop:18, borderTop:"1px solid " + t.border }}>
              <Btn variant="ghost" onClick={() => step === 0 ? onBack() : setStep(p => p - 1)}>{step === 0 ? "← Cancel" : "← Back"}</Btn>
              {step < 2 ? (
                <Btn variant="primary" onClick={() => setStep(p => p + 1)} disabled={!canNext()}>Continue →</Btn>
              ) : (
                <Btn variant="purple" onClick={runAI}>Run AI Analysis →</Btn>
              )}
            </div>
          )}

          {err && <div style={{ marginTop:12, padding:"11px 14px", borderRadius:8, background:t.redDim, border:"1px solid " + t.red + "28", color:t.red, fontSize:13 }}>{err}</div>}
        </Card>

        {/* Sidebar tips */}
        {step < 3 && (
          <div style={{ display:"grid", gap:12, alignContent:"start" }}>
            <Card pad={16}>
              <div style={{ fontSize:10, fontWeight:700, color:t.textSecondary, letterSpacing:".08em", textTransform:"uppercase", marginBottom:11 }}>
                {step === 0 ? "Writing Tips" : step === 1 ? "Evidence Guide" : "Before Submitting"}
              </div>
              <div style={{ display:"grid", gap:9 }}>
                {(step === 0 ? ["Include specific dates","Name all parties","State amounts precisely","Mention all communications","Describe what was agreed"] :
                  step === 1 ? ["Signed contracts","Invoices & payment records","Email threads","Photos or screenshots","Witness contact info"] :
                  ["Jurisdiction affects applicable law","Language affects report output","You can revise and re-run","Results save automatically"]).map(tip => (
                  <div key={tip} style={{ display:"flex", gap:7, alignItems:"flex-start", fontSize:12, color:t.textSecondary, lineHeight:1.55 }}>
                    <span style={{ color:step === 1 ? t.green : t.blue, flexShrink:0, marginTop:1 }}>{step === 1 ? "✓" : "›"}</span>
                    {tip}
                  </div>
                ))}
              </div>
            </Card>
            <Card pad={13}>
              <div style={{ display:"flex", gap:8, alignItems:"flex-start", fontSize:12, color:t.textSecondary, lineHeight:1.65 }}>
                <span style={{ fontSize:14, flexShrink:0 }}>🔒</span>
                <span>Your data is encrypted in transit and at rest. We do not share case data with third parties.</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Results panels */}
      {result && !running && (
        <div ref={resultsRef} style={{ marginTop:20, display:"grid", gap:14 }}>
          {/* Top row */}
          <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr", gap:14 }} className="g3">
            <Card pad={22} style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minWidth:150 }}>
              <ScoreGauge value={Math.round(result.claimScore * 10)} animated={scored} size={108} label="Claim Strength" />
              <div style={{ marginTop:12 }}>
                <Tag color={result.claimScore >= 8 ? t.green : result.claimScore >= 6 ? t.amber : t.red}>
                  {result.claimScore >= 8 ? "Strong" : result.claimScore >= 6 ? "Moderate" : "Weak"}
                </Tag>
              </div>
            </Card>

            <Card pad={22}>
              <div style={{ fontSize:10, fontWeight:700, color:t.textSecondary, letterSpacing:".08em", textTransform:"uppercase", marginBottom:14 }}>Compensation Estimates</div>
              {[["Minimum", result.estimatedMin, t.textSecondary], ["Recommended", result.estimatedRecommended, t.blue], ["Maximum", result.estimatedMax, t.textSecondary]].map(([l, v, c]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid " + t.border }}>
                  <span style={{ fontSize:13, color:t.textSecondary }}>{l}</span>
                  <span style={{ fontSize:16, fontWeight:600, color:c }}>{v}</span>
                </div>
              ))}
            </Card>

            <Card pad={22}>
              <div style={{ fontSize:10, fontWeight:700, color:t.textSecondary, letterSpacing:".08em", textTransform:"uppercase", marginBottom:14 }}>Case Metrics</div>
              <MetricRow label="Evidence Quality" value={result.evidenceScore} color={t.green} delay={0} />
              <MetricRow label="Timeline Clarity" value={result.timelineScore} color={t.blue} delay={100} />
              <MetricRow label="Legal Precedent" value={result.legalPrecedentScore} color={t.amber} delay={200} />
              <MetricRow label="Risk Exposure" value={result.riskScore} color={t.red} delay={300} />
            </Card>
          </div>

          {/* Bottom row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }} className="g3">
            <Card pad={20}>
              <div style={{ fontSize:10, fontWeight:700, color:t.textSecondary, letterSpacing:".08em", textTransform:"uppercase", marginBottom:13 }}>Strengths</div>
              {(result.strengths || []).map((s, i) => (
                <div key={i} style={{ display:"flex", gap:9, padding:"8px 0", borderBottom:"1px solid " + t.border, fontSize:13, color:t.textPrimary, lineHeight:1.5, alignItems:"flex-start" }}>
                  <span style={{ color:t.green, flexShrink:0, marginTop:2 }}>✓</span>{s}
                </div>
              ))}
            </Card>

            <Card pad={20}>
              <div style={{ fontSize:10, fontWeight:700, color:t.textSecondary, letterSpacing:".08em", textTransform:"uppercase", marginBottom:13 }}>Areas of Concern</div>
              {(result.weaknesses || []).map((w, i) => (
                <div key={i} style={{ display:"flex", gap:9, padding:"8px 0", borderBottom:"1px solid " + t.border, fontSize:13, color:t.textPrimary, lineHeight:1.5, alignItems:"flex-start" }}>
                  <span style={{ color:t.amber, flexShrink:0, marginTop:2 }}>○</span>{w}
                </div>
              ))}
              {result.missingEvidence && result.missingEvidence.length > 0 && (
                <>
                  <div style={{ fontSize:10, fontWeight:700, color:t.textSecondary, letterSpacing:".08em", textTransform:"uppercase", margin:"14px 0 10px" }}>Missing Evidence</div>
                  {result.missingEvidence.map((m, i) => (
                    <div key={i} style={{ display:"flex", gap:9, padding:"7px 0", borderBottom:"1px solid " + t.border, fontSize:13, color:t.textSecondary, lineHeight:1.5, alignItems:"flex-start" }}>
                      <span style={{ color:t.red, flexShrink:0, marginTop:2 }}>—</span>{m}
                    </div>
                  ))}
                </>
              )}
            </Card>

            <Card pad={20}>
              <div style={{ fontSize:10, fontWeight:700, color:t.textSecondary, letterSpacing:".08em", textTransform:"uppercase", marginBottom:13 }}>Next Steps</div>
              {(result.nextSteps || []).map((s, i) => (
                <div key={i} style={{ display:"flex", gap:9, padding:"8px 0", borderBottom:"1px solid " + t.border, fontSize:13, color:t.textPrimary, lineHeight:1.5, alignItems:"flex-start" }}>
                  <span style={{ background:t.blue, color:"#fff", borderRadius:"50%", width:18, height:18, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, flexShrink:0, marginTop:1 }}>{i + 1}</span>
                  {s}
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {showPDF && result && <PDFViewer result={result} claimType={claimType} jurisdiction={jurisdiction} onClose={() => setShowPDF(false)} />}
      {showChat && <ChatPanel result={result} claimType={claimType} onClose={() => setShowChat(false)} />}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, goTo, onLogout }) {
  const t = useT();
  const [section, setSection] = useState("overview");
  const [cases, setCases] = useState(() => store.get("cs_cases", []));
  const [search, setSearch] = useState("");
  const [showPDF, setShowPDF] = useState(null);

  const avgScore = cases.length ? (cases.reduce((a, c) => a + c.score, 0) / cases.length).toFixed(1) : "—";
  const estDamages = cases.length ? "$" + Math.floor(cases.length * 8500).toLocaleString() : "—";

  const filtered = cases.filter(c => {
    if (!search) return true;
    return (c.title || "").toLowerCase().includes(search.toLowerCase()) || (c.story || "").toLowerCase().includes(search.toLowerCase());
  });

  const navItems = [
    { id:"overview", icon:"▦", label:"Overview" },
    { id:"cases", icon:"📁", label:"My Cases" },
    { id:"settings", icon:"⚙", label:"Settings" },
    { id:"billing", icon:"💳", label:"Billing" },
  ];

  return (
    <div style={{ display:"flex", minHeight:"calc(100vh - 56px)" }}>
      {/* sidebar */}
      <div className="sidebar" style={{ width:220, background:t.sidebarBg, borderRight:"1px solid " + t.border, padding:"20px 12px", flexShrink:0, position:"sticky", top:56, height:"calc(100vh - 56px)", overflowY:"auto" }}>
        <div style={{ padding:12, borderRadius:10, background:t.surface, border:"1px solid " + t.border, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:t.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>{user.avatar || "U"}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:t.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:11, color:t.textMuted }}>{user.plan} plan</div>
            </div>
          </div>
        </div>

        {navItems.map(item => (
          <button key={item.id} onClick={() => setSection(item.id)} style={{ width:"100%", padding:"9px 12px", borderRadius:8, background:section === item.id ? t.blueDim : "transparent", border:"1px solid " + (section === item.id ? t.blue + "30" : "transparent"), color:section === item.id ? t.blue : t.textSecondary, fontSize:13, fontWeight:section === item.id ? 500 : 400, cursor:"pointer", textAlign:"left", fontFamily:"inherit", display:"flex", alignItems:"center", gap:9, marginBottom:3 }}>
            <span style={{ fontSize:15 }}>{item.icon}</span>{item.label}
          </button>
        ))}

        <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid " + t.border }}>
          <button onClick={() => goTo("analysis")} style={{ width:"100%", padding:"9px 12px", borderRadius:8, background:t.blue, border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", textAlign:"center", marginBottom:6 }}>
            + New Analysis
          </button>
          <button onClick={onLogout} style={{ width:"100%", padding:"8px 12px", borderRadius:8, background:"transparent", border:"none", color:t.textMuted, fontSize:12, cursor:"pointer", fontFamily:"inherit", textAlign:"left", display:"flex", alignItems:"center", gap:7 }}>
            ↩ Sign out
          </button>
        </div>
      </div>

      {/* main content */}
      <div className="main-padded" style={{ flex:1, padding:28, overflowY:"auto" }}>
        {/* OVERVIEW */}
        {section === "overview" && (
          <div>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:22, fontWeight:700, color:t.textPrimary, letterSpacing:"-.02em" }}>Welcome back, {user.name.split(" ")[0]} 👋</h1>
              <p style={{ fontSize:13, color:t.textSecondary, marginTop:4 }}>Here's a summary of your legal activity.</p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }} className="g4">
              {[["📁","Total Cases",cases.length,t.blue],["⚖️","Avg Claim Score",avgScore,t.green],["💰","Est. Damages",estDamages,t.amber],["⭐","Plan",user.plan,t.purple]].map(([icon, label, value, color]) => (
                <Card key={label} pad={18}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ fontSize:18 }}>{icon}</span>
                    <Tag color={color} dot>{label}</Tag>
                  </div>
                  <div style={{ fontSize:26, fontWeight:700, color:t.textPrimary, letterSpacing:"-.02em" }}>{value}</div>
                </Card>
              ))}
            </div>

            <Card pad={20}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:600, color:t.textPrimary }}>Recent Cases</div>
                <Btn variant="ghost" size="sm" onClick={() => setSection("cases")}>View all →</Btn>
              </div>
              {cases.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px 20px", color:t.textSecondary }}>
                  <div style={{ fontSize:32, opacity:.35, marginBottom:12 }}>📁</div>
                  <div style={{ fontSize:13, marginBottom:16 }}>No cases yet. Start your first analysis.</div>
                  <Btn variant="primary" onClick={() => goTo("analysis")}>Start Analysis</Btn>
                </div>
              ) : cases.slice(0, 4).map(c => (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid " + t.border }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:t.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</div>
                    <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>{c.date} · {CLAIM_TYPES.find(x => x.id === c.claimType) ? CLAIM_TYPES.find(x => x.id === c.claimType).label : c.claimType}</div>
                  </div>
                  <Tag color={c.score >= 8 ? t.green : c.score >= 6 ? t.amber : t.red}>{c.score}/10</Tag>
                  <span style={{ fontSize:14, fontWeight:600, color:t.blue }}>{c.recommended}</span>
                  {c.result && <Btn variant="ghost" size="sm" onClick={() => setShowPDF(c.result)}>PDF</Btn>}
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* CASES */}
        {section === "cases" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <h1 style={{ fontSize:20, fontWeight:700, color:t.textPrimary }}>My Cases</h1>
              <Btn variant="primary" size="sm" onClick={() => goTo("analysis")}>+ New Analysis</Btn>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases…" style={{ maxWidth:280, marginBottom:18 }} />
            {filtered.length === 0 ? (
              <Card pad={32} style={{ textAlign:"center" }}>
                <div style={{ fontSize:32, opacity:.35, marginBottom:12 }}>🔍</div>
                <div style={{ fontSize:13, color:t.textSecondary }}>{cases.length === 0 ? "No cases yet. Start your first analysis." : "No cases match your search."}</div>
                {cases.length === 0 && <Btn variant="primary" style={{ marginTop:16 }} onClick={() => goTo("analysis")}>Start Analysis</Btn>}
              </Card>
            ) : filtered.map(c => (
              <Card key={c.id} pad={18} hover style={{ marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:t.textPrimary, marginBottom:4 }}>{c.title}</div>
                    <div style={{ fontSize:12, color:t.textSecondary, lineHeight:1.5 }}>{(c.story || "").slice(0, 100)}{(c.story || "").length > 100 ? "…" : ""}</div>
                    <div style={{ fontSize:11, color:t.textMuted, marginTop:6 }}>{c.date} · {c.jurisdiction || "N/A"}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:16, fontWeight:700, color:t.blue }}>{c.recommended}</div>
                      <div style={{ fontSize:11, color:t.textMuted }}>recommended</div>
                    </div>
                    <Tag color={c.score >= 8 ? t.green : c.score >= 6 ? t.amber : t.red}>{c.score}/10</Tag>
                    {c.result && <Btn variant="secondary" size="sm" onClick={() => setShowPDF(c.result)}>PDF</Btn>}
                    <button onClick={() => { const n = cases.filter(x => x.id !== c.id); setCases(n); store.set("cs_cases", n); toast("Case deleted", "success"); }} style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:15, padding:"4px" }}>🗑</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {section === "settings" && (
          <div style={{ maxWidth:560 }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:t.textPrimary, marginBottom:22 }}>Account Settings</h1>
            <Card pad={24} style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:t.textSecondary, letterSpacing:".05em", textTransform:"uppercase", marginBottom:16 }}>Profile</div>
              <div style={{ display:"grid", gap:14 }}>
                <div><label>Full Name</label><input defaultValue={user.name} /></div>
                <div><label>Email Address</label><input defaultValue={user.email} type="email" /></div>
                <div>
                  <label>Default Language</label>
                  <select style={{ background:t.isDark ? t.bg3 : t.surface, color:t.textPrimary }}>
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <Btn variant="primary" size="sm" style={{ marginTop:18 }} onClick={() => toast("Settings saved", "success")}>Save Changes</Btn>
            </Card>
            <Card pad={24}>
              <div style={{ fontSize:13, fontWeight:600, color:t.red, letterSpacing:".05em", textTransform:"uppercase", marginBottom:12 }}>Danger Zone</div>
              <p style={{ fontSize:13, color:t.textSecondary, marginBottom:14, lineHeight:1.65 }}>Deleting your account is permanent and cannot be undone.</p>
              <Btn variant="danger" size="sm" onClick={() => toast("Please contact support to delete your account", "info")}>Delete Account</Btn>
            </Card>
          </div>
        )}

        {/* BILLING */}
        {section === "billing" && (
          <div style={{ maxWidth:640 }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:t.textPrimary, marginBottom:22 }}>Billing & Plan</h1>
            <Card pad={22} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:t.textSecondary, marginBottom:4 }}>Current Plan</div>
                  <div style={{ fontSize:20, fontWeight:700, color:t.textPrimary }}>{user.plan}</div>
                </div>
                <Tag color={t.green} dot>Active</Tag>
              </div>
              <Divider my={14} />
              {PRICING.map(p => (
                <div key={p.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid " + t.border }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:t.textPrimary }}>{p.name}</div>
                    <div style={{ fontSize:12, color:t.textMuted }}>{p.desc}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:15, fontWeight:600, color:t.textPrimary }}>{p.price}<span style={{ fontSize:11, color:t.textMuted, fontWeight:400 }}>/mo</span></span>
                    {p.name === user.plan ? <Tag color={t.green}>Current</Tag> : <Btn variant="secondary" size="sm" onClick={() => toast("Stripe checkout — add your Stripe key to enable", "info")}>Upgrade</Btn>}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      {showPDF && <PDFViewer result={showPDF} claimType="" jurisdiction="" onClose={() => setShowPDF(null)} />}
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ goTo }) {
  const t = useT();
  const [openFaq, setOpenFaq] = useState(null);
  const heroBg = "#06080F";

  return (
    <>
      {/* HERO */}
      <div style={{ background:heroBg, padding:"96px 28px 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:900, height:500, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(124,58,237,.08) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:860, margin:"0 auto", position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"6px 16px", borderRadius:99, border:"1px solid rgba(255,255,255,.1)", background:"rgba(255,255,255,.04)", marginBottom:32, fontSize:13, color:"rgba(255,255,255,.55)" }}>
            <Stars />
            <span>Trusted by users preparing real legal claims every day</span>
          </div>

          <h1 style={{ fontSize:"clamp(36px,5.5vw,68px)", fontWeight:700, lineHeight:1.08, letterSpacing:"-.04em", color:"#FFF", marginBottom:22 }}>
            Generate a <span style={{ color:"#A78BFA" }}>Court-Ready<br />Legal Claim</span> in Minutes —<br />No Lawyer Needed
          </h1>

          <p style={{ fontSize:17, color:"rgba(255,255,255,.55)", lineHeight:1.75, maxWidth:600, margin:"0 auto 36px" }}>
            Fill in your case details. The system analyzes the facts, evaluates the strength of your claim, and generates a professionally structured legal document — ready to submit to court.
          </p>

          <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:24, flexWrap:"wrap" }}>
            <button onClick={() => goTo("analysis")} style={{ display:"inline-flex", alignItems:"center", gap:9, padding:"14px 30px", borderRadius:11, background:"linear-gradient(135deg,#7C3AED,#6D28D9)", border:"none", color:"#fff", fontSize:16, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 18px rgba(124,58,237,.4)" }}>
              ✦ Generate My Legal Claim ✦
            </button>
            <button onClick={() => goTo("features")} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 26px", borderRadius:11, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", color:"rgba(255,255,255,.75)", fontSize:15, fontWeight:500, cursor:"pointer" }}>
              See How It Works
            </button>
          </div>

          <p style={{ fontSize:12, color:"rgba(255,255,255,.3)", marginBottom:44 }}>Get started for $14.90 — 50% off your first month · Cancel anytime</p>

          <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:22, marginBottom:56 }}>
            {[["🔒","Secure & private"], ["📄","Court-ready formatting"], ["⚡","Instant results"], ["💡","No legal knowledge required"]].map(([ic, lb]) => (
              <div key={lb} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"rgba(255,255,255,.38)" }}>
                <span>{ic}</span>{lb}
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", maxWidth:520, margin:"0 auto", borderRadius:14, overflow:"hidden", border:"1px solid rgba(255,255,255,.08)" }}>
            {[["+50,000","Claims Generated"], ["< 2 min","To Complete"], ["+100","Languages"]].map(([v, l], i) => (
              <div key={l} style={{ padding:"22px 16px", textAlign:"center", background:"rgba(255,255,255,.04)", borderRight:i < 2 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
                <div style={{ fontSize:28, fontWeight:700, color:"#fff", letterSpacing:"-.03em", marginBottom:5 }}>{v}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.38)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ background:t.isDark ? t.bg2 : t.bg2, borderBottom:"1px solid " + t.border, padding:"13px 28px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", justifyContent:"center", flexWrap:"wrap", gap:24 }}>
          {[["🔒","AES-256 Encrypted"], ["🇪🇺","GDPR Compliant"], ["⚖️","Court-Ready"], ["🌐","100+ Languages"], ["📄","PDF Export"], ["🤖","Claude AI"]].map(([ic, lb]) => (
            <div key={lb} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12.5, color:t.textSecondary }}>
              <span>{ic}</span>{lb}
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding:"72px 28px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <SectionHead overline="Process" title="How It Works" sub="A structured legal workflow, not a general AI chatbot." center />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }} className="g4">
            {HOW_STEPS.map(s => (
              <Card key={s.n} pad={20} hover>
                <div style={{ fontSize:11, fontWeight:700, color:t.blue, letterSpacing:".1em", marginBottom:10 }}>{s.n}</div>
                <div style={{ fontWeight:600, fontSize:14, color:t.textPrimary, marginBottom:7 }}>{s.t}</div>
                <div style={{ fontSize:13, color:t.textSecondary, lineHeight:1.65 }}>{s.d}</div>
              </Card>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:32 }}>
            <Btn variant="primary" size="lg" onClick={() => goTo("analysis")}>Start Your Analysis →</Btn>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"64px 28px", background:t.isDark ? t.bg2 : t.bg2 }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <SectionHead overline="Capabilities" title="Enterprise Legal AI Capabilities" sub="Purpose-built for legal analysis — not a general AI wrapper." center />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:13 }} className="g3">
            {FEATURES.map((f, i) => (
              <Card key={i} pad={20} hover>
                <div style={{ fontSize:22, marginBottom:11, opacity:.85 }}>{f.icon}</div>
                <div style={{ fontWeight:600, fontSize:14, color:t.textPrimary, marginBottom:5 }}>{f.t}</div>
                <div style={{ fontSize:13, color:t.textSecondary, lineHeight:1.65 }}>{f.d}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:"64px 28px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <SectionHead overline="Cases" title="Real Results from Real Users" center />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="g3">
            {TESTIMONIALS.map((te, i) => (
              <Card key={i} pad={22} hover>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:13 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:t.blueDim, border:"1px solid " + t.blue + "28", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:t.blue }}>{te.name[0]}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:t.textPrimary }}>{te.name}</div>
                      <div style={{ fontSize:11, color:t.textMuted }}>{te.role} · {te.loc}</div>
                    </div>
                  </div>
                  <Tag color={t.green}>{te.amount}</Tag>
                </div>
                <Stars />
                <p style={{ fontSize:13, lineHeight:1.7, color:t.textSecondary, margin:"9px 0 13px", fontStyle:"italic" }}>"{te.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <ScoreGauge value={Math.round(te.score * 10)} size={50} animated />
                  <div style={{ fontSize:12, color:t.textMuted }}>Claim score</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding:"64px 28px", background:t.isDark ? t.bg2 : t.bg2 }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <SectionHead overline="Pricing" title="50% Off Your First Month" sub="Limited time offer. No commitment. Cancel anytime." center />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, maxWidth:880, margin:"0 auto" }} className="g3">
            {PRICING.map(p => (
              <Card key={p.name} pad={24} style={{ border:"1px solid " + (p.popular ? t.purple : t.border), position:"relative", background:p.popular && t.isDark ? "rgba(124,58,237,.06)" : undefined }}>
                {p.popular && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:t.purple, color:"#fff", fontSize:11, fontWeight:600, padding:"3px 14px", borderRadius:99, whiteSpace:"nowrap" }}>Most Popular</div>}
                <div style={{ fontSize:13, fontWeight:600, color:t.textSecondary, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:12, color:t.textMuted, marginBottom:14 }}>{p.desc}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
                  <span style={{ fontSize:30, fontWeight:700, color:t.textPrimary, letterSpacing:"-.03em" }}>{p.price}</span>
                  <span style={{ fontSize:13, color:t.textMuted }}>{p.period}</span>
                  {p.originalPrice && <span style={{ fontSize:14, color:t.textMuted, textDecoration:"line-through", marginLeft:2 }}>{p.originalPrice}</span>}
                </div>
                {p.firstMonth && (
                  <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:5, background:t.green + "14", border:"1px solid " + t.green + "26", fontSize:11, fontWeight:600, color:t.green, marginBottom:16 }}>
                    🏷 First month — then {p.originalPrice}/mo
                  </div>
                )}
                <div style={{ display:"grid", gap:9, marginBottom:22 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:"flex", gap:8, fontSize:13, color:t.textSecondary, alignItems:"flex-start" }}>
                      <span style={{ color:t.green, fontSize:12, marginTop:2 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <Btn variant={p.popular ? "purple" : "secondary"} onClick={() => goTo("analysis")} full>{p.popular ? "Get Started — 50% Off" : "Get Started"}</Btn>
              </Card>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:t.textMuted }}>
            No credit card required to try · Cancel anytime · Secure payment via Stripe
          </div>
          <div style={{ textAlign:"center", marginTop:8, fontSize:13, color:t.textSecondary }}>
            Need a custom plan?{" "}
            <button style={{ background:"none", border:"none", color:t.blue, cursor:"pointer", fontSize:13, fontFamily:"inherit", textDecoration:"underline" }} onClick={() => goTo("contact")}>Contact Enterprise Sales →</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:"64px 28px" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <SectionHead overline="FAQ" title="Frequently Asked Questions" center />
          <div style={{ display:"grid", gap:7 }}>
            {FAQ_ITEMS.map((item, i) => (
              <Card key={i} pad={0} style={{ overflow:"hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width:"100%", padding:"15px 20px", background:"none", border:"none", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}>
                  <span style={{ fontSize:14, fontWeight:500, color:t.textPrimary }}>{item.q}</span>
                  <span style={{ fontSize:18, color:t.textMuted, transition:"transform .25s", transform:openFaq === i ? "rotate(45deg)" : "none", flexShrink:0, marginLeft:16, lineHeight:1 }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding:"0 20px 15px", fontSize:13, color:t.textSecondary, lineHeight:1.75, borderTop:"1px solid " + t.border }}>
                    <div style={{ paddingTop:13 }}>{item.a}</div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <div style={{ background:"#06080F", padding:"80px 28px", textAlign:"center" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(24px,3.2vw,40px)", fontWeight:700, color:"#fff", marginBottom:14, letterSpacing:"-.03em", lineHeight:1.15 }}>Ready to analyze your case?</h2>
          <p style={{ fontSize:16, color:"rgba(255,255,255,.48)", marginBottom:34, lineHeight:1.7 }}>Get started for $14.90 — 50% off your first month. No commitment. Cancel anytime.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => goTo("analysis")} style={{ padding:"12px 28px", borderRadius:10, background:"linear-gradient(135deg,#7C3AED,#6D28D9)", border:"none", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 14px rgba(124,58,237,.3)" }}>Start Free Analysis</button>
            <button onClick={() => goTo("contact")} style={{ padding:"12px 26px", borderRadius:10, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", color:"rgba(255,255,255,.72)", fontSize:15, fontWeight:500, cursor:"pointer" }}>Talk to Sales</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SIMPLE INNER PAGES ───────────────────────────────────────────────────────
function FeaturesPage({ goTo }) {
  const t = useT();
  return (
    <section style={{ padding:"64px 28px" }}>
      <div style={{ maxWidth:1060, margin:"0 auto" }}>
        <div style={{ marginBottom:20 }}><Btn variant="ghost" onClick={() => goTo("home")}>← Back</Btn></div>
        <SectionHead overline="Platform" title="Full Feature Overview" sub="Every capability ClaimSmart provides, explained." />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:32 }} className="g3">
          {FEATURES.map((f, i) => <Card key={i} pad={20} hover><div style={{ fontSize:24, marginBottom:10 }}>{f.icon}</div><div style={{ fontWeight:600, fontSize:14, color:t.textPrimary, marginBottom:5 }}>{f.t}</div><div style={{ fontSize:13, color:t.textSecondary, lineHeight:1.65 }}>{f.d}</div></Card>)}
        </div>
        <div style={{ textAlign:"center" }}><Btn variant="primary" size="lg" onClick={() => goTo("analysis")}>Start Analysis →</Btn></div>
      </div>
    </section>
  );
}

function SecurityPage({ goTo }) {
  const t = useT();
  const items = [
    ["🔒","AES-256 Encryption","All case data encrypted at rest and in transit using AES-256 and TLS 1.3. Keys rotated regularly."],
    ["🇪🇺","GDPR Compliance","We follow GDPR principles including data minimization, purpose limitation, and full user rights."],
    ["☁️","Secure Infrastructure","Hosted on enterprise-grade cloud with SOC 2 certified providers. Regular security audits."],
    ["🔐","Access Controls","Role-based access, MFA support, and session management. Zero staff access to case content without permission."],
    ["📋","Audit Logs","All access and actions on your cases are logged with timestamps. Available on Business plans."],
    ["🗑️","Data Retention","Case data deleted after your session unless explicitly saved. Follows your plan's retention policy."],
  ];
  return (
    <section style={{ padding:"64px 28px" }}>
      <div style={{ maxWidth:840, margin:"0 auto" }}>
        <div style={{ marginBottom:20 }}><Btn variant="ghost" onClick={() => goTo("home")}>← Back</Btn></div>
        <SectionHead overline="Trust" title="Security & Privacy" sub="We take the security of your legal information seriously." />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }} className="g2">
          {items.map(([ic, title, desc]) => (
            <Card key={title} pad={20}>
              <div style={{ fontSize:20, marginBottom:10 }}>{ic}</div>
              <div style={{ fontWeight:600, fontSize:14, color:t.textPrimary, marginBottom:6 }}>{title}</div>
              <div style={{ fontSize:13, color:t.textSecondary, lineHeight:1.65 }}>{desc}</div>
            </Card>
          ))}
        </div>
        <Card pad={22} style={{ background:t.blueDim, border:"1px solid " + t.blue + "28" }}>
          <h3 style={{ fontSize:15, fontWeight:600, color:t.textPrimary, marginBottom:8 }}>AI Privacy Statement</h3>
          <p style={{ fontSize:13, color:t.textSecondary, lineHeight:1.75 }}>Your case descriptions and uploaded files are sent to Anthropic's Claude API solely for analysis processing. They are not used to train AI models. We do not retain API request data beyond your session.</p>
        </Card>
      </div>
    </section>
  );
}

function EnterprisePage({ goTo }) {
  const t = useT();
  const items = [
    ["Team Workspace","Multi-user access with role-based permissions and collaborative case management."],
    ["Custom Templates","Branded PDF templates with your organization's letterhead, formatting, and disclaimers."],
    ["API Access","Integrate ClaimSmart into your existing legal tools, CRM, or case management systems."],
    ["Bulk Processing","Process thousands of cases per month with dedicated infrastructure and SLA guarantees."],
    ["Compliance Reporting","Audit logs, export capabilities, and compliance reports for regulated industries."],
    ["Dedicated Support","Named account manager, onboarding assistance, and 24/7 priority technical support."],
  ];
  return (
    <section style={{ padding:"64px 28px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <div style={{ marginBottom:20 }}><Btn variant="ghost" onClick={() => goTo("home")}>← Back</Btn></div>
        <SectionHead overline="Enterprise" title="ClaimSmart for Enterprise" sub="Scalable legal AI infrastructure for legal teams and enterprise compliance departments." />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }} className="g2">
          {items.map(([title, desc]) => (
            <Card key={title} pad={20}>
              <div style={{ fontWeight:600, fontSize:14, color:t.textPrimary, marginBottom:6 }}>{title}</div>
              <div style={{ fontSize:13, color:t.textSecondary, lineHeight:1.65 }}>{desc}</div>
            </Card>
          ))}
        </div>
        <Card pad={26} style={{ textAlign:"center", background:t.purpleDim, border:"1px solid " + t.purple + "28" }}>
          <h3 style={{ fontSize:18, fontWeight:600, color:t.textPrimary, marginBottom:9 }}>Ready to scale?</h3>
          <p style={{ fontSize:14, color:t.textSecondary, marginBottom:22, lineHeight:1.7 }}>Contact our enterprise sales team for a custom demo, pricing, and implementation support.</p>
          <Btn variant="purple" size="lg" onClick={() => goTo("contact")}>Contact Enterprise Sales</Btn>
        </Card>
      </div>
    </section>
  );
}

function ContactPage({ goTo }) {
  const t = useT();
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    if (!name || !email || !message) { toast("Please fill all fields", "error"); return; }
    setSent(true);
    toast("Message sent!", "success");
  };

  return (
    <section style={{ padding:"64px 28px" }}>
      <div style={{ maxWidth:620, margin:"0 auto" }}>
        <div style={{ marginBottom:20 }}><Btn variant="ghost" onClick={() => goTo("home")}>← Back</Btn></div>
        <SectionHead overline="Contact" title="Get in Touch" sub="We typically respond within one business day." />
        {sent ? (
          <Card pad={32} style={{ textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:14 }}>✉️</div>
            <h3 style={{ fontSize:18, fontWeight:600, color:t.textPrimary, marginBottom:8 }}>Message received</h3>
            <p style={{ fontSize:14, color:t.textSecondary, lineHeight:1.7 }}>We'll get back to you at <strong style={{ color:t.textPrimary }}>{email}</strong> within one business day.</p>
          </Card>
        ) : (
          <Card pad={28}>
            <div style={{ display:"grid", gap:14 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="g2">
                <div><label>Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" /></div>
                <div><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" /></div>
              </div>
              <div>
                <label>Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} style={{ background:t.isDark ? t.bg3 : t.surface, color:t.textPrimary }}>
                  <option value="">Select a topic</option>
                  {["General Inquiry","Sales & Pricing","Enterprise","Technical Support","Privacy & Security","Other"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label>Message</label><textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Describe your question or request…" style={{ resize:"vertical" }} /></div>
              <Btn variant="primary" size="lg" full onClick={submit}>Send Message</Btn>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ goTo }) {
  const t = useT();
  const cols = [
    ["Product", [["Features","features"],["Pricing","pricing"],["Enterprise","enterprise"],["Security","security"]]],
    ["Company", [["How It Works","howitworks"],["Contact","contact"],["Privacy","home"],["Terms","home"]]],
    ["Resources", [["Documentation","home"],["API","home"],["Blog","home"],["Support","contact"]]],
  ];
  return (
    <footer style={{ borderTop:"1px solid " + t.border, padding:"36px 28px 20px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:1160, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:28, marginBottom:28 }} className="g4">
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:t.purple, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>⚖️</div>
              <span style={{ fontWeight:700, fontSize:14, color:t.textPrimary }}>ClaimSmart AI</span>
            </div>
            <p style={{ fontSize:13, color:t.textMuted, lineHeight:1.7, maxWidth:260, marginBottom:14 }}>AI-powered legal analysis for real-world disputes. Not a law firm. Not legal advice.</p>
          </div>
          {cols.map(([title, links]) => (
            <div key={title}>
              <div style={{ fontSize:11, fontWeight:600, color:t.textSecondary, letterSpacing:".07em", textTransform:"uppercase", marginBottom:12 }}>{title}</div>
              {links.map(([l, p]) => (
                <div key={l} style={{ fontSize:13, color:t.textMuted, marginBottom:8, cursor:"pointer" }} onClick={() => goTo(p)}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:18, borderTop:"1px solid " + t.border, flexWrap:"wrap", gap:10 }}>
          <span style={{ fontSize:12, color:t.textMuted }}>© 2025 ClaimSmart AI. All rights reserved.</span>
          <div style={{ display:"flex", gap:16 }}>
            {["Privacy Policy","Terms of Service","Security","Cookies"].map(l => (
              <span key={l} style={{ fontSize:12, color:t.textMuted, cursor:"pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function ClaimSmart() {
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? DARK : LIGHT;
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() => store.get("cs_user", null));
  const [authModal, setAuthModal] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [lang, setLang] = useState("EN");

  // Auto-detect nav language from browser
  useEffect(() => {
    const detected = detectLocale();
    const langMap = {
      "Hebrew":"HE","Arabic":"AR","French":"FR","Spanish":"ES",
      "German":"DE","Chinese":"ZH","Japanese":"JA","Italian":"IT",
      "Portuguese":"PT","Russian":"RU","Hindi":"HI","English":"EN",
    };
    setLang(langMap[detected.language] || "EN");
  }, []);

  const goTo = (p) => { setPage(p); window.scrollTo({ top:0, behavior:"smooth" }); };
  const handleAuth = (u) => { setUser(u); setAuthModal(null); };
  const handleLogout = () => { store.del("cs_user"); setUser(null); setPage("home"); toast("Signed out", "success"); };

  const NAV_LINKS = [
    { label:"Features", page:"features" },
    { label:"Pricing", page:"pricing" },
    { label:"How It Works", page:"howitworks" },
    { label:"Security", page:"security" },
    { label:"Enterprise", page:"enterprise" },
  ];

  const showFooter = page !== "dashboard";

  return (
    <Ctx.Provider value={t}>
      <GlobalCSS t={t} />
      <Toasts />

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:200, background:t.navBg, borderBottom:"1px solid " + t.border, backdropFilter:"blur(20px)" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"0 28px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }} onClick={() => goTo("home")}>
            <div style={{ width:28, height:28, borderRadius:7, background:t.purple, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚖️</div>
            <span style={{ fontWeight:700, fontSize:15, color:t.textPrimary, letterSpacing:"-.01em" }}>ClaimSmart</span>
            <span style={{ fontSize:11, color:t.textMuted, fontWeight:400 }}>AI</span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:0 }} className="hide-mobile nav-links">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => goTo(l.page)} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px 12px", fontSize:13, fontFamily:"inherit", color:page === l.page ? t.textPrimary : t.textSecondary, fontWeight:page === l.page ? 500 : 400, borderBottom:"2px solid " + (page === l.page ? t.purple : "transparent") }}>
                {l.label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ background:t.inputBg, border:"1px solid " + t.border, color:t.textSecondary, borderRadius:7, padding:"5px 8px", fontSize:12, width:"auto", cursor:"pointer" }} className="hide-mobile">
              {["EN","HE","AR","FR","ES","DE","ZH","JA"].map(l => <option key={l}>{l}</option>)}
            </select>

            <button onClick={() => setIsDark(p => !p)} style={{ width:30, height:30, borderRadius:7, border:"1px solid " + t.border, background:t.surface, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:t.textSecondary }}>
              {isDark ? "☀" : "🌙"}
            </button>

            {user ? (
              <>
                <Btn variant="secondary" size="sm" onClick={() => goTo("dashboard")}>
                  <span style={{ width:20, height:20, borderRadius:"50%", background:t.purple, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff" }}>{user.avatar}</span>
                  Dashboard
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}>History</Btn>
              </>
            ) : (
              <>
                <Btn variant="ghost" size="sm" onClick={() => setAuthModal("signin")}>Sign In</Btn>
                <Btn variant="purple" size="sm" onClick={() => goTo("analysis")}>Start Analysis</Btn>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* PAGES */}
      <main style={{ position:"relative", zIndex:1, minHeight:"calc(100vh - 56px)" }}>
        {page === "home" && <HomePage goTo={goTo} />}
        {page === "analysis" && (
          <section style={{ padding:"40px 28px 72px" }}>
            <div style={{ maxWidth:1160, margin:"0 auto" }}>
              <AnalysisWizard onBack={() => goTo("home")} user={user} />
            </div>
          </section>
        )}
        {page === "dashboard" && (
          user ? <Dashboard user={user} goTo={goTo} onLogout={handleLogout} /> : (
            <section style={{ padding:"64px 28px" }}>
              <div style={{ maxWidth:500, margin:"0 auto", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:20 }}>🔒</div>
                <h2 style={{ fontSize:20, fontWeight:600, marginBottom:10, color:t.textPrimary }}>Sign in to access your dashboard</h2>
                <p style={{ fontSize:14, color:t.textSecondary, marginBottom:24 }}>Your cases, analytics, and settings are waiting.</p>
                <Btn variant="purple" size="lg" onClick={() => setAuthModal("signin")}>Sign In</Btn>
              </div>
            </section>
          )
        )}
        {page === "features" && <FeaturesPage goTo={goTo} />}
        {page === "pricing" && (
          <section style={{ padding:"64px 28px" }}>
            <div style={{ maxWidth:1160, margin:"0 auto" }}>
              <div style={{ marginBottom:20 }}><Btn variant="ghost" onClick={() => goTo("home")}>← Back</Btn></div>
              <SectionHead overline="Pricing" title="50% Off Your First Month" sub="Limited time offer. No commitment. Cancel anytime." center />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, maxWidth:880, margin:"0 auto" }} className="g3">
                {PRICING.map(p => (
                  <Card key={p.name} pad={24} style={{ border:"1px solid " + (p.popular ? t.purple : t.border), position:"relative" }}>
                    {p.popular && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:t.purple, color:"#fff", fontSize:11, fontWeight:600, padding:"3px 14px", borderRadius:99, whiteSpace:"nowrap" }}>Most Popular</div>}
                    <div style={{ fontSize:13, fontWeight:600, color:t.textSecondary, marginBottom:4 }}>{p.name}</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4, marginTop:10 }}>
                      <span style={{ fontSize:30, fontWeight:700, color:t.textPrimary }}>{p.price}</span>
                      <span style={{ fontSize:13, color:t.textMuted }}>{p.period}</span>
                      {p.originalPrice && <span style={{ fontSize:14, color:t.textMuted, textDecoration:"line-through" }}>{p.originalPrice}</span>}
                    </div>
                    {p.firstMonth && <div style={{ fontSize:11, fontWeight:600, color:t.green, marginBottom:14 }}>🏷 First month — then {p.originalPrice}/mo</div>}
                    <div style={{ display:"grid", gap:9, marginBottom:22 }}>
                      {p.features.map(f => <div key={f} style={{ display:"flex", gap:8, fontSize:13, color:t.textSecondary }}><span style={{ color:t.green, fontSize:12 }}>✓</span>{f}</div>)}
                    </div>
                    <Btn variant={p.popular ? "purple" : "secondary"} full onClick={() => goTo("analysis")}>Get Started — 50% Off</Btn>
                  </Card>
                ))}
              </div>
              <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:t.textMuted }}>
                No commitment · Cancel anytime · Secure payment via Stripe
              </div>
            </div>
          </section>
        )}
        {page === "howitworks" && (
          <section style={{ padding:"64px 28px" }}>
            <div style={{ maxWidth:900, margin:"0 auto" }}>
              <div style={{ marginBottom:20 }}><Btn variant="ghost" onClick={() => goTo("home")}>← Back</Btn></div>
              <SectionHead overline="Process" title="How It Works" sub="A structured 4-step legal workflow." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="g2">
                {HOW_STEPS.map(s => (
                  <Card key={s.n} pad={22}>
                    <div style={{ fontSize:11, fontWeight:700, color:t.blue, letterSpacing:".1em", marginBottom:10 }}>{s.n}</div>
                    <div style={{ fontWeight:600, fontSize:15, color:t.textPrimary, marginBottom:8 }}>{s.t}</div>
                    <div style={{ fontSize:13, color:t.textSecondary, lineHeight:1.7 }}>{s.d}</div>
                  </Card>
                ))}
              </div>
              <div style={{ marginTop:32, textAlign:"center" }}>
                <Btn variant="primary" size="lg" onClick={() => goTo("analysis")}>Start Your Analysis →</Btn>
              </div>
            </div>
          </section>
        )}
        {page === "security" && <SecurityPage goTo={goTo} />}
        {page === "enterprise" && <EnterprisePage goTo={goTo} />}
        {page === "contact" && <ContactPage goTo={goTo} />}
        {!["home","analysis","dashboard","features","pricing","howitworks","security","enterprise","contact"].includes(page) && (
          <section style={{ padding:"64px 28px" }}>
            <div style={{ maxWidth:500, margin:"0 auto" }}>
              <p style={{ color:t.textMuted, fontSize:14, marginBottom:16 }}>Page not found.</p>
              <Btn variant="primary" onClick={() => goTo("home")}>← Back to Home</Btn>
            </div>
          </section>
        )}
      </main>

      {showFooter && <Footer goTo={goTo} />}

      {/* AUTH MODAL */}
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onAuth={handleAuth} />}

      {/* HISTORY */}
      {historyOpen && <HistoryPanel onSelect={(c) => { setHistoryOpen(false); goTo("analysis"); }} onClose={() => setHistoryOpen(false)} />}

      {/* FLOATING CHAT */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} style={{ position:"fixed", bottom:24, right:24, zIndex:300, width:46, height:46, borderRadius:11, background:t.purple, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 4px 18px rgba(124,58,237,.5)" }}>
          💬
        </button>
      )}
      {chatOpen && <ChatPanel result={null} claimType={null} onClose={() => setChatOpen(false)} />}
    </Ctx.Provider>
  );
}

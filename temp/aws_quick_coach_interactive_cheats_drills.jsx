import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, RefreshCw, Clock, CalendarClock, Sparkles, Shield, Target, PlayCircle, Download, Upload } from "lucide-react";

// ===== Minimal UI primitives (refreshed styles) =====
const cx = (...cls) => cls.filter(Boolean).join(" ");
const Button = ({ variant = "default", className = "", children, ...props }) => {
  const base = "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all active:scale-[0.98]";
  const styles = {
    default: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shadow-sm",
    primary: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow hover:brightness-105",
    ghost: "text-slate-700 hover:bg-slate-100 border border-transparent",
  };
  return (
    <button className={cx(base, styles[variant] || styles.default, className)} {...props}>{children}</button>
  );
};
const Card = ({ className = "", children }) => (<div className={cx("rounded-2xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur", className)}>{children}</div>);
const CardContent = ({ className = "", children }) => (<div className={cx("p-5", className)}>{children}</div>);
const Badge = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-green-100 text-green-700 border-green-200",
    red: "bg-rose-100 text-rose-700 border-rose-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    violet: "bg-violet-100 text-violet-800 border-violet-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return <span className={cx("inline-block rounded-full border px-2 py-0.5 text-xs", tones[tone] || tones.slate)}>{children}</span>;
};
const Progress = ({ value = 0 }) => (
  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
    <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

// ===== LocalStorage with schema migration =====
const DEFAULTS = {
  exam: { iso: null },
  checklist: { dayKey: null, items: [
    { id: "chk_timed", label: "20–30Q timed set", done: false },
    { id: "chk_review", label: "Review wrong & adjust mastery", done: false },
    { id: "chk_flash", label: "Rewatch top‑ranked lesson (15–30m)", done: false },
  ]},
  sessions: [],
  mistakes: [],
  concepts: [],
  goals: { dailyQs: 25, dailyMinutes: 60 },
  scratchpad: "",
  settings: { biasSplit: false, rewatchFollowNextFocus: true },
  domains: {
    secure: { name: "Design Secure Architectures", weight: 0.30, mastery: 0, notes: "" },
    resilient: { name: "Design Resilient Architectures", weight: 0.26, mastery: 0, notes: "" },
    performance: { name: "Design High-Performing Architectures", weight: 0.24, mastery: 0, notes: "" },
    cost: { name: "Design Cost-Optimized Architectures", weight: 0.20, mastery: 0, notes: "" },
  },
  rewatch: {
    sections: [
      {id:1,  title:"Introduction - AWS Certified Solutions Architect Associate", mins:"15m", impact:20, tags:["intro"], linkDomain:"resilient", rewatches:0, last:null, notes:"Overview"},
      {id:3,  title:"Getting started with AWS", mins:"13m", impact:20, tags:["setup"], linkDomain:"resilient", rewatches:0, last:null, notes:"Accounts, console"},
      {id:4,  title:"IAM & AWS CLI", mins:"57m", impact:85, tags:["iam","cli"], linkDomain:"secure", rewatches:0, last:null, notes:"Policies, roles, profiles"},
      {id:5,  title:"EC2 Fundamentals", mins:"1h 40m", impact:85, tags:["ec2","compute"], linkDomain:"performance", rewatches:0, last:null, notes:"Sizing, placement"},
      {id:6,  title:"EC2 - Solutions Architect Associate Level", mins:"34m", impact:75, tags:["ec2","patterns"], linkDomain:"performance", rewatches:0, last:null, notes:"Design scenarios"},
      {id:7,  title:"EC2 Instance Storage", mins:"59m", impact:70, tags:["ebs","efs","instance-store"], linkDomain:"performance", rewatches:0, last:null, notes:"EBS types, snapshots"},
      {id:8,  title:"High Availability and Scalability: ELB & ASG", mins:"1h 34m", impact:88, tags:["alb","nlb","asg"], linkDomain:"resilient", rewatches:0, last:null, notes:"HA, health checks"},
      {id:9,  title:"AWS Fundamentals: RDS + Aurora + ElastiCache", mins:"1h 12m", impact:82, tags:["rds","aurora","cache"], linkDomain:"resilient", rewatches:0, last:null, notes:"Multi‑AZ, RR"},
      {id:10, title:"Route 53", mins:"1h 25m", impact:85, tags:["dns","routing"], linkDomain:"resilient", rewatches:0, last:null, notes:"Failover, latency"},
      {id:11, title:"Classic Solutions Architecture Discussions", mins:"44m", impact:65, tags:["design"], linkDomain:"resilient", rewatches:0, last:null, notes:"Tradeoffs"},
      {id:12, title:"Amazon S3 Introduction", mins:"50m", impact:72, tags:["s3"], linkDomain:"cost", rewatches:0, last:null, notes:"Basics, classes"},
      {id:13, title:"Advanced Amazon S3", mins:"30m", impact:78, tags:["s3-adv"], linkDomain:"cost", rewatches:0, last:null, notes:"Lifecycle, CRR/SRR"},
      {id:14, title:"Amazon S3 Security", mins:"53m", impact:85, tags:["s3","security"], linkDomain:"secure", rewatches:0, last:null, notes:"Policies, AP, encryption"},
      {id:15, title:"CloudFront & AWS Global Accelerator", mins:"36m", impact:68, tags:["cdn","edge"], linkDomain:"performance", rewatches:0, last:null, notes:"Caching, GA vs CF"},
      {id:16, title:"AWS Storage Extras", mins:"38m", impact:60, tags:["fsx","glacier","snow"], linkDomain:"cost", rewatches:0, last:null, notes:"FSx, archival"},
      {id:17, title:"Decoupling applications: SQS, SNS, Kinesis, Active MQ", mins:"1h 21m", impact:82, tags:["sqs","sns","kinesis","mq"], linkDomain:"resilient", rewatches:0, last:null, notes:"Fanout, FIFO, DLQ"},
      {id:18, title:"Containers on AWS: ECS, Fargate, ECR & EKS", mins:"55m", impact:65, tags:["ecs","fargate","eks"], linkDomain:"performance", rewatches:0, last:null, notes:"Basics"},
      {id:19, title:"Serverless Overviews from a Solution Architect Perspective", mins:"1h 23m", impact:70, tags:["lambda","apigw"], linkDomain:"performance", rewatches:0, last:null, notes:"Auth, throttling"},
      {id:20, title:"Serverless Solution Architecture Discussions", mins:"16m", impact:60, tags:["serverless","design"], linkDomain:"resilient", rewatches:0, last:null, notes:"Patterns"},
      {id:21, title:"Databases in AWS", mins:"25m", impact:65, tags:["db","rds","dynamo"], linkDomain:"performance", rewatches:0, last:null, notes:"When to use what"},
      {id:22, title:"Data & Analytics", mins:"48m", impact:68, tags:["athena","glue","emr","redshift"], linkDomain:"performance", rewatches:0, last:null, notes:"Query-in-place, ETL"},
      {id:23, title:"Machine Learning", mins:"26m", impact:35, tags:["sagemaker"], linkDomain:"performance", rewatches:0, last:null, notes:"Light coverage"},
      {id:24, title:"AWS Monitoring & Audit: CloudWatch, CloudTrail & Config", mins:"1h 15m", impact:80, tags:["cw","trail","config"], linkDomain:"resilient", rewatches:0, last:null, notes:"Alarms, audit"},
      {id:25, title:"Identity and Access Management (IAM) - Advanced", mins:"49m", impact:88, tags:["iam-adv","sts"], linkDomain:"secure", rewatches:0, last:null, notes:"SCP, federation"},
      {id:26, title:"AWS Security & Encryption: KMS, SSM Parameter Store, Shield, WAF", mins:"1h 21m", impact:88, tags:["kms","ssm","shield","waf"], linkDomain:"secure", rewatches:0, last:null, notes:"Keys, DDoS"},
      {id:27, title:"Networking - VPC", mins:"2h 38m", impact:95, tags:["vpc","subnets","routes","endpoints"], linkDomain:"resilient", rewatches:0, last:null, notes:"Huge for SAA"},
      {id:28, title:"Disaster Recovery & Migrations", mins:"44m", impact:85, tags:["dr","migrate"], linkDomain:"resilient", rewatches:0, last:null, notes:"RTO/RPO"}
    ]
  }
};

// Canonical list of section titles from this course (used to clean older saved data)
const CANON_TITLES = new Set(DEFAULTS.rewatch.sections.map(s => s.title));

function deepMerge(defaults, saved) {
  if (!saved || typeof saved !== "object") return { ...defaults };
  const out = { ...defaults };
  for (const k of Object.keys(defaults)) {
    if (Array.isArray(defaults[k])) {
      out[k] = saved[k] && Array.isArray(saved[k]) ? saved[k] : defaults[k];
    } else if (defaults[k] && typeof defaults[k] === "object") {
      out[k] = deepMerge(defaults[k], saved[k]);
    } else {
      out[k] = k in saved ? saved[k] : defaults[k];
    }
  }
  for (const k of Object.keys(saved)) if (!(k in out)) out[k] = saved[k];
  return out;
}
const useLocal = (key, initial) => {
  const [state, setState] = useState(() => {
    try {
      if (typeof window === "undefined") return initial;
      const raw = window.localStorage.getItem(key);
      return raw ? deepMerge(initial, JSON.parse(raw)) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { if (typeof window !== "undefined") { window.localStorage.setItem(key, JSON.stringify(state)); } } catch {}
  }, [key, state]);
  return [state, setState];
};

// ===== Utilities =====
const fmtDate = (d) => new Date(d).toLocaleString();
const todayKey = () => new Date().toISOString().slice(0, 10);
function nextWednesdayAt(timeHHMM = "21:45") {
  const now = new Date(); const day = now.getDay(); const wedOffset = (3 - day + 7) % 7 || 7; const target = new Date(now);
  target.setDate(now.getDate() + wedOffset); const [hh, mm] = timeHHMM.split(":" ).map(Number); target.setHours(hh, mm, 0, 0); return target;
}

// ===== Decorative inline SVG (brand-ish cloud) =====
const CloudMark = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M7 18h9a4 4 0 0 0 .7-7.95A5.5 5.5 0 0 0 6.1 9.6 3.5 3.5 0 0 0 7 18z" strokeWidth="2" className="stroke-orange-500" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 18h2" strokeWidth="2" className="stroke-amber-400" strokeLinecap="round" />
  </svg>
);

// ===== App =====
export default function App() {
  const [state, setState] = useLocal("aws-saa-quick-coach-v1", DEFAULTS);

  // Diagnostics (MetaMask presence only; we do NOT use it)
  const [hasEthereum, setHasEthereum] = useState(false);
  useEffect(() => { try { setHasEthereum(typeof window !== "undefined" && !!window.ethereum); } catch { setHasEthereum(false); } }, []);

  const [lastSaved, setLastSaved] = useState(Date.now());
  useEffect(() => { setLastSaved(Date.now()); }, [state]);

  // Force light theme background so text is always readable
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        document.documentElement.style.background = "linear-gradient(135deg,#fff7ed, #ffffff)"; // amber-50 → white
        document.body.style.background = "transparent";
        document.body.style.color = "#0f172a"; // slate-900
      }
    } catch {}
  }, []);

  // Initialize exam datetime & daily checklist reset
  useEffect(() => {
    if (!state.exam.iso) {
      const def = nextWednesdayAt("21:45");
      setState((s) => ({ ...s, exam: { iso: def.toISOString().slice(0, 16) } }));
    }
    if (state.checklist.dayKey !== todayKey()) {
      setState((s) => ({ ...s, checklist: { dayKey: todayKey(), items: s.checklist.items.map((i) => ({ ...i, done: false })) } }));
    }
  }, []); // eslint-disable-line

  // One-time migration: ensure sections match this course
  useEffect(() => {
    try {
      const current = (state.rewatch?.sections) || [];
      const filtered = current.filter(s => CANON_TITLES.has(s.title));
      const byTitle = new Map(filtered.map(s => [s.title, s]));
      const filled = [...filtered];
      DEFAULTS.rewatch.sections.forEach(def => { if (!byTitle.has(def.title)) filled.push(def); });
      if (filled.length !== current.length) {
        setState((s) => ({ ...s, rewatch: { ...s.rewatch, sections: filled } }));
      }
    } catch {}
  }, []);

  // Weighted mastery for progress
  const domainsArr = Object.entries(state.domains).map(([key, d]) => ({ key, ...d }));
  const weightedMastery = useMemo(() => {
    const items = domainsArr; const num = items.reduce((a, d) => a + d.weight * (d.mastery || 0), 0); const den = items.reduce((a, d) => a + d.weight, 0) || 1; return Math.round(num / den);
  }, [state.domains]);
  const progress = weightedMastery;

  // Self-tests
  const runSelfTests = () => {
    const results = [];
    const newlineOK = ["x","y"].join("\n") === "x\ny" && "row1\nrow2".split("\n")[0] === "row1";
    results.push({ name: "Newline escapes ok", pass: newlineOK, got: newlineOK });
    results.push({ name: "Mastery 0-100", pass: progress>=0 && progress<=100, got: progress });
    const sOk = (state.rewatch?.sections||[]).length >= 20; results.push({ name: "Sections loaded", pass: sOk, got: (state.rewatch?.sections||[]).length });
    const weights = Object.values(state.domains||{}).map((d)=>d.weight);
    const lows = weights.map((w)=>Math.max(1, Math.round(20*w)));
    const highs = weights.map((w)=>Math.max(1, Math.round(30*w)));
    const lowSum = lows.reduce((a,b)=>a+b,0); const highSum = highs.reduce((a,b)=>a+b,0);
    const splitOK = (lowSum>=19 && lowSum<=21) && (highSum>=29 && highSum<=31);
    results.push({ name: "Split sums ≈ 20/30", pass: splitOK, got: `${lowSum}/${highSum}` });
    const def = DEFAULTS.domains; const same = Object.keys(def).every(k => state.domains[k]?.weight === def[k].weight);
    if (same && !(state.settings?.biasSplit)) {
      const expected = { secure: [6,9], resilient: [5,8], performance: [5,7], cost: [4,6] };
      const got = {
        secure: [Math.max(1, Math.round(20*state.domains.secure.weight)), Math.max(1, Math.round(30*state.domains.secure.weight))],
        resilient: [Math.max(1, Math.round(20*state.domains.resilient.weight)), Math.max(1, Math.round(30*state.domains.resilient.weight))],
        performance: [Math.max(1, Math.round(20*state.domains.performance.weight)), Math.max(1, Math.round(30*state.domains.performance.weight))],
        cost: [Math.max(1, Math.round(20*state.domains.cost.weight)), Math.max(1, Math.round(30*state.domains.cost.weight))],
      };
      const exactOK = Object.keys(expected).every(k => expected[k][0]===got[k][0] && expected[k][1]===got[k][1]);
      results.push({ name: "Default split matches 6–9/5–8/5–7/4–6", pass: exactOK, got: JSON.stringify(got) });
    }
    alert(results.map((r)=>`${r.pass?"✅":"❌"} ${r.name} (value: ${r.got})`).join("\n"));
  };

  // UI — header bar with gradient & brand mark
  const SavedAgo = Math.max(1, Math.round((Date.now() - lastSaved)/1000));

  // Hard reset: deep-clone defaults, prefill exam & checklist, clear storage
  const freshDefaults = () => {
    const clone = JSON.parse(JSON.stringify(DEFAULTS));
    try { const def = nextWednesdayAt("21:45"); clone.exam.iso = def.toISOString().slice(0,16); } catch {}
    clone.checklist.dayKey = todayKey();
    clone.checklist.items = clone.checklist.items.map(i => ({ ...i, done: false }));
    return clone;
  };
  const hardReset = () => {
    // Soft reset only (no reload): some preview environments go blank on reload
    try { if (typeof window !== "undefined") window.localStorage.removeItem("aws-saa-quick-coach-v1"); } catch {}
    const fresh = freshDefaults();
    setState(fresh);
  };

  return (
    <div className="mx-auto max-w-5xl p-6 min-h-screen text-slate-900">
      {/* Brand header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white">
        <div className="absolute right-[-60px] top-[-60px] h-48 w-48 rounded-full bg-amber-200/40 blur-2xl pointer-events-none -z-10" />
        <div className="relative z-10 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow border border-amber-200"><CloudMark/></div>
            <div>
              <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
                <Sparkles size={16} className="text-amber-500"/> SAA‑C03 Quick Coach
              </div>
              <div className="text-xs text-slate-600">Focused mastery • Smart rewatch • Exam‑day calm</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="violet">Saved {SavedAgo}s ago</Badge>
            <Button variant="ghost" onClick={runSelfTests}>Run self‑tests</Button>
            <Button variant="primary" onClick={hardReset}><RefreshCw size={16} /> Reset</Button>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-slate-700">
        Persistent prep hub focused on <b>domains</b>, rewatch ranking, and spaced review. All data stays in your browser.
      </div>

      {/* Top Row: Countdown + Today */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <CountdownCard state={state} setState={setState} />
        <TodayChecklist state={state} setState={setState} />
      </div>

      {/* Domain Board */}
      <DomainBoard state={state} setState={setState} />

      {/* Rewatch Planner */}
      <RewatchPlanner state={state} setState={setState} />

      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between"><span className="text-sm text-slate-600">Overall mastery</span><span className="text-sm font-semibold">{progress}%</span></div>
        <Progress value={progress} />
      </div>

      <BackupPanel state={state} setState={setState} />

      <ProctorPrep state={state} setState={setState} />

      <div className="mb-8 text-xs text-slate-500">Tip: Use <b>Rewatch Planner</b> for lesson order and <b>Domain board</b> to adjust mastery.</div>
    </div>
  );
}

// ===== Countdown Card =====
function CountdownCard({ state, setState }) {
  const [edit, setEdit] = useState(false);
  const examIso = state.exam.iso; const target = examIso ? new Date(examIso) : null;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  let dd = 0, hh = 0, mm = 0, ss = 0, expired = false;
  if (target) { const diff = target.getTime() - now; expired = diff <= 0; const d = Math.max(0, Math.floor(diff / 1000)); dd = Math.floor(d / 86400); hh = Math.floor((d % 86400) / 3600); mm = Math.floor((d % 3600) / 60); ss = d % 60; }
  const onChange = (e) => setState((s) => ({ ...s, exam: { iso: e.target.value } }));
  return (
    <Card>
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Clock size={18} className="text-amber-600"/> Exam countdown</h2>
          <Button onClick={() => setEdit(!edit)}>{edit ? "Done" : "Edit"}</Button>
        </div>
        {target ? (
          <div className="flex items-end gap-4"><TimeBox n={dd} label="days"/><TimeBox n={hh} label="hours"/><TimeBox n={mm} label="mins"/><TimeBox n={ss} label="secs"/></div>
        ) : (<div className="text-sm text-slate-600">Set your exam date/time.</div>)}
        {edit && (
          <div className="mt-3 flex items-center gap-2 text-sm"><CalendarClock size={16} className="text-slate-700"/><input type="datetime-local" value={examIso || ""} onChange={onChange} className="rounded-lg border px-2 py-1"/><span className="text-slate-600">(local time)</span></div>
        )}
        <div className="mt-2 text-xs text-slate-500">Target: {target ? fmtDate(target) : "not set"}</div>
        {expired && <div className="mt-2 text-sm text-rose-600">⏰ Exam time has passed—update the date.</div>}
      </CardContent>
    </Card>
  );
}
const TimeBox = ({ n, label }) => (
  <div className="min-w-[70px] rounded-xl border px-3 py-2 text-center">
    <div className="text-2xl font-bold leading-none">{String(n).padStart(2, "0")}</div>
    <div className="text-xs text-slate-600">{label}</div>
  </div>
);

// ===== Today Checklist =====
function TodayChecklist({ state, setState }) {
  const today = state.checklist.dayKey || todayKey();
  const items = state.checklist.items || [];
  const toggle = (id) => setState((s) => ({ ...s, checklist: { ...s.checklist, items: s.checklist.items.map((i) => i.id === id ? { ...i, done: !i.done } : i) } }));
  const reset = () => setState((s) => ({ ...s, checklist: { ...s.checklist, dayKey: todayKey(), items: s.checklist.items.map((i) => ({ ...i, done: false })) } }));

  // Bias toggle (puts more questions where mastery is low)
  const bias = !!(state.settings?.biasSplit);
  const setBias = (v) => setState((s)=>({ ...s, settings: { ...(s.settings||{}), biasSplit: v } }));

  // Compute suggested question split for a 20–30Q set (weighted, optional bias by mastery)
  const ranges = useMemo(() => {
    const ds = state.domains || {};
    const BIAS_STRENGTH = 0.6; // 0=no bias, 1=strong bias
    const arr = Object.entries(ds).map(([key, d]) => ({ key, name: d.name, base: d.weight, mastery: d.mastery||0 }));

    let adjWeights;
    if (bias) {
      const scores = arr.map(x => x.base * (1 + BIAS_STRENGTH * ((100 - x.mastery) / 100)));
      const sum = scores.reduce((a,b)=>a+b,0) || 1;
      adjWeights = scores.map(s => s / sum);
    } else {
      const sum = arr.reduce((a,b)=>a+b.base,0) || 1;
      adjWeights = arr.map(x => x.base / sum);
    }

    return arr.map((x, idx) => ({
      key: x.key,
      name: x.name,
      weight: adjWeights[idx],
      low: Math.max(1, Math.round(20 * adjWeights[idx])),
      high: Math.max(1, Math.round(30 * adjWeights[idx])),
    })).sort((a,b)=> b.weight - a.weight);
  }, [state.domains, bias]);

  const allDone = items.length>0 && items.every(i=>i.done);

  return (
    <Card>
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Target size={18} className="text-amber-600"/> Today ({today})</h2>
          <div className="flex items-center gap-2"><Button onClick={reset}>Reset</Button></div>
        </div>
        {allDone && (
          <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <b>Nice!</b> You finished all three steps. Take a 5‑minute break ☕, then start the next 20–30Q block.
          </div>
        )}
        <ul className="grid gap-2">{items.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={i.done} onChange={() => toggle(i.id)} className="h-4 w-4"/>{i.label}</label>
            {i.done && <Badge tone="green">done</Badge>}
          </li>
        ))}</ul>

        {/* Suggested split block */}
        <div className="mt-3 rounded-lg border bg-slate-50 p-3 text-xs text-slate-700">
          <div className="mb-2 flex items-center justify-between"><div className="font-medium text-slate-800">{bias ? "Suggested split (biased by mastery) for 20–30Q set" : "Suggested split for 20–30Q set"}</div><label className="flex items-center gap-2"><input type="checkbox" checked={bias} onChange={(e)=>setBias(e.target.checked)} className="h-3 w-3"/> <span>Bias to weak areas</span></label></div>
          <ul className="grid gap-1">
            {ranges.map((d) => (
              <li key={d.key}>{`${d.low}–${d.high}q ${d.name} — Weight ${Math.round(d.weight * 100)}%`}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Domain Board =====
function DomainBoard({ state, setState }) {
  const domains = state.domains;
  const setMastery = (key, val) => setState((s) => ({ ...s, domains: { ...s.domains, [key]: { ...s.domains[key], mastery: Number(val) } } }));
  const setNotes = (key, val) => setState((s) => ({ ...s, domains: { ...s.domains, [key]: { ...s.domains[key], notes: val } } }));
  const items = Object.entries(domains).map(([k, d]) => ({ key: k, ...d }));
  const priority = items.map((d) => ({ key: d.key, name: d.name, score: d.weight * (100 - (d.mastery || 0)) })).sort((a, b) => b.score - a.score);
  const weighted = Math.round((items.reduce((a, d) => a + d.weight * (d.mastery || 0), 0) / items.reduce((a, d) => a + d.weight, 0)));
  return (
    <Card>
      <CardContent>
        <div className="mb-2 flex items-center justify-between"><h2 className="text-xl font-semibold flex items-center gap-2"><Shield size={18} className="text-amber-600"/> Domain board</h2><Badge tone="blue">Weighted mastery: {weighted}%</Badge></div>
        <div className="grid gap-4 md:grid-cols-2">{items.map((d) => (
          <div key={d.key} className="rounded-xl border p-4 hover:shadow-sm transition-shadow">
            <div className="mb-2 flex items-center justify-between"><div className="font-semibold">{d.name}</div><Badge tone="slate">Weight {Math.round(d.weight*100)}%</Badge></div>
            <div className="mb-2 flex items-center gap-2 text-sm"><span>Mastery</span><input type="range" min={0} max={100} value={d.mastery} onChange={(e)=>setMastery(d.key, e.target.value)} className="flex-1"/><span className="w-10 text-right font-medium">{d.mastery}%</span></div>
            <textarea value={d.notes} onChange={(e)=>setNotes(d.key, e.target.value)} placeholder="Key rules / gotchas / services to drill" className="h-20 w-full rounded-lg border p-2 text-xs"/>
          </div>
        ))}</div>
        <div className="mt-3 text-sm text-slate-700"><b>Next focus</b>: {priority[0]?.name} (highest impact now).</div>
      </CardContent>
    </Card>
  );
}

// ===== Rewatch Planner (ranked by impact) =====
function RewatchPlanner({ state, setState }) {
  const secs = state.rewatch?.sections || [];
  const domainMastery = state.domains || {};
  // Follow Domain board's Next focus
  const follow = !!(state.settings?.rewatchFollowNextFocus);
  const setFollow = (v) => setState((s)=>({ ...s, settings: { ...(s.settings||{}), rewatchFollowNextFocus: v } }));
  const domainEntries = Object.entries(domainMastery).map(([key,d])=>({ key, ...d }));
  const nextFocusKey = domainEntries.sort((a,b)=> (b.weight*(100-(b.mastery||0))) - (a.weight*(100-(a.mastery||0))) )[0]?.key;

  const scored = secs.map(s => {
    const lastDays = s.last ? Math.max(0, (Date.now() - new Date(s.last).getTime())/86400000) : 999;
    const recencyBoost = Math.min(20, (s.last ? Math.floor(lastDays) : 10));
    const domKey = s.linkDomain || "dev"; const dom = domainMastery[domKey] || { mastery: 0, weight: 0 };
    const domainBoost = Math.round((100 - (dom.mastery||0)) * 0.2 / 10); // up to ~20
    const focusBonus = follow && nextFocusKey ? (domKey === nextFocusKey ? 100 : 0) : 0; // ensure top aligns when enabled
    const weightNudge = (dom.weight || 0) * 10; // small nudge by exam weight
    const score = s.impact + recencyBoost + domainBoost + focusBonus + weightNudge;
    return { ...s, score };
  }).sort((a,b)=> b.score - a.score);

  const markWatched = (id) => setState((st)=>({
    ...st,
    rewatch: { ...st.rewatch, sections: st.rewatch.sections.map(x=> x.id!==id ? x : { ...x, rewatches:(x.rewatches||0)+1, last: new Date().toISOString() }) }
  }));
  const updateImpact = (id, val) => setState((st)=>({ ...st, rewatch: { ...st.rewatch, sections: st.rewatch.sections.map(x=> x.id!==id ? x : { ...x, impact: Math.max(0, Math.min(100, Number(val)||0)) }) } }));

  return (
    <Card>
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2"><PlayCircle size={18} className="text-amber-600"/> Rewatch Planner (Lessons)</h2>
          <div className="flex items-center gap-3">
            {follow && nextFocusKey && <Badge tone="amber">Prioritizing: {domainMastery[nextFocusKey]?.name}</Badge>}
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={follow} onChange={(e)=>setFollow(e.target.checked)} className="h-3 w-3"/> Follow Next focus</label>
            <Badge tone="blue">{scored.length} sections</Badge>
          </div>
        </div>
        <div className="rounded-xl border overflow-hidden">
          <div className="grid grid-cols-12 gap-2 border-b bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            <div className="col-span-6">Section (Top 30 by score)</div>
            <div className="col-span-2">Impact</div>
            <div className="col-span-2">Watched</div>
            <div className="col-span-2">Action</div>
          </div>
          {scored.slice(0,30).map((s, idx) => (
            <div key={s.id} className={cx("grid grid-cols-12 items-center gap-2 px-3 py-2 text-sm border-b", idx % 2 ? "bg-white" : "bg-orange-50/[0.08]") }>
              <div className="col-span-6">
                <div className="font-medium">{s.title} <span className="text-xs text-slate-500">• {s.mins}</span></div>
                <div className="text-xs text-slate-600">{s.tags?.join(", ")} {s.notes? `• ${s.notes}`: ""}</div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="number" className="w-16 rounded-lg border px-2 py-1 text-xs" value={s.impact} onChange={(e)=>updateImpact(s.id, e.target.value)} />
                <Badge tone="violet">Score {s.score}</Badge>
              </div>
              <div className="col-span-2 text-xs text-slate-700">
                <div>{s.rewatches||0}×</div>
                <div className="text-slate-500">{s.last ? new Date(s.last).toLocaleDateString() : "—"}</div>
              </div>
              <div className="col-span-2">
                <Button onClick={()=>markWatched(s.id)}><CheckCircle size={16}/> Watched</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-600">Score = Impact + recency + domain weakness + exam weight nudge {""}{(state.settings?.rewatchFollowNextFocus) ? "+ focus bonus" : ""}.</div>
      </CardContent>
    </Card>
  );
}

// ===== Backup — Export / Import =====
function BackupPanel({ state, setState }) {
  const [text, setText] = useState("");
  const fileRef = useRef(null);
  const exportToBox = () => setText(JSON.stringify(state, null, 2));
  const downloadJson = () => {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date().toISOString().slice(0,16).replace(/[T:]/g, "");
      a.href = url; a.download = `saa_coach_backup-${ts}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch (e) { alert("❌ Download failed"); }
  };
  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    f.text().then((txt) => { try { const obj = JSON.parse(txt); setState((s)=>deepMerge(s, obj)); alert("✅ Imported from file"); } catch { alert("❌ Invalid JSON in file"); } });
    e.target.value = "";
  };
  const importFromBox = () => { try { const obj = JSON.parse(text); setState((s)=>deepMerge(s, obj)); alert("✅ Imported"); } catch { alert("❌ Invalid JSON"); } };
  return (
    <Card>
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Download size={18} className="text-amber-600"/> Backup — Export / Import</h2>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="application/json" onChange={onFile} className="hidden" />
            <Button onClick={exportToBox}>Export to textbox</Button>
            <Button onClick={downloadJson}>Download .json</Button>
            <Button onClick={()=>fileRef.current?.click()}><Upload size={16}/> Upload .json</Button>
            <Button variant="primary" onClick={importFromBox}>Import from textbox</Button>
          </div>
        </div>
        <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Your JSON appears here when you export. Paste to import." className="h-32 w-full rounded-xl border p-3 text-xs"/>
        <div className="mt-1 text-xs text-slate-500">Tip: keep a backup if you clear site data or switch devices.</div>
      </CardContent>
    </Card>
  );
}

// ===== Proctor Prep (compact) =====
function ProctorPrep({ state, setState }) {
  const notes = state.proctor?.notes || "";
  const setNotes = (v) => setState((s)=>({ ...s, proctor: { ...(s.proctor||{}), notes: v } }));
  return (
    <Section title="Proctor Prep — Online Exam">
      <div className="grid gap-4 md:grid-cols-3 text-sm">
        <div className="rounded-xl border p-4">
          <div className="mb-2 font-semibold">Do this</div>
          <ul className="list-disc pl-5 leading-6">
            <li>Hands on desk; face/mouth visible.</li>
            <li>Read silently; no whispering.</li>
            <li>Room alone; no headphones.</li>
            <li>Enable OS mic noise suppression.</li>
          </ul>
        </div>
        <div className="rounded-xl border p-4">
          <div className="mb-2 font-semibold">If noise happens</div>
          <pre className="overflow-auto rounded-lg bg-slate-50 p-3 text-xs">{`FYI: A brief noise came from another room. I'm silent and continuing.`}</pre>
        </div>
        <div className="rounded-xl border p-4">
          <div className="mb-2 font-semibold">Food & Drinks</div>
          <ul className="list-disc pl-5 leading-6">
            <li><b>Default:</b> No food. Drinks policy varies by proctor.</li>
            <li>Often only <b>water in a clear, label‑free bottle</b> is allowed.</li>
            <li><b>Coffee</b> is commonly <b>not</b> allowed. If needed, ask first.</li>
            <li>Before starting, confirm in chat to be safe.</li>
          </ul>
          <div className="mt-3 text-xs text-slate-600">Paste to chat:</div>
          <pre className="overflow-auto rounded-lg bg-slate-50 p-3 text-xs">{`Quick check: May I keep a clear bottle of water on the desk to sip occasionally? No food, I'm alone and silent.`}</pre>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 text-sm font-semibold">My proctor notes</div>
        <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Provider, case ID, confirmed allowances (e.g., clear water bottle allowed), any extra instructions…" className="h-24 w-full rounded-xl border p-3 text-sm"/>
        <div className="mt-1 text-xs text-slate-500">Saved locally. Use this to remember what your proctor confirmed.</div>
      </div>
    </Section>
  );
}

// ===== Generic Section wrapper =====
function Section({ title, children }) {
  return (
    <Card className="mb-6">
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

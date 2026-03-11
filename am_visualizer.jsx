import { useState, useEffect, useRef, useCallback } from "react";

const W = 900, H = 140, PAD = 12;
const SAMPLES = 1400;

function makeCtx(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

function drawGrid(ctx, canvas, zeroVal, minVal, maxVal) {
  const range = maxVal - minVal || 1;
  const toY = v => PAD + ((maxVal - v) / range) * (canvas.height - 2 * PAD);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = PAD + (i / 4) * (canvas.height - 2 * PAD);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  if (zeroVal >= minVal && zeroVal <= maxVal) {
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, toY(zeroVal)); ctx.lineTo(canvas.width, toY(zeroVal));
    ctx.stroke();
  }
  return toY;
}

function drawLine(canvas, samples, color, minV, maxV, zeroV = 0, fillAlpha = 0.07, extraLines = null) {
  const ctx = makeCtx(canvas); if (!ctx) return;
  const toY = drawGrid(ctx, canvas, zeroV, minV, maxV);
  const n = samples.length;

  if (fillAlpha > 0) {
    ctx.beginPath();
    ctx.moveTo(0, toY(Math.max(minV, Math.min(maxV, zeroV))));
    for (let i = 0; i < n; i++) ctx.lineTo((i / (n-1)) * canvas.width, toY(samples[i]));
    ctx.lineTo(canvas.width, toY(Math.max(minV, Math.min(maxV, zeroV))));
    ctx.closePath();
    const rgb = color.match(/\d+/g);
    ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${fillAlpha})`;
    ctx.fill();
  }

  if (extraLines) {
    for (const { data, col, dash } of extraLines) {
      ctx.beginPath();
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(dash || []);
      ctx.shadowColor = col; ctx.shadowBlur = 5;
      for (let i = 0; i < n; i++) {
        const x = (i / (n-1)) * canvas.width;
        i === 0 ? ctx.moveTo(x, toY(data[i])) : ctx.lineTo(x, toY(data[i]));
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color; ctx.shadowBlur = 6;
  for (let i = 0; i < n; i++) {
    const x = (i / (n-1)) * canvas.width;
    i === 0 ? ctx.moveTo(x, toY(samples[i])) : ctx.lineTo(x, toY(samples[i]));
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawAMPanel(canvas, am, env, overmod) {
  const ctx = makeCtx(canvas); if (!ctx) return;
  const n = am.length;
  const toY = drawGrid(ctx, canvas, 0, -1.6, 1.6);

  ctx.beginPath(); ctx.moveTo(0, toY(0));
  for (let i=0;i<n;i++) ctx.lineTo((i/(n-1))*canvas.width, toY(am[i]));
  ctx.lineTo(canvas.width, toY(0));
  ctx.closePath(); ctx.fillStyle="rgba(56,189,248,0.07)"; ctx.fill();

  ctx.beginPath(); ctx.strokeStyle="#38bdf8"; ctx.lineWidth=1.8;
  ctx.shadowColor="#38bdf8"; ctx.shadowBlur=4;
  for (let i=0;i<n;i++){const x=(i/(n-1))*canvas.width;i===0?ctx.moveTo(x,toY(am[i])):ctx.lineTo(x,toY(am[i]));}
  ctx.stroke();

  const ec = overmod ? "#f87171" : "#facc15";
  ctx.setLineDash([6,4]); ctx.lineWidth=2;
  ctx.strokeStyle=ec; ctx.shadowColor=ec; ctx.shadowBlur=7;
  ctx.beginPath();
  for (let i=0;i<n;i++){const x=(i/(n-1))*canvas.width;i===0?ctx.moveTo(x,toY(env[i])):ctx.lineTo(x,toY(env[i]));}
  ctx.stroke();
  ctx.beginPath();
  for (let i=0;i<n;i++){const x=(i/(n-1))*canvas.width;i===0?ctx.moveTo(x,toY(-env[i])):ctx.lineTo(x,toY(-env[i]));}
  ctx.stroke();
  ctx.setLineDash([]); ctx.shadowBlur=0;
}

function drawDetector(canvas, am, tau) {
  const ctx = makeCtx(canvas); if (!ctx) return;
  const n = am.length;
  const dt = 1 / n;
  let cap = 0;
  const detected = new Array(n);
  for (let i = 0; i < n; i++) {
    const v = am[i];
    cap = v > cap ? v : cap * Math.exp(-dt / Math.max(tau, 0.001));
    detected[i] = cap;
  }
  const toY = drawGrid(ctx, canvas, 0, -1.6, 1.6);
  ctx.beginPath(); ctx.strokeStyle="rgba(56,189,248,0.18)"; ctx.lineWidth=1;
  for (let i=0;i<n;i++){const x=(i/(n-1))*canvas.width;i===0?ctx.moveTo(x,toY(am[i])):ctx.lineTo(x,toY(am[i]));}
  ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle="#4ade80"; ctx.lineWidth=2.5;
  ctx.shadowColor="#4ade80"; ctx.shadowBlur=8;
  for (let i=0;i<n;i++){const x=(i/(n-1))*canvas.width;i===0?ctx.moveTo(x,toY(detected[i])):ctx.lineTo(x,toY(detected[i]));}
  ctx.stroke(); ctx.shadowBlur=0;
}

const STEPS = [
  { id:"msg",     label:"① x(t)",          sub:"message wave",                        color:"#a78bfa" },
  { id:"scaled",  label:"② m·x(t)",         sub:"message scaled by mod index m",       color:"#c084fc" },
  { id:"env",     label:"③ 1 + m·x(t)",     sub:"envelope — must stay ≥ 0",           color:"#facc15" },
  { id:"carrier", label:"④ cos(ωc·t)",       sub:"carrier wave — fast oscillation",     color:"#fb923c" },
  { id:"am",      label:"⑤ s(t) = ③ × ④",  sub:"AM signal  (dashed = ③ envelope)",   color:"#38bdf8" },
  { id:"det",     label:"⑥ detector output", sub:"RC circuit recovers the envelope",    color:"#4ade80" },
];

export default function App() {
  const [fm,  setFm]  = useState(3);
  const [fc,  setFc]  = useState(40);
  const [m,   setM]   = useState(0.7);
  const [tau, setTau] = useState(0.08);

  const refs = {
    msg: useRef(), scaled: useRef(), env: useRef(),
    carrier: useRef(), am: useRef(), det: useRef(),
  };

  useEffect(() => {
    const msg=[], scaled=[], env=[], carrier=[], am=[];
    for (let i = 0; i < SAMPLES; i++) {
      const t  = i / SAMPLES;
      const x  = Math.cos(2 * Math.PI * fm * t);
      const mx = m * x;
      const e  = 1 + mx;
      const c  = Math.cos(2 * Math.PI * fc * t);
      msg.push(x); scaled.push(mx); env.push(e);
      carrier.push(c); am.push(e * c);
    }

    const overmod = m > 1;

    // ① x(t)
    drawLine(refs.msg.current, msg, "rgb(167,139,250)", -1.5, 1.5, 0, 0.08);

    // ② m·x(t)
    const mMax = Math.max(m + 0.15, 0.2);
    drawLine(refs.scaled.current, scaled, "rgb(192,132,252)", -mMax, mMax, 0, 0.08);

    // ③ 1+mx(t) — show a horizontal dashed line at 0 to highlight when it crosses
    const envMin = Math.min(1 - m - 0.2, -0.3);
    const envMax = 1 + m + 0.2;
    drawLine(refs.env.current, env, "rgb(250,204,21)", envMin, envMax, 0, 0.1,
      overmod ? [{ data: Array(SAMPLES).fill(0), col: "rgba(248,113,113,0.5)", dash:[4,3] }] : null);

    // ④ carrier
    drawLine(refs.carrier.current, carrier, "rgb(251,146,60)", -1.5, 1.5, 0, 0.06);

    // ⑤ AM signal
    drawAMPanel(refs.am.current, am, env, overmod);

    // ⑥ detector
    drawDetector(refs.det.current, am, tau);
  }, [fm, fc, m, tau]);

  const ratio  = fc / fm;
  const tauOk  = tau > 1/fc && tau < 1/fm;
  const overmod = m > 1;

  const Slider = ({ label, value, min, max, step, onChange, unit, color, warn }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ color:"#94a3b8", fontSize:11, letterSpacing:1 }}>{label}</span>
        <span style={{ color:warn?"#f87171":color, fontSize:12, fontWeight:700 }}>
          {value < 1 && value > 0 ? value.toFixed(2) : value}{unit}{warn?" ⚠":""}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:"100%", accentColor:warn?"#f87171":color, cursor:"pointer" }} />
    </div>
  );

  return (
    <div style={{ background:"#060b14", minHeight:"100vh", padding:"28px 20px", fontFamily:"monospace", color:"#e2e8f0" }}>
      <div style={{ maxWidth:980, margin:"0 auto" }}>

        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10, color:"#1e3a5f", letterSpacing:4, marginBottom:4 }}>ECE · AM MODULATION</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#f8fafc", margin:0, letterSpacing:-0.5 }}>
            Amplitude Modulation — Step by Step
          </h1>
          <p style={{ color:"#475569", fontSize:12, marginTop:4, margin:"4px 0 0" }}>
            s(t) = (1 + m·x(t)) · cos(ω<sub>c</sub>t) &nbsp;&nbsp;·&nbsp;&nbsp; x(t) = cos(ω<sub>m</sub>t)
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 265px", gap:20, alignItems:"start" }}>

          <div>
            {STEPS.map(({ id, label, sub, color }) => (
              <div key={id} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:color, boxShadow:`0 0 6px ${color}`, flexShrink:0 }} />
                  <span style={{ color, fontSize:12, letterSpacing:0.5, fontWeight:700 }}>{label}</span>
                  <span style={{ color:"#334155", fontSize:11 }}>
                    — {sub}
                    {id==="env" && overmod && <span style={{ color:"#f87171" }}> ⚠ GOES NEGATIVE</span>}
                  </span>
                </div>
                <canvas ref={refs[id]} width={W} height={H}
                  style={{ width:"100%", height:H, borderRadius:6, background:"#0a0f1a",
                    border:`1px solid ${id==="am"||id==="det"?"#1e3a5f":"#1e293b"}`,
                    display:"block" }} />
              </div>
            ))}

            {/* Formula chain */}
            <div style={{ background:"#0a0f1a", border:"1px solid #1e293b", borderRadius:8,
              padding:"11px 16px", fontSize:12, color:"#64748b", marginTop:4,
              display:"flex", flexWrap:"wrap", gap:"4px 0", alignItems:"center", lineHeight:2.2 }}>
              <span style={{ color:"#a78bfa" }}>x(t)</span>
              <span style={{ margin:"0 6px" }}>×m →</span>
              <span style={{ color:"#c084fc" }}>m·x(t)</span>
              <span style={{ margin:"0 6px" }}>+1 →</span>
              <span style={{ color:"#facc15" }}>1+m·x(t)</span>
              <span style={{ margin:"0 6px" }}>×</span>
              <span style={{ color:"#fb923c" }}>cos(ωct)</span>
              <span style={{ margin:"0 6px" }}>→</span>
              <span style={{ color:"#38bdf8" }}>s(t)</span>
              <span style={{ margin:"0 6px" }}>→ RC →</span>
              <span style={{ color:"#4ade80" }}>recovered x(t)</span>
            </div>

            {/* Status bar */}
            <div style={{ background:"#0a0f1a", border:"1px solid #1e293b", borderRadius:8,
              padding:"9px 16px", fontSize:11, display:"flex", gap:20, flexWrap:"wrap", marginTop:8, color:"#64748b" }}>
              <span>fc/fm = <strong style={{ color:ratio>=10?"#4ade80":"#f87171" }}>{ratio.toFixed(1)}×</strong>
                <span style={{ color:"#334155" }}> {ratio>=10?"✓ ok":"✗ need ≥10×"}</span>
              </span>
              <span>m = <strong style={{ color:!overmod?"#4ade80":"#f87171" }}>{m.toFixed(2)}</strong>
                <span style={{ color:"#334155" }}> {!overmod?"✓ no overmod":"✗ overmodulated"}</span>
              </span>
              <span>τ = <strong style={{ color:tauOk?"#4ade80":"#f87171" }}>{tau.toFixed(3)}</strong>
                <span style={{ color:"#334155" }}> {tauOk?"✓ valid":"✗ bad"} &nbsp;
                  (need {(1/fc).toFixed(3)} &lt; τ &lt; {(1/fm).toFixed(3)})</span>
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ background:"#0a0f1a", border:"1px solid #1e293b", borderRadius:10,
            padding:20, position:"sticky", top:24 }}>
            <div style={{ fontSize:10, color:"#334155", letterSpacing:3, marginBottom:18 }}>CONTROLS</div>

            <Slider label="MESSAGE FREQ  fm" value={fm} min={1} max={10} step={0.5}
              onChange={setFm} unit=" Hz" color="#a78bfa" />
            <Slider label="CARRIER FREQ  fc" value={fc} min={10} max={100} step={5}
              onChange={setFc} unit=" Hz" color="#fb923c" />
            <Slider label="MOD INDEX  m" value={m} min={0} max={1.5} step={0.05}
              onChange={setM} unit="" color="#38bdf8" warn={overmod} />

            <div style={{ height:1, background:"#1e293b", margin:"16px 0" }} />
            <div style={{ fontSize:10, color:"#334155", letterSpacing:3, marginBottom:14 }}>DETECTOR  τ = RC</div>
            <Slider label="TIME CONSTANT  τ" value={tau} min={0.005} max={0.5} step={0.005}
              onChange={setTau} unit=" s" color="#4ade80" />

            <div style={{ background:"#0f172a", borderRadius:6, padding:12,
              fontSize:11, color:"#64748b", lineHeight:2, marginTop:4 }}>
              <div style={{ color:"#94a3b8", marginBottom:4 }}>What each step does:</div>
              <div><span style={{ color:"#a78bfa" }}>①</span> raw audio/message</div>
              <div><span style={{ color:"#c084fc" }}>②</span> m controls depth</div>
              <div><span style={{ color:"#facc15" }}>③</span> +1 keeps it positive</div>
              <div><span style={{ color:"#fb923c" }}>④</span> fast carrier signal</div>
              <div><span style={{ color:"#38bdf8" }}>⑤</span> multiply ③ × ④</div>
              <div><span style={{ color:"#4ade80" }}>⑥</span> RC peels envelope off</div>
            </div>

            <div style={{ background:"#0f172a", borderRadius:6, padding:12,
              fontSize:11, color:"#64748b", lineHeight:2, marginTop:10 }}>
              <div style={{ color:"#94a3b8", marginBottom:4 }}>Things to notice:</div>
              <div>• ③ is exactly the dashed line in ⑤</div>
              <div>• m&gt;1 → ③ crosses zero → distortion</div>
              <div>• τ too small → ⑥ is jittery</div>
              <div>• τ too large → ⑥ lags behind</div>
              <div>• lower fc → ④ and ③ merge in time</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

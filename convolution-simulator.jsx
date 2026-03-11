import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as math from "mathjs";

const W = 600, H = 160;
const DOMAIN = [-6, 6];
const N = 600;
const dt = (DOMAIN[1] - DOMAIN[0]) / N;
const ts = Array.from({ length: N }, (_, i) => DOMAIN[0] + i * dt);

function evalFn(expr, t) {
  try {
    const scope = {
      t, x: t,
      u: (v) => (v >= 0 ? 1 : 0),
      rect: (v) => (Math.abs(v) <= 0.5 ? 1 : 0),
      tri: (v) => (Math.abs(v) <= 1 ? 1 - Math.abs(v) : 0),
      pi: Math.PI, e: Math.E,
    };
    const val = math.evaluate(expr.replace(/\bu\b/g, 'u(t)').replace(/u\(t\)/g, `u(${t})`), { ...scope, u: undefined });
    const result = typeof val === 'function' ? val(t) : val;
    return isFinite(result) ? result : 0;
  } catch { return 0; }
}

function evalFnSafe(expr) {
  return ts.map(t => {
    try {
      const scope = {
        t, x: t,
        u: (v) => (v >= 0 ? 1 : 0),
        rect: (v) => (Math.abs(v) <= 0.5 ? 1 : 0),
        tri: (v) => (Math.abs(v) <= 1 ? 1 - Math.abs(v) : 0),
        pi: Math.PI, e: Math.E,
      };
      const val = math.evaluate(expr, scope);
      return isFinite(val) ? val : 0;
    } catch { return 0; }
  });
}

function convolve(f, g) {
  // g[i] corresponds to time DOMAIN[0] + i*dt.
  // We need g(t_n - τ_k) = g((n-k)*dt).
  // Index of time t in array = (t - DOMAIN[0])/dt, so:
  // index of (n-k)*dt = (n - k) - DOMAIN[0]/dt = (n - k) + N/2
  const offset = Math.round(-DOMAIN[0] / dt); // = N/2 = 300
  const result = new Array(N).fill(0);
  for (let n = 0; n < N; n++) {
    let sum = 0;
    for (let k = 0; k < N; k++) {
      const mk = n - k + offset;
      if (mk >= 0 && mk < N) sum += f[k] * g[mk];
    }
    result[n] = sum * dt;
  }
  return result;
}

function toSVG(vals, yMin, yMax, w = W, h = H, pad = 20) {
  const xScale = (w - pad * 2) / N;
  const yRange = yMax - yMin || 1;
  const yScale = (h - pad * 2) / yRange;
  return vals.map((v, i) => {
    const x = pad + i * xScale;
    const y = h - pad - (v - yMin) * yScale;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

function tToX(t, w = W, pad = 20) {
  return pad + ((t - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (w - pad * 2);
}

function xToT(x, w = W, pad = 20) {
  return DOMAIN[0] + ((x - pad) / (w - pad * 2)) * (DOMAIN[1] - DOMAIN[0]);
}

function Grid({ w = W, h = H, pad = 20, yMin, yMax }) {
  const xTicks = [-4, -2, 0, 2, 4];
  const yRange = yMax - yMin || 1;
  return (
    <g opacity="0.25">
      {xTicks.map(t => {
        const x = tToX(t, w, pad);
        return <line key={t} x1={x} y1={pad} x2={x} y2={h - pad} stroke="#4ade80" strokeWidth="0.5" strokeDasharray="3,3" />;
      })}
      {[0].map(v => {
        const y = h - pad - (v - yMin) / yRange * (h - pad * 2);
        return <line key={v} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#4ade80" strokeWidth="0.8" />;
      })}
    </g>
  );
}

function Plot({ vals, color, label, sliderT, highlightVals, showSlider = false, gLabel }) {
  const valid = vals.filter(isFinite);
  const yMin = Math.min(...valid, 0) * 1.2 - 0.1;
  const yMax = Math.max(...valid, 0) * 1.2 + 0.1;
  const path = toSVG(vals, yMin, yMax);
  const sliderX = tToX(sliderT);
  const pad = 20;

  // Area under curve at slider: f(τ)*g(t-τ)
  let areaPath = '';
  if (highlightVals) {
    const hMin = yMin, hMax = yMax;
    const yRange = hMax - hMin || 1;
    const points = highlightVals.map((v, i) => {
      const x = pad + i * (W - pad * 2) / N;
      const y = H - pad - (v - hMin) / yRange * (H - pad * 2);
      return [x, y];
    });
    const baseline = H - pad - (0 - hMin) / yRange * (H - pad * 2);
    areaPath = `M${points[0][0]},${baseline} ` +
      points.map(([x, y]) => `L${x},${y}`).join(' ') +
      ` L${points[points.length - 1][0]},${baseline} Z`;
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* CRT background */}
        <rect x={pad} y={pad} width={W - pad * 2} height={H - pad * 2} fill="#020c04" rx="2" />
        <Grid yMin={yMin} yMax={yMax} />
        {areaPath && (
          <path d={areaPath} fill={color} opacity="0.15" />
        )}
        <path d={path} fill="none" stroke={color} strokeWidth="2" filter="url(#glow)" />
        {showSlider && (
          <line x1={sliderX} y1={pad} x2={sliderX} y2={H - pad}
            stroke="#facc15" strokeWidth="1.5" opacity="0.9" strokeDasharray="4,2" />
        )}
        {/* Axis labels */}
        <text x={W - pad + 4} y={H - pad + 4} fill="#4ade80" fontSize="10" fontFamily="monospace">t</text>
        <text x={pad + 4} y={pad + 12} fill={color} fontSize="10" fontFamily="monospace" opacity="0.7">{label}</text>
        {/* x-axis ticks */}
        {[-4, -2, 0, 2, 4].map(v => (
          <text key={v} x={tToX(v) - 4} y={H - 6} fill="#4ade80" fontSize="8" fontFamily="monospace" opacity="0.5">{v}</text>
        ))}
      </svg>
    </div>
  );
}

const PRESETS = [
  { label: "rect × rect", f: "rect(t)", g: "rect(t)" },
  { label: "exp × rect", f: "exp(-t) * u(t)", g: "rect(t)" },
  { label: "exp × exp", f: "exp(-t) * u(t)", g: "exp(-t) * u(t)" },
  { label: "sin × rect", f: "sin(2*pi*t)", g: "rect(t/4)" },
  { label: "tri × rect", f: "tri(t)", g: "rect(t)" },
  { label: "gauss × gauss", f: "exp(-t^2)", g: "exp(-t^2)" },
];

export default function ConvolutionSim() {
  const [fExpr, setFExpr] = useState("rect(t)");
  const [gExpr, setGExpr] = useState("rect(t)");
  const [sliderT, setSliderT] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fErr, setFErr] = useState(false);
  const [gErr, setGErr] = useState(false);
  const svgRef = useRef(null);

  const fVals = useMemo(() => {
    try { const v = evalFnSafe(fExpr); setFErr(false); return v; }
    catch { setFErr(true); return new Array(N).fill(0); }
  }, [fExpr]);

  const gVals = useMemo(() => {
    try { const v = evalFnSafe(gExpr); setGErr(false); return v; }
    catch { setGErr(true); return new Array(N).fill(0); }
  }, [gExpr]);

  const convVals = useMemo(() => convolve(fVals, gVals), [fVals, gVals]);

  // g flipped and shifted: g(t0 - τ)
  const gFlippedVals = useMemo(() => {
    return ts.map((tau) => {
      const tIdx = Math.round((sliderT - tau - DOMAIN[0]) / dt);
      if (tIdx < 0 || tIdx >= N) return 0;
      return gVals[tIdx];
    });
  }, [gVals, sliderT]);

  // Product f(τ)*g(t-τ)
  const productVals = useMemo(() => fVals.map((v, i) => v * gFlippedVals[i]), [fVals, gFlippedVals]);

  // Convolution up to sliderT
  const convUpTo = useMemo(() => {
    const tIdx = Math.round((sliderT - DOMAIN[0]) / dt);
    return convVals.map((v, i) => i <= tIdx ? v : NaN);
  }, [convVals, sliderT]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const t = Math.max(DOMAIN[0], Math.min(DOMAIN[1], xToT(x)));
    setSliderT(t);
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);
  const handleTouchMove = useCallback((e) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const t = Math.max(DOMAIN[0], Math.min(DOMAIN[1], xToT(x)));
    setSliderT(t);
  }, [dragging]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove]);

  const sliderX = tToX(sliderT);

  return (
    <div style={{
      minHeight: '100vh', background: '#030a04',
      fontFamily: "'Courier New', monospace",
      color: '#4ade80', padding: '24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '6px', color: '#4ade80aa', marginBottom: '4px' }}>SIGNAL PROCESSING LAB</div>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, letterSpacing: '2px', color: '#86efac', textShadow: '0 0 20px #4ade8066' }}>
          CONVOLUTION SIMULATOR
        </h1>
        <div style={{ fontSize: '11px', color: '#4ade8066', marginTop: '4px', letterSpacing: '2px' }}>
          (f ★ g)(t) = ∫ f(τ) · g(t−τ) dτ
        </div>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setFExpr(p.f); setGExpr(p.g); }}
            style={{
              background: 'transparent', border: '1px solid #4ade8044', color: '#4ade80aa',
              padding: '4px 10px', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer',
              borderRadius: '2px', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#4ade80'; e.target.style.color = '#4ade80'; e.target.style.background = '#4ade8011'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#4ade8044'; e.target.style.color = '#4ade80aa'; e.target.style.background = 'transparent'; }}
          >{p.label}</button>
        ))}
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { label: 'f(t)', val: fExpr, set: setFExpr, err: fErr, color: '#22d3ee' },
          { label: 'g(t)', val: gExpr, set: setGExpr, err: gErr, color: '#a78bfa' },
        ].map(({ label, val, set, err, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color, fontWeight: 700, fontSize: '14px', minWidth: '36px' }}>{label} =</span>
            <input value={val} onChange={e => set(e.target.value)}
              style={{
                background: '#020c04', border: `1px solid ${err ? '#f87171' : color + '44'}`,
                color: err ? '#f87171' : color, padding: '6px 12px', fontSize: '13px',
                fontFamily: 'monospace', borderRadius: '2px', outline: 'none', width: '200px',
                boxShadow: err ? '0 0 8px #f8717133' : `0 0 8px ${color}22`,
              }} />
            {err && <span style={{ color: '#f87171', fontSize: '10px' }}>ERR</span>}
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: '#4ade8044', letterSpacing: '1px' }}>
        Available: u(t) = unit step · rect(t) = rectangle · tri(t) = triangle · sin, cos, exp, abs, pi
      </div>

      {/* Plots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: `${W + 20}px` }}>

        {/* Row 1: f and g side by side hint */}
        <SectionLabel>① INPUT SIGNALS</SectionLabel>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <PlotPanel label="f(τ)" color="#22d3ee" vals={fVals} sliderT={sliderT} showSlider={false} width={W / 2 - 5} />
          <PlotPanel label="g(τ)" color="#a78bfa" vals={gVals} sliderT={sliderT} showSlider={false} width={W / 2 - 5} />
        </div>

        {/* Row 2: g flipped and shifted */}
        <SectionLabel>② g(t−τ) — FLIPPED &amp; SHIFTED TO t = {sliderT.toFixed(2)}</SectionLabel>
        <div style={{ position: 'relative', cursor: 'ew-resize' }}
          ref={svgRef}
          onMouseDown={() => setDragging(true)}
          onTouchStart={() => setDragging(true)}>
          <PlotPanel label="g(t−τ)" color="#a78bfa" vals={gFlippedVals} sliderT={sliderT}
            showSlider overlayVals={fVals} overlayColor="#22d3ee" productVals={productVals} width={W} />
          {/* Draggable handle */}
          <div style={{
            position: 'absolute', top: 20, left: sliderX - 6,
            width: 12, height: H - 40, cursor: 'ew-resize',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 3, height: '100%', background: '#facc15',
              boxShadow: '0 0 8px #facc1588', borderRadius: 2,
            }} />
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#4ade8055', textAlign: 'center', letterSpacing: '1px' }}>
          ↔ DRAG TO SLIDE t — shaded area = f(τ)·g(t−τ) product
        </div>

        {/* Row 3: Output */}
        <SectionLabel>③ CONVOLUTION OUTPUT (f ★ g)(t)</SectionLabel>
        <OutputPanel convVals={convVals} convUpTo={convUpTo} sliderT={sliderT} />

      </div>

      <div style={{ fontSize: '10px', color: '#4ade8033', letterSpacing: '2px', marginTop: '8px' }}>
        NUMERICAL INTEGRATION · Δt = {dt.toFixed(3)} · N = {N} SAMPLES
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#4ade8066', borderBottom: '1px solid #4ade8022', paddingBottom: '4px' }}>
      {children}
    </div>
  );
}

function PlotPanel({ label, color, vals, sliderT, showSlider, overlayVals, overlayColor, productVals, width = W }) {
  const h = H;
  const pad = 20;
  const allVals = overlayVals ? [...vals, ...overlayVals] : vals;
  const valid = allVals.filter(isFinite);
  const yMin = Math.min(...valid, 0) * 1.3 - 0.1;
  const yMax = Math.max(...valid, 0) * 1.3 + 0.1;
  const yRange = yMax - yMin || 1;

  function toPath(arr) {
    return arr.map((v, i) => {
      const x = pad + i * (width - pad * 2) / N;
      const y = h - pad - (v - yMin) / yRange * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }

  let areaPath = '';
  if (productVals) {
    const baseline = h - pad - (0 - yMin) / yRange * (h - pad * 2);
    const pts = productVals.map((v, i) => {
      const x = pad + i * (width - pad * 2) / N;
      const y = h - pad - (Math.max(0, v) - yMin) / yRange * (h - pad * 2);
      return [x, y];
    });
    const neg = productVals.map((v, i) => {
      const x = pad + i * (width - pad * 2) / N;
      const y = h - pad - (Math.min(0, v) - yMin) / yRange * (h - pad * 2);
      return [x, y];
    });
    areaPath = `M${pts[0][0]},${baseline} ` + pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L${pts[pts.length - 1][0]},${baseline} Z`;
  }

  const sliderX = pad + ((sliderT - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (width - pad * 2);
  const xTicks = [-4, -2, 0, 2, 4];

  return (
    <svg width={width} height={h} style={{ display: 'block', background: '#020c04', borderRadius: 3, border: '1px solid #4ade8011' }}>
      <defs>
        <filter id={`glow-${label}`}>
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Grid */}
      <g opacity="0.2">
        {xTicks.map(t => {
          const x = pad + ((t - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (width - pad * 2);
          return <line key={t} x1={x} y1={pad} x2={x} y2={h - pad} stroke="#4ade80" strokeWidth="0.5" strokeDasharray="3,3" />;
        })}
        <line x1={pad} y1={h - pad - (0 - yMin) / yRange * (h - pad * 2)}
          x2={width - pad} y2={h - pad - (0 - yMin) / yRange * (h - pad * 2)}
          stroke="#4ade80" strokeWidth="0.8" />
      </g>
      {/* Shaded area */}
      {areaPath && <path d={areaPath} fill="#facc15" opacity="0.2" />}
      {/* Overlay */}
      {overlayVals && <path d={toPath(overlayVals)} fill="none" stroke={overlayColor} strokeWidth="1.5" opacity="0.5" />}
      {/* Main */}
      <path d={toPath(vals)} fill="none" stroke={color} strokeWidth="2" filter={`url(#glow-${label})`} />
      {/* Slider */}
      {showSlider && <line x1={sliderX} y1={pad} x2={sliderX} y2={h - pad} stroke="#facc15" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.9" />}
      {/* Labels */}
      <text x={pad + 4} y={pad + 12} fill={color} fontSize="10" fontFamily="monospace" opacity="0.8">{label}</text>
      {xTicks.map(v => (
        <text key={v} x={pad + ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (width - pad * 2) - 4}
          y={h - 5} fill="#4ade80" fontSize="8" fontFamily="monospace" opacity="0.4">{v}</text>
      ))}
    </svg>
  );
}

function OutputPanel({ convVals, convUpTo, sliderT }) {
  const h = H;
  const pad = 20;
  const valid = convVals.filter(isFinite);
  const yMin = Math.min(...valid, 0) * 1.2 - 0.1;
  const yMax = Math.max(...valid, 0) * 1.2 + 0.1;
  const yRange = yMax - yMin || 1;
  const xTicks = [-4, -2, 0, 2, 4];

  function toPath(arr, skipNaN = false) {
    let d = '';
    let penUp = true;
    for (let i = 0; i < arr.length; i++) {
      if (!isFinite(arr[i])) { penUp = true; continue; }
      const x = pad + i * (W - pad * 2) / N;
      const y = h - pad - (arr[i] - yMin) / yRange * (h - pad * 2);
      if (penUp) { d += `M${x.toFixed(2)},${y.toFixed(2)}`; penUp = false; }
      else d += ` L${x.toFixed(2)},${y.toFixed(2)}`;
    }
    return d;
  }

  const sliderX = pad + ((sliderT - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (W - pad * 2);
  const tIdx = Math.round((sliderT - DOMAIN[0]) / dt);
  const currentVal = convVals[Math.max(0, Math.min(N - 1, tIdx))];
  const dotX = sliderX;
  const dotY = h - pad - (currentVal - yMin) / yRange * (h - pad * 2);

  return (
    <svg width={W} height={h} style={{ display: 'block', background: '#020c04', borderRadius: 3, border: '1px solid #4ade8011' }}>
      <defs>
        <filter id="glow-out">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g opacity="0.2">
        {xTicks.map(t => {
          const x = pad + ((t - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (W - pad * 2);
          return <line key={t} x1={x} y1={pad} x2={x} y2={h - pad} stroke="#4ade80" strokeWidth="0.5" strokeDasharray="3,3" />;
        })}
        <line x1={pad} y1={h - pad - (0 - yMin) / yRange * (h - pad * 2)}
          x2={W - pad} y2={h - pad - (0 - yMin) / yRange * (h - pad * 2)}
          stroke="#4ade80" strokeWidth="0.8" />
      </g>
      {/* Ghost full output */}
      <path d={toPath(convVals)} fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.15" />
      {/* Traced output */}
      <path d={toPath(convUpTo)} fill="none" stroke="#4ade80" strokeWidth="2.5" filter="url(#glow-out)" />
      {/* Current value dot */}
      {isFinite(dotY) && (
        <circle cx={dotX} cy={dotY} r={5} fill="#4ade80" filter="url(#glow-out)" />
      )}
      {/* Slider */}
      <line x1={sliderX} y1={pad} x2={sliderX} y2={h - pad} stroke="#facc15" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.7" />
      {/* Value readout */}
      {isFinite(currentVal) && (
        <text x={dotX + 8} y={Math.max(pad + 12, Math.min(h - pad - 4, dotY))}
          fill="#4ade80" fontSize="10" fontFamily="monospace" opacity="0.9">
          {currentVal.toFixed(3)}
        </text>
      )}
      <text x={pad + 4} y={pad + 12} fill="#4ade80" fontSize="10" fontFamily="monospace" opacity="0.8">(f★g)(t)</text>
      {xTicks.map(v => (
        <text key={v} x={pad + ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (W - pad * 2) - 4}
          y={h - 5} fill="#4ade80" fontSize="8" fontFamily="monospace" opacity="0.4">{v}</text>
      ))}
    </svg>
  );
}

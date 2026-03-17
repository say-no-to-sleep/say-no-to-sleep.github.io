import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════

const C = {
  bg: '#0b0b15',
  panel: '#11111f',
  card: '#17172a',
  border: '#23233a',
  muted: '#303050',
  dim: '#505075',
  text: '#dde0f8',
  default: '#4468f0',
  cmp: '#f5c030',
  swp: '#f04060',
  done: '#3fc896',
  pivot: '#b86cf0',
  ptr: '#f07828',
};

const ALGOS = ['bubble','selection','insertion','heap','merge','quick'];

const NAMES = {
  bubble:'Bubble', selection:'Selection', insertion:'Insertion',
  heap:'Heap', merge:'Merge', quick:'Quick',
};

const FULL = {
  bubble:'Bubble Sort', selection:'Selection Sort', insertion:'Insertion Sort',
  heap:'Heap Sort', merge:'Merge Sort', quick:'Quicksort',
};

const COMPL = {
  bubble:    {best:'Ω(n)',       avg:'Θ(n²)',      worst:'O(n²)',      space:'O(1)',      stable:true },
  selection: {best:'Ω(n²)',      avg:'Θ(n²)',      worst:'O(n²)',      space:'O(1)',      stable:false},
  insertion: {best:'Ω(n)',       avg:'Θ(n²)',      worst:'O(n²)',      space:'O(1)',      stable:true },
  heap:      {best:'Ω(n log n)', avg:'Θ(n log n)', worst:'O(n log n)', space:'O(1)',      stable:false},
  merge:     {best:'Ω(n log n)', avg:'Θ(n log n)', worst:'O(n log n)', space:'O(n)',      stable:true },
  quick:     {best:'Ω(n log n)', avg:'Θ(n log n)', worst:'O(n²)',      space:'O(log n)', stable:false},
};

const RCOLS = ['#4468f0','#f5c030','#3fc896','#b86cf0','#f07828','#f04060','#38bdf8'];

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════

function randArr(n) {
  const a = Array.from({length:n}, (_,i)=>i+1);
  for (let i=n-1;i>0;i--) { const j=0|(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function mk(arr, done, cmp, swp, comparing, swapping, desc, extra={}) {
  return { array:[...arr], sorted:new Set(done), comparing, swapping,
    description:desc, comparisons:cmp, swaps:swp,
    pivot:null, lo:null, hi:null, regions:[], heapSize:null, ...extra };
}

// ═══════════════════════════════════════════════════════════
//  STEP GENERATORS
// ═══════════════════════════════════════════════════════════

function genBubble(src) {
  const s=[], a=[...src], n=a.length, D=new Set();
  let c=0, w=0;
  for (let i=0;i<n-1;i++) {
    for (let j=0;j<n-i-1;j++) {
      c++;
      s.push(mk(a,D,c,w,[j,j+1],[], `Compare a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}`));
      if (a[j]>a[j+1]) {
        w++;
        s.push(mk(a,D,c,w,[j,j+1],[j,j+1], `Swap: ${a[j]} > ${a[j+1]}`));
        [a[j],a[j+1]]=[a[j+1],a[j]];
        s.push(mk(a,D,c,w,[],[],`After swap`));
      }
    }
    D.add(n-i-1);
    s.push(mk(a,D,c,w,[],[],`${a[n-i-1]} settled at position ${n-i-1}`));
  }
  D.add(0);
  s.push(mk(a,D,c,w,[],[],`Done! ${c} comparisons, ${w} swaps`));
  return s;
}

function genSelection(src) {
  const s=[], a=[...src], n=a.length, D=new Set();
  let c=0, w=0;
  for (let i=0;i<n-1;i++) {
    let mi=i;
    s.push(mk(a,D,c,w,[i],[],`Pass ${i+1}: searching for minimum in a[${i}..${n-1}]`));
    for (let j=i+1;j<n;j++) {
      c++;
      s.push(mk(a,D,c,w,[mi,j],[],`Compare min(${a[mi]}) with a[${j}]=${a[j]}`));
      if (a[j]<a[mi]) { mi=j; s.push(mk(a,D,c,w,[mi],[],`New minimum: ${a[mi]} at index ${mi}`)); }
    }
    if (mi!==i) {
      w++;
      s.push(mk(a,D,c,w,[i,mi],[i,mi],`Swap a[${i}]=${a[i]} ↔ a[${mi}]=${a[mi]}`));
      [a[i],a[mi]]=[a[mi],a[i]];
    }
    D.add(i);
    s.push(mk(a,D,c,w,[],[],`Position ${i} settled: ${a[i]}`));
  }
  D.add(n-1);
  s.push(mk(a,D,c,w,[],[],`Done! ${c} comparisons, ${w} swaps`));
  return s;
}

function genInsertion(src) {
  const s=[], a=[...src], n=a.length, D=new Set([0]);
  let c=0, w=0;
  s.push(mk(a,D,c,w,[0],[],`a[0]=${a[0]} is trivially sorted`));
  for (let i=1;i<n;i++) {
    const key=a[i];
    s.push(mk(a,D,c,w,[i],[],`Insert key=${key} into sorted portion a[0..${i-1}]`));
    let j=i-1;
    while (j>=0) {
      c++;
      s.push(mk(a,D,c,w,[j,j+1],[],`a[${j}]=${a[j]} vs key=${key}`));
      if (a[j]>key) {
        w++;
        s.push(mk(a,D,c,w,[j,j+1],[j,j+1],`Shift a[${j}]=${a[j]} right`));
        a[j+1]=a[j]; j--;
      } else break;
    }
    a[j+1]=key; D.add(i);
    s.push(mk(a,D,c,w,[j+1],[],`Placed ${key} at index ${j+1}`));
  }
  s.push(mk(a,D,c,w,[],[],`Done! ${c} comparisons, ${w} swaps`));
  return s;
}

function genHeap(src) {
  const s=[], a=[...src], n=a.length, D=new Set();
  let c=0, w=0, hs=n;
  const S=(cmp,swp,cmpArr,swpArr,desc)=>s.push(mk(a,D,cmp,swp,cmpArr,swpArr,desc,{heapSize:hs}));

  function siftDown(root, size) {
    let cur=root;
    while (true) {
      let lg=cur;
      const l=2*cur+1, r=2*cur+2;
      if (l<size) { c++; S(c,w,[lg,l],[],`Compare a[${lg}]=${a[lg]} with left child a[${l}]=${a[l]}`); if(a[l]>a[lg]) lg=l; }
      if (r<size) { c++; S(c,w,[lg,r],[],`Compare a[${lg}]=${a[lg]} with right child a[${r}]=${a[r]}`); if(a[r]>a[lg]) lg=r; }
      if (lg!==cur) {
        w++; S(c,w,[cur,lg],[cur,lg],`Swap a[${cur}]=${a[cur]} ↔ a[${lg}]=${a[lg]}`);
        [a[cur],a[lg]]=[a[lg],a[cur]]; S(c,w,[],[],`After swap`); cur=lg;
      } else { S(c,w,[cur],[],`a[${cur}] satisfies heap order`); break; }
    }
  }

  S(c,w,[],[],`Building max-heap (bottom-up heapify, n=${n})`);
  for (let i=(n>>1)-1;i>=0;i--) { S(c,w,[i],[],`Heapify subtree rooted at index ${i}`); siftDown(i,n); }
  S(c,w,[],[],`Max-heap built! Begin extraction phase`);

  for (let i=n-1;i>0;i--) {
    w++; S(c,w,[0,i],[0,i],`Extract max: swap root ${a[0]} with a[${i}]=${a[i]}`);
    [a[0],a[i]]=[a[i],a[0]]; D.add(i); hs=i;
    S(c,w,[],[],`Extracted ${a[i]}, heap size → ${i}`);
    if (i>1) siftDown(0,i);
  }
  D.add(0); hs=0;
  s.push(mk(a,D,c,w,[],[],`Done! ${c} comparisons, ${w} swaps`,{heapSize:0}));
  return s;
}

function genMerge(src) {
  const s=[], a=[...src], n=a.length, D=new Set();
  let c=0, w=0, regs=[];
  const S=(cmpArr,swpArr,desc)=>s.push(mk(a,D,c,w,cmpArr,swpArr,desc,{regions:[...regs]}));

  function ms(l, r, d) {
    if (l>=r) return;
    const m=(l+r)>>1;
    regs=[...regs,{start:l,end:r,depth:d,color:RCOLS[d%RCOLS.length]}];
    S([],[],`Divide [${l}..${r}] → [${l}..${m}] | [${m+1}..${r}]`);
    ms(l,m,d+1); ms(m+1,r,d+1);
    const L=a.slice(l,m+1), R=a.slice(m+1,r+1);
    let i=0,j=0,k=l;
    S([],[],`Merge [${l}..${m}] with [${m+1}..${r}]`);
    while (i<L.length&&j<R.length) {
      c++; S([l+i,m+1+j],[],`Compare L[${i}]=${L[i]} vs R[${j}]=${R[j]}`);
      if (L[i]<=R[j]) { a[k]=L[i]; i++; } else { a[k]=R[j]; j++; w++; }
      S([],[k],`Write ${a[k]} → pos ${k}`); k++;
    }
    while(i<L.length){a[k]=L[i];S([],[k],`Copy L[${i}]=${L[i]}`);i++;k++;}
    while(j<R.length){a[k]=R[j];S([],[k],`Copy R[${j}]=${R[j]}`);j++;k++;}
    regs=regs.filter(rg=>!(rg.start===l&&rg.end===r&&rg.depth===d));
    for(let x=l;x<=r;x++) D.add(x);
    S([],[],`Merged [${l}..${r}] — ${r-l+1} elements sorted`);
  }

  S([],[],`Starting merge sort (n=${n})`);
  ms(0,n-1,0);
  s.push(mk(a,D,c,w,[],[],`Done! ${c} comparisons, ${w} out-of-order writes`));
  return s;
}

function genQuick(src) {
  const s=[], a=[...src], n=a.length, D=new Set();
  let c=0, w=0;
  const S=(cmpArr,swpArr,desc,piv=null,lo=null,hi=null)=>
    s.push(mk(a,D,c,w,cmpArr,swpArr,desc,{pivot:piv,lo,hi}));

  function partition(lo, hi) {
    const pv=a[hi];
    S([],[],`Partition [${lo}..${hi}], pivot = ${pv} (a[${hi}])`,hi,lo,hi);
    let i=lo-1;
    for (let j=lo;j<hi;j++) {
      c++; S([j,hi],[],`a[${j}]=${a[j]} ≤ pivot ${pv}?`,hi,lo,hi);
      if (a[j]<=pv) {
        i++;
        if (i!==j) {
          w++; S([i,j],[i,j],`Yes → swap a[${i}]=${a[i]} ↔ a[${j}]=${a[j]}`,hi,lo,hi);
          [a[i],a[j]]=[a[j],a[i]]; S([],[],`After swap`,hi,lo,hi);
        } else { S([i],[],`Yes → a[${j}] stays in place`,hi,lo,hi); }
      } else { S([j],[],`No → a[${j}] stays on right side`,hi,lo,hi); }
    }
    w++; S([i+1,hi],[i+1,hi],`Place pivot: swap a[${i+1}]=${a[i+1]} ↔ a[${hi}]=${pv}`,hi,lo,hi);
    [a[i+1],a[hi]]=[a[hi],a[i+1]];
    const p=i+1; D.add(p);
    S([],[],`Pivot ${pv} at final position ${p}`,p,lo,hi);
    return p;
  }

  function qs(lo, hi) {
    if (lo>hi) return;
    if (lo===hi) { D.add(lo); S([lo],[],`a[${lo}]=${a[lo]} alone → sorted`,null,lo,hi); return; }
    const p=partition(lo,hi); qs(lo,p-1); qs(p+1,hi);
  }

  S([],[],`Starting quicksort (n=${n}, pivot = last element)`);
  qs(0,n-1);
  s.push(mk(a,D,c,w,[],[],`Done! ${c} comparisons, ${w} swaps`));
  return s;
}

const GEN = {bubble:genBubble, selection:genSelection, insertion:genInsertion, heap:genHeap, merge:genMerge, quick:genQuick};

// ═══════════════════════════════════════════════════════════
//  HOOK
// ═══════════════════════════════════════════════════════════

function useAlgo(initAlgo='bubble', initN=16) {
  const [algo, setAlgo] = useState(initAlgo);
  const [n, setN] = useState(initN);
  const [base, setBase] = useState(()=>randArr(initN));
  const [steps, setSteps] = useState([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(220);
  const timer = useRef(null);

  useEffect(()=>{
    const g=GEN[algo];
    if(g){setSteps(g(base));setIdx(0);setPlaying(false);}
  },[algo,base]);

  useEffect(()=>{
    clearInterval(timer.current);
    if(playing){
      timer.current=setInterval(()=>{
        setIdx(i=>{ if(i>=steps.length-1){setPlaying(false);return i;} return i+1; });
      },speed);
    }
    return ()=>clearInterval(timer.current);
  },[playing,speed,steps.length]);

  const shuffle=useCallback(()=>setBase(randArr(n)),[n]);
  const resize=useCallback((v)=>{setN(v);setBase(randArr(v));},[]);

  const cur=steps[idx]||{
    array:base, comparing:[], swapping:[], sorted:new Set(),
    pivot:null, lo:null, hi:null, regions:[], description:'',
    comparisons:0, swaps:0, heapSize:null,
  };

  return {algo,setAlgo,n,resize,base,setBase,steps,idx,setIdx,playing,setPlaying,speed,setSpeed,shuffle,cur,total:steps.length};
}

// ═══════════════════════════════════════════════════════════
//  BAR CHART
// ═══════════════════════════════════════════════════════════

function BarChart({cur, height=180, width=500}) {
  const {array,comparing,swapping,sorted,pivot,lo,hi,regions}=cur;
  const n=array.length;
  const bw=Math.max(2,Math.floor((width-n)/n));
  const gap=1;

  const barCol=i=>{
    if(swapping.includes(i)) return C.swp;
    if(comparing.includes(i)) return C.cmp;
    if(i===pivot) return C.pivot;
    if(lo!==null&&i===lo) return C.ptr;
    if(hi!==null&&i===hi) return C.ptr;
    if(sorted.has(i)) return C.done;
    return C.default;
  };

  const glow=i=>{
    if(swapping.includes(i)) return `0 0 10px ${C.swp}99`;
    if(comparing.includes(i)) return `0 0 10px ${C.cmp}99`;
    return 'none';
  };

  const hasPtr=lo!==null||hi!==null||pivot!==null;

  return (
    <div style={{position:'relative',paddingTop:hasPtr?22:0}}>
      {/* Merge brackets */}
      {regions.map((reg,ri)=>{
        const x=reg.start*(bw+gap);
        const w2=(reg.end-reg.start+1)*(bw+gap)-gap;
        const top=reg.depth*5;
        return (
          <div key={ri} style={{
            position:'absolute',left:x,top:top+(hasPtr?22:0),
            width:w2,height:height-top,
            border:`1.5px solid ${reg.color}`,borderBottom:'none',
            borderRadius:'4px 4px 0 0',opacity:0.45,pointerEvents:'none',
          }}/>
        );
      })}

      {/* Pointers (Quicksort) */}
      {hasPtr&&(
        <div style={{position:'absolute',top:0,left:0,height:20,width:'100%',pointerEvents:'none'}}>
          {lo!==null&&<span style={{position:'absolute',left:lo*(bw+gap),fontSize:9,color:C.ptr,fontFamily:'monospace',lineHeight:'1'}}>lo↓</span>}
          {hi!==null&&hi!==pivot&&<span style={{position:'absolute',left:hi*(bw+gap),fontSize:9,color:C.ptr,fontFamily:'monospace',lineHeight:'1'}}>hi↓</span>}
          {pivot!==null&&<span style={{position:'absolute',left:pivot*(bw+gap),fontSize:9,color:C.pivot,fontFamily:'monospace',lineHeight:'1'}}>p↓</span>}
        </div>
      )}

      {/* Bars */}
      <div style={{display:'flex',alignItems:'flex-end',gap:gap,height}}>
        {array.map((v,i)=>{
          const h=Math.max(2,(v/n)*height);
          const col=barCol(i);
          return (
            <div key={i} style={{
              width:bw,height:h,background:col,
              borderRadius:'2px 2px 0 0',flexShrink:0,
              transition:'background 0.07s, box-shadow 0.07s',
              boxShadow:glow(i),
            }}/>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  HEAP TREE
// ═══════════════════════════════════════════════════════════

function HeapTree({cur}) {
  const {array,heapSize,comparing,swapping,sorted}=cur;
  const n=Math.min(array.length,31);
  if(!n) return null;
  const levels=Math.ceil(Math.log2(n+1));
  const W=300,H=155;
  const nr=Math.max(7,Math.min(14,55/levels));
  const fs=Math.max(6,nr-3);

  const pos=i=>{
    const lv=Math.floor(Math.log2(i+1));
    const p=i-((1<<lv)-1), t=1<<lv;
    return {x:((p+0.5)/t)*W, y:((lv+0.5)/levels)*H};
  };

  const nodeCol=i=>{
    if(swapping.includes(i)) return C.swp;
    if(comparing.includes(i)) return C.cmp;
    if(heapSize!==null&&i>=heapSize) return C.done;
    return C.default;
  };

  const lines=[],nodes=[];
  for(let i=0;i<n;i++){
    const p=pos(i);
    const inH=heapSize===null||i<heapSize;
    [2*i+1,2*i+2].forEach(ch=>{
      if(ch<n){const cp=pos(ch);lines.push(<line key={`l${i}-${ch}`} x1={p.x} y1={p.y} x2={cp.x} y2={cp.y} stroke={C.border} strokeWidth={1.5}/>);}
    });
    const col=nodeCol(i);
    nodes.push(
      <g key={i} opacity={inH?1:0.4}>
        <circle cx={p.x} cy={p.y} r={nr} fill={col}/>
        <text x={p.x} y={p.y+fs*0.35} textAnchor="middle" fontSize={fs} fill="#0b0b15" fontWeight="700" fontFamily="monospace">{array[i]}</text>
      </g>
    );
  }

  return (
    <div style={{background:C.card,borderRadius:10,padding:'10px 14px'}}>
      <div style={{fontSize:9,fontFamily:'monospace',color:C.dim,marginBottom:6,letterSpacing:2}}>
        HEAP TREE · heap size = {heapSize??n}
      </div>
      <svg width={W} height={H}>{lines}{nodes}</svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PROGRESS BAR
// ═══════════════════════════════════════════════════════════

function Progress({idx, total}) {
  const pct=total>0?((idx+1)/total)*100:0;
  return (
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{flex:1,height:3,background:C.muted,borderRadius:2,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:C.default,borderRadius:2,transition:'width 0.08s'}}/>
      </div>
      <span style={{fontFamily:'monospace',fontSize:10,color:C.dim,minWidth:72,textAlign:'right'}}>
        step {idx+1} / {total||'—'}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  CONTROLS
// ═══════════════════════════════════════════════════════════

function Controls({state,compact=false}) {
  const {idx,total,playing,speed,n,setIdx,setPlaying,setSpeed,resize,shuffle}=state;

  const Btn=({ch,onClick,dis=false})=>(
    <button onClick={onClick} disabled={dis} style={{
      background:C.card,color:dis?C.muted:C.text,
      border:`1px solid ${dis?C.muted:C.border}`,
      borderRadius:6,padding:compact?'4px 8px':'5px 10px',
      cursor:dis?'not-allowed':'pointer',fontFamily:'monospace',
      fontSize:compact?11:12,lineHeight:1.2,
    }}>{ch}</button>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <div style={{display:'flex',gap:5,alignItems:'center',flexWrap:'wrap'}}>
        <Btn ch="⏮" onClick={()=>setIdx(0)} dis={idx===0}/>
        <Btn ch="◀" onClick={()=>setIdx(i=>Math.max(0,i-1))} dis={idx===0}/>
        <button onClick={()=>setPlaying(p=>!p)} style={{
          background:playing?C.swp:C.default,color:'#fff',border:'none',
          borderRadius:6,padding:compact?'4px 14px':'5px 16px',
          cursor:'pointer',fontFamily:'monospace',fontSize:compact?11:12,fontWeight:600,
        }}>{playing?'⏸ Pause':'▶ Play'}</button>
        <Btn ch="▶" onClick={()=>setIdx(i=>Math.min(total-1,i+1))} dis={idx>=total-1}/>
        <Btn ch="⏭" onClick={()=>setIdx(total-1)} dis={idx>=total-1}/>
        <Btn ch="⟳" onClick={shuffle}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <span style={{color:C.dim,fontFamily:'monospace',fontSize:10,minWidth:34}}>speed</span>
        <input type="range" min={30} max={900} step={10} value={930-speed}
          onChange={e=>setSpeed(930-parseInt(e.target.value))}
          style={{flex:1,accentColor:C.default}}/>
        <span style={{color:C.dim,fontFamily:'monospace',fontSize:10,minWidth:42}}>{speed}ms</span>
      </div>
      {!compact&&(
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:C.dim,fontFamily:'monospace',fontSize:10,minWidth:34}}>size</span>
          <input type="range" min={6} max={40} step={2} value={n}
            onChange={e=>resize(parseInt(e.target.value))}
            style={{flex:1,accentColor:C.default}}/>
          <span style={{color:C.dim,fontFamily:'monospace',fontSize:10,minWidth:42}}>{n} els</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ALGO PANEL
// ═══════════════════════════════════════════════════════════

function AlgoPanel({state,compact=false}) {
  const {algo,cur}=state;
  const cW=compact?300:500, cH=compact?130:175;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{background:C.card,borderRadius:10,padding:compact?12:16,overflow:'visible'}}>
        <BarChart cur={cur} height={cH} width={cW}/>
      </div>

      {algo==='heap'&&(
        <HeapTree cur={cur}/>
      )}

      <div style={{
        fontFamily:'monospace',fontSize:compact?11:12,color:C.text,
        background:C.card,borderRadius:8,padding:'8px 12px',
        borderLeft:`2px solid ${C.default}`,minHeight:34,lineHeight:1.5,
      }}>
        {cur.description||'—'}
      </div>

      <Progress idx={state.idx} total={state.total}/>

      <div style={{display:'flex',gap:18}}>
        <span style={{fontFamily:'monospace',fontSize:11,color:C.dim}}>
          comparisons: <span style={{color:C.cmp,fontWeight:600}}>{cur.comparisons}</span>
        </span>
        <span style={{fontFamily:'monospace',fontSize:11,color:C.dim}}>
          swaps: <span style={{color:C.swp,fontWeight:600}}>{cur.swaps}</span>
        </span>
      </div>

      <Controls state={state} compact={compact}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  COMPLEXITY TABLE
// ═══════════════════════════════════════════════════════════

function ComplexityTable({algo}) {
  const c=COMPL[algo];
  if(!c) return null;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:0}}>
      {[['Best case',c.best,false],['Average',c.avg,true],['Worst case',c.worst,false],['Space',c.space,false],['Stable',c.stable?'✓ Yes':'✗ No',false]].map(([lbl,val,hi])=>(
        <div key={lbl} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontFamily:'monospace',fontSize:11,color:C.dim}}>{lbl}</span>
          <span style={{fontFamily:'monospace',fontSize:11,color:hi?C.cmp:val.startsWith('✓')?C.done:val.startsWith('✗')?C.dim:C.text}}>{val}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  LEGEND
// ═══════════════════════════════════════════════════════════

function Legend() {
  const items=[[C.default,'Unsorted'],[C.cmp,'Comparing'],[C.swp,'Swapping'],[C.done,'Sorted'],[C.pivot,'Pivot (Quick)'],[C.ptr,'lo / hi pointer']];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:0}}>
      {items.map(([col,lbl])=>(
        <div key={lbl} style={{display:'flex',alignItems:'center',gap:9,padding:'4px 0',borderBottom:`1px solid ${C.border}`}}>
          <div style={{width:9,height:9,borderRadius:2,background:col,flexShrink:0}}/>
          <span style={{fontFamily:'monospace',fontSize:11,color:C.dim}}>{lbl}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════

export default function SortViz() {
  const [mode,setMode]=useState('single');
  const single=useAlgo('bubble',16);
  const pA=useAlgo('bubble',16);
  const pB=useAlgo('merge',16);

  const syncBoth=()=>{
    const arr=randArr(pA.n);
    pA.setBase([...arr]);
    pB.setBase([...arr]);
  };

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,padding:'18px 22px'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${C.bg};}
        select option{background:${C.panel};}
        ::-webkit-scrollbar{width:5px;background:${C.bg};}
        ::-webkit-scrollbar-thumb{background:${C.muted};border-radius:3px;}
        input[type=range]{height:3px;cursor:pointer;}
        button:hover{opacity:0.85;}
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:18}}>
        <div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,letterSpacing:'-0.5px',lineHeight:1}}>
            SORT<span style={{color:C.default}}>.</span>VIZ
          </h1>
          <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:C.dim,letterSpacing:3,marginTop:4}}>
            INTERACTIVE ALGORITHM VISUALIZER
          </p>
        </div>
        <div style={{display:'flex',background:C.panel,borderRadius:8,padding:4,gap:4,border:`1px solid ${C.border}`}}>
          {[['single','① Single'],['compare','⓶ Compare']].map(([m,lbl])=>(
            <button key={m} onClick={()=>setMode(m)} style={{
              background:mode===m?C.default:'transparent',
              color:mode===m?'#fff':C.dim,
              border:'none',borderRadius:6,padding:'6px 16px',cursor:'pointer',
              fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,
              textTransform:'uppercase',letterSpacing:1,transition:'all 0.15s',
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* ── Single Mode ─────────────────────────────────────── */}
      {mode==='single'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 250px',gap:16,alignItems:'start'}}>
          <div>
            {/* Algo tabs */}
            <div style={{display:'flex',gap:2,background:C.panel,borderRadius:10,padding:4,marginBottom:14,border:`1px solid ${C.border}`}}>
              {ALGOS.map(a=>(
                <button key={a} onClick={()=>single.setAlgo(a)} style={{
                  flex:1,background:single.algo===a?C.default:'transparent',
                  color:single.algo===a?'#fff':C.dim,
                  border:'none',borderRadius:7,padding:'7px 3px',cursor:'pointer',
                  fontFamily:"'Syne',sans-serif",fontSize:11,
                  fontWeight:single.algo===a?700:500,transition:'all 0.12s',
                }}>
                  {NAMES[a]}
                </button>
              ))}
            </div>
            <AlgoPanel state={single}/>
          </div>

          {/* Sidebar */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{background:C.panel,borderRadius:10,padding:16,border:`1px solid ${C.border}`}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>
                {FULL[single.algo]}
              </div>
              <ComplexityTable algo={single.algo}/>
            </div>

            <div style={{background:C.panel,borderRadius:10,padding:16,border:`1px solid ${C.border}`}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>
                Array
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                <span style={{color:C.dim,fontFamily:'monospace',fontSize:10,minWidth:28}}>size</span>
                <input type="range" min={6} max={40} step={2} value={single.n}
                  onChange={e=>single.resize(parseInt(e.target.value))}
                  style={{flex:1,accentColor:C.default}}/>
                <span style={{color:C.text,fontFamily:'monospace',fontSize:10,minWidth:18}}>{single.n}</span>
              </div>
              <button onClick={single.shuffle} style={{
                width:'100%',background:C.card,color:C.text,
                border:`1px solid ${C.border}`,borderRadius:7,padding:'7px',
                cursor:'pointer',fontFamily:'monospace',fontSize:12,
              }}>⟳ New Array</button>
            </div>

            <div style={{background:C.panel,borderRadius:10,padding:16,border:`1px solid ${C.border}`}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>
                Legend
              </div>
              <Legend/>
            </div>
          </div>
        </div>
      )}

      {/* ── Compare Mode ────────────────────────────────────── */}
      {mode==='compare'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.dim}}>
              Run two algorithms side-by-side on the same or different arrays
            </p>
            <button onClick={syncBoth} style={{
              background:C.default,color:'#fff',border:'none',
              borderRadius:7,padding:'7px 16px',cursor:'pointer',
              fontFamily:'monospace',fontSize:11,fontWeight:600,
            }}>⟳ Sync Same Array</button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[pA,pB].map((panel,pi)=>(
              <div key={pi} style={{background:C.panel,borderRadius:12,padding:16,border:`1px solid ${C.border}`}}>
                {/* Panel header */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{
                    fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,
                    color:'#fff',textTransform:'uppercase',letterSpacing:2,
                    background:pi===0?C.default:C.pivot,borderRadius:5,padding:'3px 10px',
                  }}>
                    ALGO {pi===0?'A':'B'}
                  </div>
                  <select value={panel.algo} onChange={e=>panel.setAlgo(e.target.value)} style={{
                    background:C.card,color:C.text,border:`1px solid ${C.border}`,
                    borderRadius:7,padding:'5px 10px',fontFamily:'monospace',fontSize:11,cursor:'pointer',
                  }}>
                    {ALGOS.map(a=><option key={a} value={a}>{FULL[a]}</option>)}
                  </select>
                </div>

                {/* Complexity mini pills */}
                <div style={{display:'flex',gap:5,marginBottom:12,flexWrap:'wrap'}}>
                  {[['best',C.done],['avg',C.cmp],['worst',C.swp],['space',C.dim]].map(([k,col])=>(
                    <span key={k} style={{
                      fontFamily:'monospace',fontSize:9,color:col,
                      background:C.card,borderRadius:4,padding:'2px 7px',border:`1px solid ${C.border}`,
                    }}>
                      {k}: {COMPL[panel.algo][k]}
                    </span>
                  ))}
                </div>

                <AlgoPanel state={panel} compact={true}/>

                {/* Size per panel */}
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10}}>
                  <span style={{color:C.dim,fontFamily:'monospace',fontSize:10,minWidth:28}}>size</span>
                  <input type="range" min={6} max={32} step={2} value={panel.n}
                    onChange={e=>panel.resize(parseInt(e.target.value))}
                    style={{flex:1,accentColor:pi===0?C.default:C.pivot}}/>
                  <span style={{color:C.text,fontFamily:'monospace',fontSize:10,minWidth:20}}>{panel.n}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

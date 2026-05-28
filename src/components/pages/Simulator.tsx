import { useEffect, useRef, useState } from 'react';
import { initSimScene, SimController } from '../../scene/simScene';
import { SimAnalytics, SceneController } from '../../types';
import { CATEGORIES, weaponsInCategory, weaponById } from '../../data';

interface LogEntry { t: string; msg: string; kind: string; }

interface Props {
  isActive: boolean;
  simWeapon: string;
  onSimWeaponChange: (id: string) => void;
  mainSceneRef: React.RefObject<SceneController | null>;
}

export default function Simulator({ isActive, simWeapon, onSimWeaponChange, mainSceneRef }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const ctrlRef  = useRef<SimController | null>(null);
  const [analytics, setAnalytics] = useState<SimAnalytics>({ casualties: 0, radius: 0, cost: 0, halflife: 0, sparkHistory: [] });
  const [targetCoords, setTargetCoords] = useState('—');
  const [log, setLog] = useState<LogEntry[]>([]);

  const simWeaponRef = useRef(simWeapon);
  simWeaponRef.current = simWeapon;

  useEffect(() => {
    if (!isActive || !stageRef.current) return;
    const ctrl = initSimScene({
      stageEl: stageRef.current,
      getSelectedWeapon: () => simWeaponRef.current,
      onAnalyticsUpdate: setAnalytics,
      onTargetCoords: setTargetCoords,
      onLog: (msg, kind) => {
        const d = new Date();
        const tstr = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
        setLog(prev => [{ t: tstr, msg, kind }, ...prev].slice(0, 8));
      },
      triggerGlitch: () => mainSceneRef.current?.triggerGlitch(),
    });
    ctrlRef.current = ctrl;
    setTimeout(() => ctrl.resizeCanvas(), 100);
    const onResize = () => ctrl.resizeCanvas();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      ctrl.dispose();
      ctrlRef.current = null;
    };
  }, [isActive]);

  function formatCost(v: number): string {
    if (v >= 1e9) return '$ ' + (v/1e9).toFixed(2) + 'B';
    if (v >= 1e6) return '$ ' + (v/1e6).toFixed(1) + 'M';
    return '$ ' + v.toLocaleString();
  }
  function formatHalflife(v: number): string {
    return v > 365 ? (v/365).toFixed(1)+' y' : v + ' d';
  }

  const sparkPts = analytics.sparkHistory;
  const sparkPath = (() => {
    if (sparkPts.length < 2) return '';
    const max = Math.max(...sparkPts, 1);
    const W = 200, H = 36;
    return sparkPts.map((v, i) => {
      const x = (i / (sparkPts.length-1)) * W;
      const y = H - (v / max) * (H-2) - 1;
      return (i===0?'M':'L') + x.toFixed(1)+' '+y.toFixed(1);
    }).join(' ');
  })();

  return (
    <>
      <div className="page-head">
        <div className="left">
          <span className="crumb">// SIM.SANDBOX</span>
          <h1>IMPACT SIMULATOR <span className="sub">/ {weaponById(simWeapon)?.name ?? '—'}</span></h1>
        </div>
        <div className="meta">
          <div><span className="k">TARGET</span><span className="v">{targetCoords}</span></div>
          <div><span className="k">REGISTRY</span><span className="v">SANDBOX</span></div>
          <div><span className="k">YIELD</span><span className="v green">LIVE</span></div>
        </div>
      </div>
      <div className="sim">
        <div className="picker">
          <h3>// PAYLOAD</h3>
          <div>
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="pgroup">
                <div className="cat-name">{cat.name}</div>
                {weaponsInCategory(cat.id).map(w => (
                  <div
                    key={w.id}
                    className={`row${simWeapon===w.id?' active':''}`}
                    onClick={() => onSimWeaponChange(w.id)}
                  >
                    <span>{w.name}</span>
                    <span className="y">{cat.deploy.includes('DROP') ? '·' : '×'}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="deploy">▸ CLICK ANYWHERE ON EARTH<br/>TO DEPLOY</div>
        </div>
        <div className="stage" ref={stageRef}>
          <div className="crosshair" />
          <div className="center-info"><kbd>CLICK</kbd>DEPLOY · <kbd>DRAG</kbd>ROTATE</div>
        </div>
        <div className="analytics">
          <h3>// LIVE ANALYTICS</h3>
          <div className="stat-big">
            <div className="k">EST. CASUALTIES</div>
            <div className="v red">{analytics.casualties.toLocaleString()}</div>
            <div className="u">SOULS, MEDIAN ESTIMATE</div>
            <div className="spark">
              <svg viewBox="0 0 200 36" preserveAspectRatio="none">
                <path d={sparkPath} stroke="#dc2626" fill="none" strokeWidth="1.2" />
              </svg>
            </div>
          </div>
          <div className="stat-big">
            <div className="k">DESTRUCTION RADIUS</div>
            <div className="v">{analytics.radius.toFixed(1)} <span className="u" style={{ fontSize:14, color:'var(--dim)' }}>KM</span></div>
            <div className="u">KILOMETERS, FROM EPICENTER</div>
          </div>
          <div className="stat-big">
            <div className="k">FINANCIAL DAMAGE</div>
            <div className="v green">{formatCost(analytics.cost)}</div>
            <div className="u">USD, GLOBAL MARKETS</div>
          </div>
          <div className="stat-big">
            <div className="k">RESIDUAL HALF-LIFE</div>
            <div className="v">{analytics.halflife > 0 ? formatHalflife(analytics.halflife) : '0 d'}</div>
            <div className="u">UNTIL HABITABLE</div>
          </div>
          <div className="sim-log">
            {log.map((entry, i) => (
              <div key={i} className={`row${entry.kind?' '+entry.kind:''}`}>
                <span className="t">{entry.t}</span>
                <span>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

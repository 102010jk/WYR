import { forwardRef, useEffect, useState } from 'react';
import { Route, ToastState } from '../types';

interface HUDProps {
  route: Route;
  flashRef: React.RefObject<HTMLDivElement>;
  domMenuRef: React.RefObject<HTMLDivElement>;
  fpsRef: React.RefObject<HTMLSpanElement>;
  toast: ToastState | null;
}

export default function HUD({ route, flashRef, domMenuRef, fpsRef, toast }: HUDProps) {
  const [cfTime, setCfTime] = useState('--:--:--');

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setCfTime(
        String(d.getHours()).padStart(2,'0') + ':' +
        String(d.getMinutes()).padStart(2,'0') + ':' +
        String(d.getSeconds()).padStart(2,'0')
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const topState = { landing:'LANDING', arsenal:'ARSENAL', information:'INFORMATION', cart:'CART', simulator:'SIMULATOR' }[route] ?? route.toUpperCase();
  const topRoute = route === 'landing' ? 'CHANNEL OPEN' : 'CHANNEL: ' + route.toUpperCase();

  return (
    <div className="hud">
      <div className="scan" />
      <div className="vignette" />
      <div className="flash" ref={flashRef} />
      <div className="brackets">
        <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
      </div>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="l">
          <span className="pulse" />
          <span style={{ fontFamily:'var(--sans)', fontWeight:300, fontSize:14, letterSpacing:'.5em' }}>BBB</span>
          <span className="sep">/</span>
          <span className="label">{topState}</span>
          <span className="sep">/</span>
          <span className="label">{topRoute}</span>
        </div>
        <div className="r">
          <span>OP&nbsp;<span className="v" style={{ color:'var(--green)' }}>EAGLE-7</span></span>
          <span>FPS&nbsp;<span className="v" ref={fpsRef}>--</span></span>
          <span>UPLINK&nbsp;<span className="v" style={{ color:'var(--green)' }}>OK</span></span>
          <span><span className="pulse red" style={{ marginRight:6 }} />OP-SEC: <span className="v" style={{ color:'var(--red)' }}>RED</span></span>
        </div>
      </div>

      {/* Landing menu labels — populated by Three.js */}
      <div id="dom-menu" ref={domMenuRef} />

      {/* Landing tagline */}
      <div className={`tagline${route === 'landing' ? ' on' : ''}`}>
        <div className="b">Big <em>Boys</em> Bombs</div>
        <div className="s">DEFENSE LOGISTICS · ORBITAL DELIVERY · EST. 2079</div>
      </div>

      {/* Corner footer */}
      {route !== 'landing' && (
        <div className="corner-foot">
          <div>SECURE CHANNEL · <span className="v">{cfTime}</span></div>
          <div>SESSION&nbsp;<span className="v">7FD9-EAGLE-77</span>&nbsp;·&nbsp;ENCRYPTION&nbsp;<span className="v" style={{ color:'var(--green)' }}>AES-512</span></div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast${toast ? ' on' : ''}${toast?.red ? ' red' : ''}`}>
        {toast?.line}
        {toast?.sub && <span className="small">{toast.sub}</span>}
      </div>
    </div>
  );
}

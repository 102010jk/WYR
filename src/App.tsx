import { useState } from 'react';
import { SceneCanvas } from './scene/SceneCanvas';
import { HUDLayer } from './hud/HUDLayer';
import { BootSequence, shouldPlayBoot } from './hud/BootSequence';

export default function App() {
  const [booting, setBooting] = useState<boolean>(() => shouldPlayBoot());

  return (
    <>
      <SceneCanvas />
      {/* CRT scanlines + corner vignette — global unifying layer above the
          canvas but below HUD overlays. */}
      <div className="bbb-crt" />
      <HUDLayer />
      {booting && <BootSequence onComplete={() => setBooting(false)} />}
    </>
  );
}

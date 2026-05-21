import { useSimulatorStore } from '../../state/simulatorStore';
import { WEAPON_MAP } from '../../data/weapons';
import { WireframeEarth } from './WireframeEarth';
import { ImpactEffect } from './ImpactEffect';
import { sfx } from '../../audio/sfx';

const GLOBE_RADIUS = 2.2;

/**
 * Lives inside the persistent <Canvas>. Renders only when in simulator state.
 * Click on the globe → fire the active weapon → spawn an impact with sfx.
 */
export function SimulatorEarthScene() {
  const impacts = useSimulatorStore((s) => s.impacts);
  const activeWeaponId = useSimulatorStore((s) => s.activeWeaponId);
  const fireImpact = useSimulatorStore((s) => s.fireImpact);
  const removeImpact = useSimulatorStore((s) => s.removeImpact);

  return (
    <group>
      <WireframeEarth
        radius={GLOBE_RADIUS}
        onTargetSelect={(lat, lon) => {
          if (!activeWeaponId) {
            // Arm-first feedback: short error blip.
            sfx.play('click');
            return;
          }
          const impact = fireImpact(lat, lon);
          if (!impact) return;

          // Trigger the right SFX per weapon category.
          const weapon = WEAPON_MAP.get(activeWeaponId);
          switch (weapon?.category) {
            case 'orbital-laser': sfx.play('laser'); break;
            case 'nuke':          sfx.play('explosion'); break;
            case 'missile':       sfx.play('launch'); setTimeout(() => sfx.play('explosion'), 800); break;
            case 'drone-strike':  sfx.play('launch'); setTimeout(() => sfx.play('explosion'), 500); break;
            case 'grenade':       sfx.play('explosion'); break;
          }
        }}
      />

      {impacts.map((imp) => (
        <ImpactEffect
          key={imp.id}
          impact={imp}
          globeRadius={GLOBE_RADIUS}
          onDone={() => removeImpact(imp.id)}
        />
      ))}
    </group>
  );
}

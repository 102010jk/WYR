import { useCartStore } from '../../state/cartStore';
import { WireframeEarth } from '../../scene/earth/WireframeEarth';

/**
 * Mounted inside the persistent Canvas. Renders the WireframeEarth only when
 * the user is actively picking a DROP target. The currently-picked target (if
 * any) is shown as a pulsing red crosshair, and a fresh click updates it.
 */
export function CartEarthScene() {
  const targetPickingId = useCartStore((s) => s.targetPickingRowId);
  const items = useCartStore((s) => s.items);
  const setTarget = useCartStore((s) => s.setTarget);
  const cancelTargetPick = useCartStore((s) => s.cancelTargetPick);

  if (targetPickingId === null) return null;

  const item = items.find((i) => i.rowId === targetPickingId);
  if (!item) return null;

  const existingTarget =
    item.target && typeof item.target !== 'string' ? item.target : null;

  return (
    <WireframeEarth
      radius={2.0}
      marker={existingTarget}
      onTargetSelect={(lat, lon) => {
        setTarget(targetPickingId, { lat, lon });
        // Give the user a moment to see the crosshair land, then return to cart.
        setTimeout(() => cancelTargetPick(), 900);
      }}
    />
  );
}

import { useCartStore, isModeAllowed, type CartItem } from '../../state/cartStore';
import { WEAPON_MAP } from '../../data/weapons';
import { CATEGORY_MAP } from '../../data/categories';
import type { DeploymentMode } from '../../data/types';
import { useStaggerIn } from '../../animations/useStaggerIn';
import { GlassPanel } from '../components/GlassPanel';
import { TerminalText } from '../components/TerminalText';
import { RedAlertButton } from '../components/RedAlertButton';

const fmtUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const fmtLat = (lat: number) => `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
const fmtLon = (lon: number) => `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

// ─── Insufficient funds modal ────────────────────────────────────────────────

function InsufficientFundsModal() {
  const visible = useCartStore((s) => s.showInsufficientFunds);
  const dismiss = useCartStore((s) => s.dismissModal);

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'auto',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'bbb-fund-bg 0.9s ease-out infinite alternate',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '32px 56px',
          border: '2px solid rgba(220,38,38,0.85)',
          background: 'rgba(20,0,0,0.85)',
          boxShadow: '0 0 80px rgba(220,38,38,0.6), inset 0 0 30px rgba(220,38,38,0.18)',
          textAlign: 'center',
          animation: 'bbb-fund-pulse 0.9s ease-out infinite alternate',
          maxWidth: '90vw',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '0.32em',
            color: '#ff4242',
            textShadow: '0 0 20px rgba(220,38,38,0.9)',
          }}
        >
          INSUFFICIENT FUNDS
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: 'var(--font-terminal)',
            fontSize: 18,
            color: 'rgba(255,150,150,0.8)',
            letterSpacing: '0.1em',
          }}
        >
          TRANSACTION DENIED // CODE: 0xDEADC0DE
        </div>
        <div style={{ marginTop: 24 }}>
          <RedAlertButton onClick={dismiss}>ACKNOWLEDGE</RedAlertButton>
        </div>
      </div>
    </div>
  );
}

// ─── Single cart item row ────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const setMode = useCartStore((s) => s.setMode);
  const setTarget = useCartStore((s) => s.setTarget);
  const removeItem = useCartStore((s) => s.removeItem);
  const beginTargetPick = useCartStore((s) => s.beginTargetPick);

  const weapon = WEAPON_MAP.get(item.weaponId);
  if (!weapon) return null;
  const category = CATEGORY_MAP.get(weapon.category);

  const allowDrop = isModeAllowed(item.weaponId, 'DROP');
  const allowDeliver = isModeAllowed(item.weaponId, 'DELIVER');

  const target = item.target;
  const targetText =
    target == null
      ? '— NO TARGET SET —'
      : typeof target === 'string'
      ? target
      : `${fmtLat(target.lat)} / ${fmtLon(target.lon)}`;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 14,
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 10,
      }}
    >
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '0.12em', color: '#fff' }}>
          {weapon.name}
        </div>
        <div style={{ fontFamily: 'var(--font-terminal)', fontSize: 14, color: 'rgba(57,255,20,0.5)', marginTop: 2 }}>
          {category?.shortLabel} · {fmtUsd.format(weapon.statistics.costUsd)}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <ModeButton
            mode="DROP"
            active={item.mode === 'DROP'}
            disabled={!allowDrop}
            onClick={() => setMode(item.rowId, 'DROP')}
          />
          <ModeButton
            mode="DELIVER"
            active={item.mode === 'DELIVER'}
            disabled={!allowDeliver}
            onClick={() => setMode(item.rowId, 'DELIVER')}
          />
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-terminal)',
              fontSize: 14,
              color: target == null ? 'rgba(220,38,38,0.7)' : 'rgba(57,255,20,0.8)',
              letterSpacing: '0.06em',
            }}
          >
            TGT: {targetText}
          </span>
          {item.mode === 'DROP' && (
            <button
              onClick={() => beginTargetPick(item.rowId)}
              style={smallBtn}
            >
              {target ? '↻ RE-PICK' : '◎ PICK ON GLOBE'}
            </button>
          )}
          {item.mode === 'DELIVER' && (
            <input
              type="text"
              placeholder="DELIVERY ADDRESS"
              defaultValue={typeof target === 'string' ? target : ''}
              onChange={(e) => setTarget(item.rowId, e.target.value || null)}
              style={{
                flex: 1,
                minWidth: 180,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(57,255,20,0.3)',
                color: 'var(--color-bbb-green)',
                padding: '6px 10px',
                fontFamily: 'var(--font-terminal)',
                fontSize: 14,
                outline: 'none',
                letterSpacing: '0.04em',
              }}
            />
          )}
        </div>
      </div>

      <button
        onClick={() => removeItem(item.rowId)}
        title="Remove from cart"
        style={{
          appearance: 'none',
          background: 'transparent',
          border: '1px solid rgba(220,38,38,0.5)',
          color: 'rgba(220,38,38,0.8)',
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          padding: '6px 12px',
          cursor: 'pointer',
          pointerEvents: 'auto',
          alignSelf: 'start',
        }}
      >
        ✕
      </button>
    </div>
  );
}

const smallBtn = {
  appearance: 'none',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.22)',
  color: 'rgba(255,255,255,0.85)',
  fontFamily: 'var(--font-terminal)',
  fontSize: 14,
  padding: '6px 12px',
  cursor: 'pointer',
  pointerEvents: 'auto',
  letterSpacing: '0.06em',
} as const;

function ModeButton({
  mode,
  active,
  disabled,
  onClick,
}: {
  mode: DeploymentMode;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? 'INCOMPATIBLE LAUNCH PROFILE' : undefined}
      style={{
        appearance: 'none',
        background: active ? 'rgba(57,255,20,0.18)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'var(--color-bbb-green)' : disabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)'}`,
        color: disabled
          ? 'rgba(255,255,255,0.18)'
          : active
          ? 'var(--color-bbb-green)'
          : 'rgba(255,255,255,0.7)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.32em',
        padding: '8px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        pointerEvents: 'auto',
        textShadow: active ? '0 0 8px rgba(57,255,20,0.55)' : 'none',
        textDecoration: disabled ? 'line-through' : 'none',
      }}
    >
      {mode}
    </button>
  );
}

// ─── Pseudo-modal: target picking instructions ───────────────────────────────

function TargetPickingBanner() {
  const cancelTargetPick = useCartStore((s) => s.cancelTargetPick);
  return (
    <div
      style={{
        position: 'fixed',
        top: 72,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        pointerEvents: 'auto',
        padding: '14px 28px',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(57,255,20,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}
    >
      <TerminalText style={{ fontSize: 18 }}>
        ◎ DRAG TO ROTATE · CLICK TO PLACE TARGET
      </TerminalText>
      <button onClick={cancelTargetPick} style={smallBtn}>
        CANCEL
      </button>
    </div>
  );
}

// ─── Top-level Cart overlay ──────────────────────────────────────────────────

export function CartOverlay() {
  const items = useCartStore((s) => s.items);
  const targetPickingId = useCartStore((s) => s.targetPickingRowId);
  const executePurchase = useCartStore((s) => s.executePurchase);
  const rootRef = useStaggerIn<HTMLDivElement>([targetPickingId === null]);

  const total = items.reduce((sum, item) => {
    const w = WEAPON_MAP.get(item.weaponId);
    return sum + (w?.statistics.costUsd ?? 0);
  }, 0);

  // During target picking, the cart panel hides itself so the Earth is unobstructed.
  if (targetPickingId !== null) {
    return (
      <>
        <TargetPickingBanner />
        <InsufficientFundsModal />
      </>
    );
  }

  return (
    <>
      <div
        ref={rootRef}
        style={{
          position: 'fixed',
          top: 72,
          bottom: 24,
          left: 24,
          right: 24,
          zIndex: 11,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <GlassPanel
          data-bbb-stagger
          style={{
            width: '100%',
            maxWidth: 720,
            padding: '20px 24px',
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(57,255,20,0.15)', paddingBottom: 10, marginBottom: 16 }}>
            <TerminalText style={{ fontSize: 22 }}>// PROCUREMENT CART</TerminalText>
            <TerminalText dim style={{ fontSize: 16 }}>
              {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
            </TerminalText>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            {items.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <TerminalText dim style={{ fontSize: 18 }}>
                  CART EMPTY · VISIT ARSENAL TO SELECT PAYLOAD
                </TerminalText>
              </div>
            ) : (
              items.map((it) => <CartItemRow key={it.rowId} item={it} />)
            )}
          </div>

          {items.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(57,255,20,0.15)', paddingTop: 14, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: 18, color: 'rgba(57,255,20,0.55)', letterSpacing: '0.08em' }}>
                  TOTAL
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--color-bbb-crimson)',
                    textShadow: '0 0 12px rgba(220,38,38,0.8)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {fmtUsd.format(total)}
                </span>
              </div>
              <RedAlertButton fullWidth onClick={executePurchase}>
                EXECUTE PURCHASE
              </RedAlertButton>
            </div>
          )}
        </GlassPanel>
      </div>
      <InsufficientFundsModal />
    </>
  );
}


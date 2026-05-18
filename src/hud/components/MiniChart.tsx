interface MiniChartProps {
  data: { x: number; y: number }[];
  title: string;
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
  /** Color hex. Defaults to terminal green. */
  color?: string;
}

/**
 * Lightweight SVG line + area chart. Replaces Recharts to keep the bundle
 * small. Renders a path through normalised data points, with a subtle filled
 * area under the curve and grid lines.
 */
export function MiniChart({
  data,
  title,
  xLabel,
  yLabel,
  width = 280,
  height = 130,
  color = '#39ff14',
}: MiniChartProps) {
  if (data.length < 2) return null;

  const pad = { l: 28, r: 8, t: 18, b: 22 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = 0;
  const yMax = Math.max(...ys, 10);

  const scaleX = (x: number) => pad.l + ((x - xMin) / (xMax - xMin || 1)) * w;
  const scaleY = (y: number) => pad.t + h - ((y - yMin) / (yMax - yMin || 1)) * h;

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.x).toFixed(1)} ${scaleY(d.y).toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${scaleX(xMax).toFixed(1)} ${(pad.t + h).toFixed(1)} L ${scaleX(xMin).toFixed(1)} ${(pad.t + h).toFixed(1)} Z`;

  const gridYs = [0.25, 0.5, 0.75];

  return (
    <div style={{ width, fontFamily: 'var(--font-terminal)', color: 'rgba(57,255,20,0.55)' }}>
      <div style={{ fontSize: 14, marginBottom: 4, letterSpacing: '0.1em' }}>{title}</div>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {/* Border */}
        <rect
          x={pad.l}
          y={pad.t}
          width={w}
          height={h}
          fill="rgba(57,255,20,0.04)"
          stroke="rgba(57,255,20,0.18)"
          strokeWidth={1}
        />
        {/* Grid */}
        {gridYs.map((g, i) => (
          <line
            key={i}
            x1={pad.l}
            x2={pad.l + w}
            y1={pad.t + h * g}
            y2={pad.t + h * g}
            stroke="rgba(57,255,20,0.07)"
            strokeWidth={1}
          />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill={color} fillOpacity={0.12} />
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          style={{ filter: `drop-shadow(0 0 4px ${color}99)` }}
        />
        {/* Axis labels */}
        {xLabel && (
          <text
            x={pad.l + w / 2}
            y={height - 4}
            fontSize={11}
            fill="rgba(57,255,20,0.4)"
            textAnchor="middle"
          >
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            x={6}
            y={pad.t + h / 2}
            fontSize={11}
            fill="rgba(57,255,20,0.4)"
            textAnchor="middle"
            transform={`rotate(-90 6 ${pad.t + h / 2})`}
          >
            {yLabel}
          </text>
        )}
        {/* Y-axis tick at top */}
        <text x={pad.l - 4} y={pad.t + 4} fontSize={9} fill="rgba(57,255,20,0.4)" textAnchor="end">
          {Math.round(yMax)}
        </text>
        <text x={pad.l - 4} y={pad.t + h - 1} fontSize={9} fill="rgba(57,255,20,0.4)" textAnchor="end">
          0
        </text>
      </svg>
    </div>
  );
}

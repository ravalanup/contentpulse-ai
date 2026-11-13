import React, { useState } from 'react';

export const Sparkline: React.FC<{
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}> = ({ data, color = '#06b6d4', height = 28, width = 90 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 4) + 2;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const AreaTrendChart: React.FC<{
  data: { label: string; value: number; secondaryValue?: number }[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  color?: string;
}> = ({
  data,
  height = 200,
  valuePrefix = '',
  valueSuffix = '',
  primaryLabel = 'Metric',
  secondaryLabel,
  color = '#06b6d4',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length < 2) return null;

  const values = data.map((d) => d.value);
  const secondaryValues = data.filter((d) => d.secondaryValue !== undefined).map((d) => d.secondaryValue as number);
  const allValues = [...values, ...secondaryValues];

  const min = Math.max(0, Math.min(...allValues) * 0.85);
  const max = Math.max(...allValues) * 1.1;
  const range = max - min || 1;

  const width = 640;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getCoordinates = (val: number, idx: number) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - min) / range) * chartHeight;
    return { x, y };
  };

  const primaryPoints = data.map((d, i) => getCoordinates(d.value, i));
  const primaryPathStr = primaryPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const primaryAreaStr = `${primaryPathStr} L ${primaryPoints[primaryPoints.length - 1].x} ${
    paddingTop + chartHeight
  } L ${primaryPoints[0].x} ${paddingTop + chartHeight} Z`;

  let secondaryPathStr = '';
  if (secondaryLabel) {
    const secPoints = data.map((d, i) => getCoordinates(d.secondaryValue || 0, i));
    secondaryPathStr = secPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`area-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
          const y = paddingTop + chartHeight * (1 - step);
          const val = min + step * range;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
                fontFamily="JetBrains Mono"
              >
                {valuePrefix}
                {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(1)}
                {valueSuffix}
              </text>
            </g>
          );
        })}

        {/* Primary Area Fill */}
        <path d={primaryAreaStr} fill={`url(#area-grad-${color.replace('#', '')})`} />

        {/* Secondary Line if present */}
        {secondaryPathStr && (
          <path
            d={secondaryPathStr}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.8"
            strokeDasharray="4 4"
          />
        )}

        {/* Primary Line */}
        <path d={primaryPathStr} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* X-axis labels and hover interactions */}
        {data.map((d, idx) => {
          const coords = getCoordinates(d.value, idx);
          return (
            <g key={idx}>
              <text
                x={coords.x}
                y={height - 8}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
              >
                {d.label}
              </text>

              {/* Invisible touch/hover column */}
              <rect
                x={coords.x - chartWidth / (data.length * 2)}
                y={paddingTop}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
              />

              {/* Point on line */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={hoverIndex === idx ? 5 : 3}
                fill={hoverIndex === idx ? '#ffffff' : color}
                stroke={color}
                strokeWidth="2"
              />
            </g>
          );
        })}

        {/* Hover Crosshair Guide */}
        {hoverIndex !== null && (
          <line
            x1={getCoordinates(data[hoverIndex].value, hoverIndex).x}
            y1={paddingTop}
            x2={getCoordinates(data[hoverIndex].value, hoverIndex).x}
            y2={paddingTop + chartHeight}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        )}
      </svg>

      {/* Floating Tooltip */}
      {hoverIndex !== null && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md"
          style={{
            left: `${(hoverIndex / (data.length - 1)) * 80 + 10}%`,
            top: '20px',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="text-slate-400 font-mono text-[11px] mb-1">{data[hoverIndex].label}</div>
          <div className="flex items-center gap-2 text-slate-100 font-semibold">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
            <span>{primaryLabel}:</span>
            <span className="text-cyan-400 font-mono">
              {valuePrefix}
              {data[hoverIndex].value.toLocaleString()}
              {valueSuffix}
            </span>
          </div>
          {secondaryLabel && data[hoverIndex].secondaryValue !== undefined && (
            <div className="flex items-center gap-2 text-slate-300 mt-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>{secondaryLabel}:</span>
              <span className="text-slate-200 font-mono">
                {valuePrefix}
                {data[hoverIndex].secondaryValue?.toLocaleString()}
                {valueSuffix}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const BarComparisonChart: React.FC<{
  items: { label: string; controlVal: number; treatmentVal: number; unit?: string }[];
}> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const maxVal = Math.max(item.controlVal, item.treatmentVal, 1);
        const controlPct = (item.controlVal / maxVal) * 100;
        const treatmentPct = (item.treatmentVal / maxVal) * 100;
        const diff = item.treatmentVal - item.controlVal;
        const diffPct = ((diff / item.controlVal) * 100).toFixed(1);
        const isPositive = diff >= 0;

        return (
          <div key={idx} className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-200">{item.label}</span>
              <span
                className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {isPositive ? `+${diffPct}%` : `${diffPct}%`} Lift
              </span>
            </div>

            {/* Treatment bar */}
            <div className="space-y-1.5">
              <div className="flex items-center text-xs">
                <span className="w-20 text-cyan-400 font-mono text-[11px]">Treatment</span>
                <div className="flex-1 bg-slate-800/80 rounded-full h-2.5 overflow-hidden mx-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${treatmentPct}%` }}
                  ></div>
                </div>
                <span className="w-14 text-right font-mono text-slate-100 font-medium">
                  {item.treatmentVal}
                  {item.unit || ''}
                </span>
              </div>

              {/* Control bar */}
              <div className="flex items-center text-xs">
                <span className="w-20 text-slate-400 font-mono text-[11px]">Control</span>
                <div className="flex-1 bg-slate-800/80 rounded-full h-2.5 overflow-hidden mx-2">
                  <div
                    className="bg-slate-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${controlPct}%` }}
                  ></div>
                </div>
                <span className="w-14 text-right font-mono text-slate-400">
                  {item.controlVal}
                  {item.unit || ''}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const GaugeRing: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  color = '#06b6d4',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold font-mono text-slate-100">{percentage.toFixed(1)}%</span>
          {label && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>}
        </div>
      </div>
      {sublabel && <span className="text-xs text-slate-400 mt-2 font-mono text-center">{sublabel}</span>}
    </div>
  );
};

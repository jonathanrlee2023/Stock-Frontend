import React from 'react';

interface SentimentDialProps {
  StrongBuy: number | null;
  Buy: number | null;
  Hold: number | null;
  Sell: number | null;
  StrongSell: number | null;
}

const SentimentDial: React.FC<SentimentDialProps> = ({ 
  StrongBuy, 
  Buy, 
  Hold, 
  Sell, 
  StrongSell 
}) => {
  // Use null-coalescing to treat null/undefined as 0 for math safety
  const sb = StrongBuy ?? 0;
  const b = Buy ?? 0;
  const h = Hold ?? 0;
  const s = Sell ?? 0;
  const ss = StrongSell ?? 0;

  const total = sb + b + h + s + ss;
  
  // Calculate weighted score (0 to 100)
  const score = total > 0 
    ? ((sb * 100) + (b * 75) + (h * 50) + (s * 25) + (ss * 0)) / total 
    : 50;

  // Gauge dimensions
  const width = 220;
  const height = 130;
  const cx = width / 2;
  const cy = height - 20;
  const r = 85;
  const strokeWidth = 14;

  // Needle rotation (-90deg to 90deg)
  const rotation = (score / 100) * 180 - 90;

  const getColor = (val: number) => {
    if (val > 70) return "#00c805"; // Strong Buy Green
    if (val > 55) return "#94d82d"; // Buy Green
    if (val > 40) return "#fcc419"; // Hold Amber
    if (val > 25) return "#ff922b"; // Sell Orange
    return "#ff5252"; // Strong Sell Red
  };

  const getLabel = (val: number) => {
    if (val > 75) return "Strong Buy";
    if (val > 60) return "Buy";
    if (val > 40) return "Hold";
    if (val > 25) return "Sell";
    return "Strong Sell";
  };

  return (
    <div className="d-flex flex-column align-items-center my-3" style={{ width: '100%' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background Track Arc */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke="#2c2e33"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Active Sentiment Arc (The colored part that follows the score) */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * (Math.PI * r)} ${Math.PI * r}`}
          style={{ transition: 'stroke 0.8s ease, stroke-dasharray 1s ease-out' }}
        />

        {/* Needle Line with Spring Physics (cubic-bezier) */}
        <line
          x1={cx} y1={cy}
          x2={cx} y2={cy - r + 10}
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${rotation}, ${cx}, ${cy})`}
          style={{ transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        
        {/* Needle Center Pivot Hub */}
        <circle cx={cx} cy={cy} r="6" fill="#ffffff" />
        <circle cx={cx} cy={cy} r="3" fill="#111" />
      </svg>

      <div className="text-center" style={{ marginTop: "-25px" }}>
        <h4 className="mb-0 fw-bold" style={{ color: getColor(score) }}>
          {getLabel(score)}
        </h4>
        <small className="text-muted text-uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>
          Analyst Consensus ({total} ratings)
        </small>
      </div>
    </div>
  );
};

export default SentimentDial;
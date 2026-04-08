import React from "react";

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
  StrongSell,
}) => {
  // Use null-coalescing to treat null/undefined as 0 for math safety
  const sb = StrongBuy ?? 0;
  const b = Buy ?? 0;
  const h = Hold ?? 0;
  const s = Sell ?? 0;
  const ss = StrongSell ?? 0;

  const total = sb + b + h + s + ss;

  // Calculate weighted score (0 to 100)
  const score =
    total > 0 ? (sb * 100 + b * 75 + h * 50 + s * 25 + ss * 0) / total : 50;

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
    <div
      className="d-flex flex-column align-items-center my-3"
      style={{ width: "100%", backgroundColor: "transparent" }}
    >
      <svg
        width={width}
        height={height + 20}
        viewBox={`0 0 ${width} ${height + 20}`}
      >
        {/* Background Track Arc - Darker and thinner for a tech look */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={strokeWidth / 2}
        />

        {/* Segmented Tick Marks (Optional but adds to the 'Instrument' vibe) */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (tick / 100) * 180 - 180;
          return (
            <line
              key={tick}
              x1={cx + (r - 10) * Math.cos((angle * Math.PI) / 180)}
              y1={cy + (r - 10) * Math.sin((angle * Math.PI) / 180)}
              x2={cx + (r + 5) * Math.cos((angle * Math.PI) / 180)}
              y2={cy + (r + 5) * Math.sin((angle * Math.PI) / 180)}
              stroke="#333"
              strokeWidth="1"
            />
          );
        })}

        {/* Active Sentiment Arc */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={`${(score / 100) * (Math.PI * r)} ${Math.PI * r}`}
          style={{
            transition: "stroke 0.8s ease, stroke-dasharray 1s ease-out",
          }}
        />

        {/* Needle Line - Tapered or thinner for precision feel */}
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r + 5}
          stroke="#ffffff"
          strokeWidth="2"
          transform={`rotate(${rotation}, ${cx}, ${cy})`}
          style={{
            transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* Pivot Hub - Square or Hexagonal style */}
        <rect x={cx - 4} y={cy - 4} width="8" height="8" fill="#fff" />
        <rect x={cx - 2} y={cy - 2} width="4" height="4" fill="#000" />
      </svg>

      <div className="text-center" style={{ marginTop: "-20px" }}>
        {/* Label in Monospace */}
        <div
          style={{
            color: getColor(score),
            fontFamily: "monospace",
            fontWeight: "900",
            fontSize: "1.2rem",
            letterSpacing: "1px",
          }}
        >
          {getLabel(score).toUpperCase()}
        </div>

        {/* Subtext in Terminal Style */}
        <div
          style={{
            fontSize: "0.65rem",
            color: "#555",
            fontFamily: "monospace",
            marginTop: "4px",
            fontWeight: "bold",
          }}
        >
          NUMBER OF ANALYST RATINGS:{" "}
          <span style={{ color: "#aaa" }}>{total}</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentDial;

import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useWS } from "./Contexts/WSContest"; // adjust import
import "chartjs-adapter-date-fns";
import {
  HistoricalStockPoint,
  StockPoint,
  useStockContext,
} from "./Contexts/StockContext";
import { useOptionContext } from "./Contexts/OptionContext";
import { useCompanyContext } from "./Contexts/CompanyContext";
import SentimentDial from "./SentimentDial";
import { COLORS } from "../constants/Colors";
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface TodayStockWSProps {
  stockSymbol: string;
  setActiveCard: (query: string) => void;
  activeCard: string;
}

type Timeframe = "Live" | "1W" | "1M" | "3M" | "1Y" | "3Y" | "All";

export const verticalLinePlugin = {
  id: "verticalLine",
  afterDraw: (chart: any) => {
    if (chart.tooltip?._active?.length) {
      const x = chart.tooltip._active[0].element.x;
      const yAxis = chart.scales.y;
      const ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yAxis.top);
      ctx.lineTo(x, yAxis.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#333"; // Vertical line color
      ctx.setLineDash([5, 5]); // Dashed line
      ctx.stroke();
      ctx.restore();
    }
  },
};

export const TodayStockWSComponent: React.FC<TodayStockWSProps> = ({
  stockSymbol,
  setActiveCard,
  activeCard,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>("Live");

  const { stockPoints, historicalStockPoints } = useStockContext();
  const { companyStats } = useCompanyContext();

  const { ids, setPreviousCard } = useWS();

  const [showStats, setShowStats] = useState(false);
  const stats = companyStats[stockSymbol]; // Get stats for current symbol

  const previousIdsRef = useRef<Record<number, Record<string, number>>>({});
  useEffect(() => {
    previousIdsRef.current = { ...ids };
  }, [ids]);
  const graphData = React.useMemo(() => {
    // 1. Select the Source
    const isLive = timeframe === "Live";
    const liveArr = stockPoints[stockSymbol] || [];
    const histArr = historicalStockPoints[stockSymbol] || [];

    // 2. Use optional chaining for length and properties
    const latestMark =
      liveArr.length > 0 ? liveArr[liveArr.length - 1]?.Mark : 0;
    const prevClose =
      histArr.length > 0 ? histArr[histArr.length - 1]?.close : 0;

    const rawData = isLive
      ? ((stockPoints[stockSymbol] || []) as StockPoint[])
      : ((historicalStockPoints[stockSymbol] || []) as HistoricalStockPoint[]);

    let filtered: any[] = rawData;
    // 2. Filter by Timeframe (if not Live or All)
    if (!isLive && timeframe !== "All") {
      const nowInSeconds = Math.floor(Date.now());
      const day = 86400000;
      const cutoffs: Record<string, number> = {
        "1W": day * 7,
        "1M": day * 30,
        "3M": day * 90,
        "1Y": day * 365,
        "3Y": day * 1095,
      };
      const minTimestamp = nowInSeconds - (cutoffs[timeframe] || 0);
      filtered = (rawData as StockPoint[]).filter(
        (p: StockPoint) => p.timestamp >= minTimestamp,
      );
    }

    const upOrDown = (latestMark ?? 0) >= (prevClose ?? 0);

    // 3. Process for Display
    // If Live, we use your minute-flooring logic to keep the graph clean
    let displayPoints = filtered;
    if (isLive) {
      const minutePoints = new Map<number, any>();
      let lastTimestamp = 0;

      for (const p of filtered) {
        const timeSinceLastPoint = p.timestamp - lastTimestamp;

        if (timeSinceLastPoint > 60) {
          minutePoints.set(p.timestamp, {
            ...p,
            timestamp: p.timestamp * 1000,
          });
        } else {
          const minuteKey = Math.floor(p.timestamp / 60);
          minutePoints.set(minuteKey, { ...p, timestamp: p.timestamp * 1000 });
        }
        lastTimestamp = p.timestamp;
      }

      displayPoints = Array.from(minutePoints.values()).sort(
        (a, b) => a.timestamp - b.timestamp,
      );
    }

    console.log(displayPoints);

    return {
      datasets: [
        {
          label: `${stockSymbol} ${timeframe}`,
          data: displayPoints.map((p: any) => ({
            x: new Date(p.timestamp),
            y: isLive ? p.Mark : p.close,
          })),
          fill: false,
          borderColor: isLive
            ? upOrDown
              ? COLORS.green.positive
              : COLORS.red.negative // Green if up, Red if down
            : COLORS.neutralStockHistory, // Neutral Blue/Purple for History
          tension: isLive ? 0 : 0.1, // Smooth lines look better on long history
          pointRadius: isLive ? 3 : 0, // Hide points on long history for performance
        },
      ],
    };
  }, [stockPoints, historicalStockPoints, stockSymbol, timeframe]);
  interface StatRowProps {
    label: string;
    value: string | number;
    valueStyle?: React.CSSProperties; // Add this
  }

  const StatRow: React.FC<StatRowProps> = ({ label, value, valueStyle }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.9rem",
      }}
    >
      <span style={{ color: COLORS.infoTextColor }}>{label}</span>
      <span
        style={{
          color: COLORS.mainFontColor,
          textAlign: "right",
          ...valueStyle,
        }}
      >
        {value}
      </span>
    </div>
  );
  const options = React.useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 50,
      animation: {
        duration: 0, // Instant updates feel more professional for live streams
      },
      // Interaction settings for a 'Crosshair' feel
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `NODE_SIGNAL: ${stockSymbol.toUpperCase()} // ${timeframe.toUpperCase()}`,
          color: COLORS.secondaryTextColor,
          align: "start" as const, // Added 'as const'
          font: {
            family: "monospace",
            size: 12,
            weight: "bold" as const, // Added 'as const' here
          },
          padding: { bottom: 10 },
        },
        tooltip: {
          enabled: true,
          backgroundColor: COLORS.cardBackground,
          titleFont: {
            family: "monospace",
            size: 12,
            weight: "bold" as const, // Added 'as const' here too
          },
          bodyFont: {
            family: "monospace",
            size: 12,
          },
          borderColor: COLORS.cardSoftBorder,
          borderWidth: 1,
          cornerRadius: 0,
          displayColors: false,
          padding: 10,
        },
      },
      scales: {
        x: {
          type: "time" as const,
          time: {
            unit: timeframe === "Live" ? ("minute" as const) : ("day" as const),
            displayFormats: {
              minute: "HH:mm",
              hour: "HH:mm",
              day: "MM/dd",
              month: "MMM yy",
            },
          },
          grid: {
            color: COLORS.cardSoftBorder, // Very subtle grid
            borderColor: COLORS.cardSoftBorder,
          },
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            color: COLORS.infoTextColor,
            font: { family: "monospace", size: 10 },
          },
        },
        y: {
          type: "linear" as const,
          beginAtZero: false,
          grid: {
            color: COLORS.cardSoftBorder,
            borderColor: COLORS.cardSoftBorder,
          },
          ticks: {
            color: COLORS.infoTextColor,
            font: { family: "monospace", size: 10 },
            callback: (value: any) => `$${Number(value).toFixed(2)}`,
          },
        },
      },
    };
  }, [stockSymbol, timeframe]);

  const getScoreColor = (score: number | null | undefined): string => {
    if (score === null || score === undefined) return COLORS.infoTextColor;

    // Clamp score between 0 and 100
    const normalizedScore = Math.min(Math.max(score, 0), 100);

    // Hue: 0 is red, 60 is yellow, 120 is green.
    // Multiplying score by 1.2 maps 100 to 120.
    const hue = normalizedScore * 1.2;

    return `hsl(${hue}, 80%, 50%)`;
  };

  return (
    <div
      style={{
        padding: "0px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        marginTop: "10px", // Maintains the global spacing rule
      }}
    >
      <div
        style={{
          flex: showStats ? "0 0 0%" : "1 1 0%",
          minHeight: "0",
          height: showStats ? "0px" : "auto",
          overflow: "hidden",
          opacity: showStats ? 0 : 1,
          visibility: showStats ? "hidden" : "visible",
          transition: "flex 0.5s ease, opacity 0.5s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: "1 1 auto",
            minHeight: "0",
            position: "relative",
            // Added a subtle border to ground the chart in the black void
            border: "1px solid " + COLORS.cardSoftBorder,
            borderRadius: "4px",
            margin: "0 8px",
          }}
        >
          <Line
            key={`${stockSymbol}-${timeframe}`}
            options={options}
            data={graphData}
            plugins={[verticalLinePlugin]}
          />
        </div>

        {/* Timeframe Selectors */}
        <div
          className="d-flex flex-wrap gap-2 justify-content-center my-3"
          style={{
            flex: "0 0 auto",
            paddingBottom: "10px",
            zIndex: 10,
          }}
        >
          {(["Live", "1W", "1M", "3M", "1Y", "3Y", "All"] as const).map(
            (tf) => {
              const history = historicalStockPoints[stockSymbol] || [];
              const buttonLabel =
                tf === "All" && history.length > 0
                  ? new Date(history[0].timestamp || 0).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                      },
                    )
                  : tf;

              return (
                <button
                  key={tf}
                  type="button"
                  className={`btn btn-sm ${timeframe === tf ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    minWidth: "60px",
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                    fontWeight: timeframe === tf ? "bold" : "normal",
                    textTransform: "uppercase",
                    border:
                      timeframe === tf
                        ? "none"
                        : "1px solid " + COLORS.cardSoftBorder,
                    backgroundColor:
                      timeframe === tf
                        ? COLORS.secondaryTextColor
                        : "transparent",
                  }}
                >
                  {buttonLabel}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Collapsible Stats Section */}
      <div
        className="mx-2 mb-2"
        style={{
          flex: showStats ? "1 1 0%" : "0 0 auto",
          minHeight: "0",
          border: "1px solid " + COLORS.cardSoftBorder,
          borderRadius: "4px", // Switched to 4px to match your terminal style
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "flex 0.5s ease",
          background: COLORS.cardBackground,
        }}
      >
        <button
          className="btn-sleek btn-sleek-dark w-100 d-flex justify-content-between align-items-center"
          style={{
            padding: "8px 15px",
            border: "none",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
          }}
          onClick={() => setShowStats(!showStats)}
        >
          <span style={{ fontWeight: 700 }}>{stockSymbol} // FUNDAMENTALS</span>
          <span style={{ color: COLORS.secondaryTextColor }}>
            {showStats ? "SHRINK_VIEW" : "EXPAND_VIEW"}
          </span>
        </button>

        {showStats && (
          <div
            style={{
              padding: "20px",
              background: COLORS.appBackground,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              overflowY: "auto",
            }}
          >
            {stats ? (
              <>
                <div style={{ gridColumn: "span 2", marginBottom: "5px" }}>
                  <StatRow
                    label="OVERALL_HEALTH"
                    value={stats.Grade != null ? `${stats.Grade} / 100` : "N/A"}
                    valueStyle={{
                      color: getScoreColor(stats.Grade),
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  />
                  <div
                    style={{
                      height: "2px",
                      background: COLORS.cardBackground,
                      marginTop: "8px",
                      borderRadius: "1px",
                    }}
                  >
                    <div
                      style={{
                        width: `${stats.Grade || 0}%`,
                        height: "100%",
                        background: getScoreColor(stats.Grade),
                        boxShadow: `0 0 10px ${getScoreColor(stats.Grade)}`,
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>

                <StatRow
                  label="Market Cap"
                  value={
                    stats.MarketCap
                      ? `$${stats.MarketCap.toLocaleString()}`
                      : "N/A"
                  }
                />
                <StatRow label="Sector" value={`${stats.Sector}`} />
                <StatRow
                  label="Intrinsic Price"
                  value={
                    stats.IntrinsicPrice
                      ? `$${stats.IntrinsicPrice.toFixed(2)}`
                      : "N/A"
                  }
                />
                <StatRow
                  label="Dividend Price"
                  value={
                    stats.DividendPrice != null
                      ? `$${stats.DividendPrice.toFixed(2).toLocaleString()}`
                      : "N/A"
                  }
                />
                <StatRow
                  label="Price at Report"
                  value={
                    stats.PriceAtReport != null
                      ? `$${stats.PriceAtReport.toFixed(2).toLocaleString()}`
                      : "N/A"
                  }
                />
                <StatRow
                  label="Return on Invested Capital"
                  value={
                    stats.ROIC != null
                      ? `${(stats.ROIC * 100).toFixed(2)}%`
                      : "N/A"
                  }
                />
                <StatRow
                  label="Historical Growth Rate"
                  value={
                    stats.HistGrowth != null
                      ? `${(stats.HistGrowth * 100).toFixed(2)}%`
                      : "N/A"
                  }
                />
                <StatRow
                  label="Forecasted Growth Rate"
                  value={
                    stats.ForecastedGrowth != null
                      ? `${(stats.ForecastedGrowth * 100).toFixed(2)}%`
                      : "N/A"
                  }
                />
                <StatRow label="PEG Ratio" value={`${stats.PEG?.toFixed(4)}`} />
                <StatRow
                  label="Sloan Ratio"
                  value={`${stats.Sloan?.toFixed(4)}`}
                />
                <StatRow
                  label="WACC"
                  value={stats.WACC ? `${stats.WACC.toFixed(2)}%` : "N/A"}
                />
                <StatRow
                  label="ROIC"
                  value={
                    stats.ROIC ? `${(stats.ROIC * 100).toFixed(2)}%` : "N/A"
                  }
                />

                <div
                  style={{
                    gridColumn: "span 2",
                    display: "grid", // Switched to grid for precise column alignment
                    gridTemplateColumns: "1fr 1fr", // Two equal columns
                    alignItems: "center",
                    justifyItems: "center", // Centers children horizontally within columns
                    marginTop: "20px",
                    padding: "20px 0",
                    borderTop: "1px solid " + COLORS.cardSoftBorder,
                    background: `linear-gradient(to bottom, ${COLORS.cardBackground}, ${COLORS.appBackground})`, // Subtle depth
                  }}
                >
                  {/* Left Column: Sentiment Dial */}
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <SentimentDial {...stats} />
                  </div>

                  {/* Right Column: Navigation Action */}
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      className="btn-sleek"
                      style={{
                        fontSize: "0.7rem",
                        padding: "12px 24px",
                        letterSpacing: "0.1em",
                        boxShadow: "0 4px 15px" + COLORS.cardBackground, // Very faint glow to match primary theme
                      }}
                      onClick={() => {
                        setActiveCard("financials");
                        setPreviousCard(activeCard);
                      }}
                    >
                      SEE FINANCIALS
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  gridColumn: "span 2",
                  textAlign: "center",
                  color: COLORS.infoTextColor,
                  fontSize: "0.8rem",
                }}
              >
                NO_DATA_AVAILABLE_FOR_{stockSymbol}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

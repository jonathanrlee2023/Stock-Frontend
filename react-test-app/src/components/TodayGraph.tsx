import React, { useEffect, useState } from "react";
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
import { useWS } from "./WSContest"; // adjust import
import "chartjs-adapter-date-fns";
import {
  StockPoint,
  HistoricalStockPoint,
  CompanyStats,
  usePriceStream,
} from "./PriceContext";
import { postData } from "./OptionGraph";
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
}

type Timeframe = "Live" | "1W" | "1M" | "3M" | "1Y" | "3Y" | "All";

export const TodayStockWSComponent: React.FC<TodayStockWSProps> = ({
  stockSymbol,
}) => {
  const ModifyTracker = async (action: string) => {
    let data: { id: string } = { id: "" };
    data.id = stockSymbol;

    try {
      const response = await fetch(`http://localhost:8080/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.text();
      console.log("Server response:", result);
    } catch (error) {
      console.error("POST request failed:", error);
    }
  };
  const [timeframe, setTimeframe] = useState<Timeframe>("Live");
  const { stockPoints, historicalStockPoints, companyStats } = usePriceStream();
  const [amount, setAmount] = useState<number>(0);
  const { setIds, setTrackers } = useWS();
  const points = stockPoints[stockSymbol] || [];
  const latestPoint = points.length > 0 ? points[points.length - 1] : null;

  const latestMark = latestPoint?.Mark ?? 0;
  const [showStats, setShowStats] = useState(false);
  const stats = companyStats[stockSymbol]; // Get stats for current symbol
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
        console.log(p.timestamp, lastTimestamp, timeSinceLastPoint);

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
              ? "#22c55e"
              : "#ef4444" // Green if up, Red if down
            : "#00bb10", // Neutral Blue/Purple for History
          tension: isLive ? 0 : 0.1, // Smooth lines look better on long history
          pointRadius: isLive ? 3 : 0, // Hide points on long history for performance
        },
      ],
    };
  }, [stockPoints, historicalStockPoints, stockSymbol, timeframe]);
  const StatRow = ({ label, value }: { label: string; value: any }) => (
    <div className="d-flex flex-column">
      <span
        style={{ color: "#888", fontSize: "12px", textTransform: "uppercase" }}
      >
        {label}
      </span>
      <span style={{ color: "white", fontWeight: "bold" }}>
        {value || "N/A"}
      </span>
    </div>
  );

  const options = React.useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" as const },
        title: {
          display: true,
          text: `${stockSymbol} - ${timeframe}`,
        },
      },
      resizeDelay: 50,
      scales: {
        x: {
          type: "time" as const, // Must be 'as const' for TypeScript
          time: {
            // Dynamic units based on timeframe
            unit: timeframe === "Live" ? ("minute" as const) : ("day" as const),
            timezone: "America/Chicago",
            tooltipFormat: "MMM dd, yyyy HH:mm",
            displayFormats: {
              minute: "HH:mm",
              hour: "HH:mm",
              day: "MMM d, yyyy", // 4-digit year fix
              month: "MMM yyyy", // 4-digit year fix
              year: "yyyy",
            },
          },
          ticks: {
            autoSkip: true,
            maxRotation: 0,
          },
        },
        y: {
          type: "linear" as const,
          beginAtZero: false,
          ticks: {
            callback: (value: any) => `$${value}`,
          },
        },
      },
    };
  }, [stockSymbol, timeframe]);

  return (
    <div
      style={{
        padding: "0px",
        height: "100%", // Parent must have a fixed height (like 100% or 600px)
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevents the whole app from scrolling
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
            flex: "1 1 auto", // Takes up the majority of the space
            minHeight: "0", // Allows the chart to shrink so it doesn't push buttons out
            position: "relative",
          }}
        >
          <Line
            key={`${stockSymbol}-${timeframe}`}
            options={options}
            data={graphData}
          />{" "}
        </div>
        <div
          className="d-flex flex-wrap gap-2 justify-content-center my-3"
          style={{
            flex: "0 0 auto", // "Don't grow, don't shrink, just be your natural size"
            paddingBottom: "10px",
            zIndex: 10, // Ensure they aren't covered by a canvas overlap
          }}
        >
          {" "}
          {(["Live", "1W", "1M", "3M", "1Y", "3Y", "All"] as const).map(
            (tf) => {
              // Logic for the "All" button label to show the earliest date
              const history = historicalStockPoints[stockSymbol] || [];
              const buttonLabel =
                tf === "All" && history.length > 0
                  ? new Date(history[0].timestamp || 0).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" },
                    )
                  : tf;

              return (
                <button
                  key={tf}
                  type="button"
                  className={`btn btn-sm ${timeframe === tf ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setTimeframe(tf)} // This triggers the useMemo recalculation
                  style={{
                    minWidth: "50px",
                    fontWeight: timeframe === tf ? "bold" : "normal",
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
          minHeight: "0", // Allows it to be contained
          border: "1px solid #333",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "flex 0.5s ease",
        }}
      >
        <button
          className="btn-sleek btn-sleek-dark w-100 d-flex justify-content-between align-items-center"
          onClick={() => setShowStats(!showStats)}
        >
          <span style={{ fontWeight: 600 }}>Company Overview</span>
          <span>{showStats ? "▲" : "▼"}</span>
        </button>

        {showStats && (
          <div
            style={{
              padding: "15px",
              background: "#111",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              overflowY: "auto",
            }}
          >
            {stats ? (
              <>
                <StatRow
                  label="Market Cap"
                  value={
                    stats.MarketCap != null
                      ? `$${stats.MarketCap.toLocaleString()}`
                      : "N/A"
                  }
                />
                <StatRow
                  label="Intrinsic Value"
                  value={
                    stats.IntrinsicPrice != null
                      ? `$${stats.IntrinsicPrice.toFixed(2).toLocaleString()}`
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
                  value={
                    stats.WACC != null ? `${stats.WACC.toFixed(2)}%` : "N/A"
                  }
                />
                <StatRow
                  label="FCFF"
                  value={
                    stats.FCFF != null
                      ? `$${stats.FCFF.toLocaleString()} M`
                      : "N/A"
                  }
                />
                <StatRow
                  label="FCF"
                  value={
                    stats.FCF != null
                      ? `$${stats.FCF.toLocaleString()} M`
                      : "N/A"
                  }
                />
                <StatRow
                  label="NWC"
                  value={
                    stats.NWC != null
                      ? `$${stats.NWC.toLocaleString()} M`
                      : "N/A"
                  }
                />
                <StatRow
                  label="Analyst Price Target"
                  value={
                    stats.PriceTarget != null
                      ? `$${stats.PriceTarget.toFixed(2).toLocaleString()}`
                      : "N/A"
                  }
                />
                <StatRow label="Strong Buy" value={`${stats.StrongBuy}`} />
                <StatRow label="Buy" value={`${stats.Buy}`} />
                <StatRow label="Hold" value={`${stats.Hold}`} />
                <StatRow label="Sell" value={`${stats.Sell}`} />
                <StatRow label="Strong Sell" value={`${stats.StrongSell}`} />
                <StatRow
                  label="Next Earnings Date"
                  value={`${stats.EarningsDate}`}
                />
              </>
            ) : (
              <div
                style={{
                  gridColumn: "span 2",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                No statistics available for {stockSymbol}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mb-2 mx-2">
        <label>
          Amount:{" "}
          <input
            className="search-bar input-small"
            type="number"
            value={amount}
            min={0}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{
              paddingLeft: "5px" /* Overrides the 45px padding */,
              paddingRight: "25px" /* Pulls the arrows closer to the edge */,
              textAlign: "center" /* Centers the number between the edges */,
            }}
          />
        </label>
      </div>
      {/* Container for everything at the bottom */}
      <div className="d-flex justify-content-between align-items-center mb-2 mx-2">
        {/* Left Side: Position Actions */}
        <div className="d-flex gap-2">
          <button
            className="btn-sleek btn-sleek-green"
            style={{
              opacity: latestMark <= 0 ? 0.5 : 1,
              cursor: latestMark <= 0 ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              postData("openPosition", stockSymbol, latestMark, amount);
              ModifyTracker("newTracker");
              setIds((prev) => ({
                ...prev,
                [stockSymbol]: (prev[stockSymbol] ?? 0) + amount,
              }));
            }}
            disabled={latestMark <= 0}
          >
            Open Position
          </button>

          <button
            className="btn-sleek btn-sleek-red"
            style={{
              opacity: latestMark <= 0 ? 0.5 : 1,
              cursor: latestMark <= 0 ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              postData("closePosition", stockSymbol, latestMark, amount);
              setIds((prev) => {
                const updated = { ...prev };
                const currentAmount = updated[stockSymbol] ?? 0;
                const newAmount = currentAmount - amount;
                if (newAmount <= 0) delete updated[stockSymbol];
                else updated[stockSymbol] = newAmount;
                return updated;
              });
            }}
            disabled={latestMark <= 0}
          >
            Close Position
          </button>
        </div>

        {/* Right Side: Tracker Actions */}
        <div className="d-flex gap-2">
          <button
            className="btn-sleek"
            onClick={() => {
              ModifyTracker("newTracker");
              setTrackers((prev) =>
                prev.includes(stockSymbol) ? prev : [...prev, stockSymbol],
              );
            }}
            disabled={stockSymbol === ""}
          >
            TRACK
          </button>
          <button
            className="btn-sleek"
            onClick={() => {
              ModifyTracker("closeTracker");
              setTrackers((prev) =>
                prev.filter((item) => item !== stockSymbol),
              );
            }}
            disabled={stockSymbol === ""}
          >
            UNTRACK
          </button>
        </div>
      </div>
    </div>
  );
};

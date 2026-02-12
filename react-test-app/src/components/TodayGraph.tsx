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

    console.log("Latest Mark:", latestMark);
    console.log("Previous Close:", prevClose);
    console.log(histArr.length > 0 ? histArr[0] : "No data");
    console.log(liveArr.length > 0 ? histArr[histArr.length - 1] : "No data");

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
      filtered = rawData.filter((p) => p.timestamp >= minTimestamp);
    }

    if (timeframe === "All") {
      // p is the element, i is the index
      filtered = filtered.filter((_, i) => i % 5 === 0);
    }

    const upOrDown = (latestMark ?? 0) >= (prevClose ?? 0);

    // 3. Process for Display
    // If Live, we use your minute-flooring logic to keep the graph clean
    let displayPoints = filtered;
    if (isLive) {
      const minutePoints = new Map<number, any>();
      for (const p of filtered) {
        const minuteKey = Math.floor(p.timestamp / 60);
        minutePoints.set(minuteKey, p);
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
            : "#4200bd", // Neutral Blue/Purple for History
          tension: isLive ? 0 : 0.1, // Smooth lines look better on long history
          pointRadius: isLive ? 3 : 0, // Hide points on long history for performance
        },
      ],
    };
  }, [stockPoints, historicalStockPoints, stockSymbol, timeframe]);

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
      scales: {
        x: {
          type: "time" as const, // Must be 'as const' for TypeScript
          time: {
            // Dynamic units based on timeframe
            unit: timeframe === "Live" ? ("minute" as const) : ("day" as const),
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
        padding: "0px", // Remove or minimize padding
        height: "100%",
        width: "100%", // Force full width
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div className="d-flex gap-2 mx-2 mt-2" style={{ flex: "0 0 auto" }}>
        <button
          className="btn btn-success btn-lg"
          onClick={() => {
            {
              ModifyTracker("newTracker");
              setTrackers((prev) =>
                prev.includes(stockSymbol) ? prev : [...prev, stockSymbol],
              );
            }
          }}
          disabled={stockSymbol == ""}
        >
          ADD
        </button>
        <button
          className="btn btn-success btn-lg"
          onClick={() => {
            {
              ModifyTracker("closeTracker");
              setTrackers((prev) =>
                prev.filter((item) => item !== stockSymbol),
              );
            }
          }}
          disabled={stockSymbol == ""}
        >
          REMOVE
        </button>
      </div>
      <div
        style={{
          flex: "1 1 auto", // This allows the chart to grow/shrink to fit
          width: "100%",
          minHeight: "0",
          position: "relative",
        }}
      >
        <Line
          key={`${stockSymbol}-${timeframe}`}
          options={options}
          data={graphData}
        />{" "}
      </div>
      <div className="d-flex flex-wrap gap-2 justify-content-center my-3">
        {(["Live", "1W", "1M", "3M", "1Y", "3Y", "All"] as const).map((tf) => {
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
        })}
      </div>
      <div className="mb-2 mx-2">
        <label>
          Amount:{" "}
          <input
            type="number"
            value={amount}
            min={1}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="d-flex gap-2 mb-2 mx-2">
        <button
          className="btn btn-secondary"
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
          className="btn btn-secondary"
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

              if (newAmount <= 0) {
                delete updated[stockSymbol];
              } else {
                updated[stockSymbol] = newAmount;
              }

              return updated;
            });
          }}
          disabled={latestMark <= 0}
        >
          Close Position
        </button>
      </div>
    </div>
  );
};

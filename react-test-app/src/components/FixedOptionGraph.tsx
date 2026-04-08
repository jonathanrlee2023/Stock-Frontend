import React, { act, useEffect, useState } from "react";
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
import { OptionPoint, usePriceStream } from "./PriceContext";
import { OptionMetric } from "./OptionGraph";
import { verticalLinePlugin } from "./TodayGraph";
import { formatFriendlyId } from "./OptionExpirationCards";

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

interface FixedOptionWSProps {
  optionID: string;
  activePortfolio: number;
}

export const postData = async (
  openOrClose: string,
  ID: string,
  price: number,
  amount: number,
  portfolio_id: number,
) => {
  const data = { id: ID, price, amount, portfolio_id };

  try {
    const response = await fetch(`http://localhost:8080/${openOrClose}`, {
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

export const addNewTracker = async (ID: string) => {
  const data = {
    id: ID,
  };

  try {
    const response = await fetch("http://localhost:8080/newTracker", {
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

const parseOptionId = (optionID: string) => {
  // Use a regex that handles both padded spaces and underscores
  // This version is safe for "NVDA  260218C00182500"
  const regex = /^([A-Z]+)[_\s]*(\d{2})(\d{2})(\d{2})([CP])(\d+)$/;
  const match = optionID.trim().match(regex);

  if (!match) {
    // Instead of throwing, return null to let the component handle the 'Empty' state
    console.warn("Could not parse option ID:", optionID);
    return null;
  }

  const [_, underlying, yy, mm, dd, type, strikeStr] = match;

  const year = parseInt(yy, 10) + 2000;
  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);
  const expiration = new Date(year, month - 1, day);
  const strike = parseInt(strikeStr, 10) / 1000;

  return {
    underlying: underlying.trim(),
    expiration,
    type: type === "C" ? "Call" : "Put",
    strike,
  };
};

const METRICS: OptionMetric[] = [
  "Mark",
  "IV",
  "Delta",
  "Gamma",
  "Theta",
  "Vega",
];

export const FixedOptionWSComponent: React.FC<FixedOptionWSProps> = ({
  optionID,
  activePortfolio,
}) => {
  const { optionPoints } = usePriceStream();
  const { ids, setIds, setTrackers } = useWS();

  // Parse optionID once per render
  const parsedData = React.useMemo(() => parseOptionId(optionID), [optionID]);
  if (!parsedData) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-muted">Invalid Option Format: {optionID}</div>
      </div>
    );
  }

  const { underlying, expiration, type, strike } = parsedData;

  const now = new Date();
  const isExpired = expiration < now;

  const points = optionPoints[optionID] || [];
  const [amount, setAmount] = useState<number>(1);
  const portfolioPositions = ids[activePortfolio] || {};
  const currentContracts = portfolioPositions[optionID] ?? 0;
  const [dataPoint, setDataPoint] = useState<OptionMetric>("Mark");
  const latestPoint = points.length > 0 ? points[points.length - 1] : null;
  const latestMark = latestPoint?.Mark ?? 0;

  // For the graph label
  const stockSymbol = underlying;
  const strikePrice = strike;
  const month = expiration.getMonth() + 1;
  const day = expiration.getDate();
  const year = expiration.getFullYear();

  // (rest of your code...)

  const graphData = React.useMemo(() => {
    // Your logic here, unchanged

    const minutePoints = new Map<number, OptionPoint>();

    for (const p of points) {
      const minuteKey = Math.floor((p.timestamp - 15) / 60);

      const pointTime = new Date(p.timestamp * 1000);
      const now = new Date();

      const pointMinute = new Date(
        pointTime.getFullYear(),
        pointTime.getMonth(),
        pointTime.getDate(),
        pointTime.getHours(),
        pointTime.getMinutes(),
      ).getTime();

      const currentMinute = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
      ).getTime();

      if (pointMinute < currentMinute) {
        minutePoints.set(minuteKey, p);
      } else if (pointMinute === currentMinute) {
        minutePoints.set(minuteKey, p);
      }
    }

    const filteredPoints = Array.from(minutePoints.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([_, point]) => point);

    return {
      datasets: [
        {
          label: `${stockSymbol} $${strikePrice} ${type} Expiring ${month}/${day}/${year}`,
          data: filteredPoints.map((p) => ({
            x: new Date(p.timestamp * 1000),
            y: p[dataPoint as keyof typeof p] as number,
          })),
          fill: false,
          borderColor: "rgb(66, 0, 189)",
          tension: 0,
        },
      ],
    };
  }, [points, stockSymbol, strikePrice, type, month, day, year, dataPoint]);
  const options = React.useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0, // Keep it snappy for live data
      },
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        // Legend is usually redundant for a single metric history
        legend: { display: false },
        title: {
          display: true,
          text: `METRIC_STREAM: ${dataPoint.toUpperCase()}_HIST // ${formatFriendlyId(optionID)}`,
          align: "start" as const,
          color: "#7e7cf3", // Brand Purple
          font: {
            family: "monospace",
            size: 11,
            weight: "bold" as const,
          },
          padding: { bottom: 15 },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "#0a0a0a",
          borderColor: "#333",
          borderWidth: 1,
          cornerRadius: 0,
          titleFont: { family: "monospace", size: 12, weight: "bold" as const },
          bodyFont: { family: "monospace", size: 12 },
          displayColors: false,
        },
      },
      scales: {
        x: {
          type: "time" as const,
          time: {
            tooltipFormat: "HH:mm:ss",
            // Use a shorter format for ticks to keep the terminal look clean
            displayFormats: {
              second: "HH:mm:ss",
              minute: "HH:mm",
              hour: "HH:mm",
            },
          },
          grid: {
            color: "#111",
            borderColor: "#222",
          },
          ticks: {
            color: "#444",
            font: { family: "monospace", size: 9 },
            maxRotation: 0,
          },
        },
        y: {
          grid: {
            color: "#111",
            borderColor: "#222",
          },
          ticks: {
            color: "#444",
            font: { family: "monospace", size: 9 },
            callback: (value: any) =>
              typeof value === "number" ? value.toFixed(4) : value,
          },
        },
      },
    };
  }, [dataPoint, stockSymbol]);

  const ModifyTracker = async (action: string) => {
    let data: { id: string } = { id: "" };

    data.id = formatOptionSymbol(
      stockSymbol,
      day,
      month,
      year,
      type,
      strikePrice,
    );

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

  function formatOptionSymbol(
    stock: string,
    day: number,
    month: number,
    year: number,
    type: string,
    strike: number,
  ): string {
    // 1. Format Year to YY (e.g., 2026 -> "26")
    const yearStr = String(year);
    const yy =
      yearStr.length === 4 ? yearStr.slice(2) : yearStr.padStart(2, "0");

    // 2. Pad Month and Day (e.g., 2 -> "02")
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    // 3. Format Type (Call/Put -> C/P)
    const typeLetter = type.toUpperCase().startsWith("C") ? "C" : "P";

    // 4. Format Strike (e.g., 182.5 -> 182500 -> "00182500")
    const strikeStr = (strike * 1000).toFixed(0).padStart(8, "0");

    // 5. Format Ticker with padding spaces (OCC standard)
    // The ticker section is 6 characters long.
    // "NVDA" becomes "NVDA  " (2 spaces)
    const paddedStock = stock.toUpperCase().padEnd(6, " ");

    return `${paddedStock}${yy}${mm}${dd}${typeLetter}${strikeStr}`;
  }

  return (
    <div
      style={{
        padding: "0px",
        height: "94%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* --- Chart Area (Flexible) --- */}
      <div
        style={{
          flex: "1 1 auto",
          width: "100%",
          minHeight: "0",
          position: "relative",
          borderBottom: "1px solid #111",
        }}
      >
        <Line
          key={stockSymbol}
          options={options}
          data={graphData}
          plugins={[verticalLinePlugin]}
        />
      </div>

      {/* --- Metrics Selector (Grid) --- */}
      <div
        className="p-2 d-flex gap-1 flex-wrap justify-content-center"
        style={{ backgroundColor: "#050505", borderBottom: "1px solid #222" }}
      >
        {METRICS.map((g) => {
          const val = latestPoint ? latestPoint[g as keyof OptionPoint] : null;
          const isActive = dataPoint === g;

          return (
            <button
              key={g}
              onClick={() => setDataPoint(g)}
              style={{
                padding: "4px 10px",
                fontSize: "0.65rem",
                fontFamily: "monospace",
                backgroundColor: isActive ? "#7e7cf3" : "#111",
                color: isActive ? "#000" : "#666",
                border: `1px solid ${isActive ? "#7e7cf3" : "#333"}`,
                fontWeight: isActive ? "bold" : "normal",
                borderRadius: "2px",
                transition: "all 0.1s ease",
              }}
            >
              {g.toUpperCase()}:{" "}
              {typeof val === "number" ? val.toFixed(4) : "N/A"}
            </button>
          );
        })}
      </div>

      {/* --- Execution & Tracking Bar --- */}
      <div
        className="p-3 d-flex flex-column gap-3"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div className="d-flex align-items-center justify-content-between">
          {/* Left: Input & Trade Actions */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex flex-column">
              <label
                style={{
                  fontSize: "9px",
                  color: "#555",
                  fontWeight: "bold",
                  marginBottom: "2px",
                }}
              >
                QUANTITY
              </label>
              <input
                type="number"
                className="terminal-input"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{
                  width: "80px",
                  backgroundColor: "#000",
                  border: "1px solid #333",
                  color: "#00ff88",
                  fontSize: "0.9rem",
                  fontFamily: "monospace",
                  padding: "2px 5px",
                }}
              />
            </div>

            <div className="d-flex gap-2 align-self-end">
              <button
                className="btn-sleek btn-sleek-green"
                onClick={() => {
                  postData(
                    "openPosition",
                    optionID,
                    latestMark,
                    amount,
                    activePortfolio,
                  );
                  ModifyTracker("newTracker");
                  setIds((prev) => {
                    const nextState = { ...prev };

                    if (!nextState[activePortfolio]) {
                      nextState[activePortfolio] = {};
                    }

                    const currentShares =
                      nextState[activePortfolio][optionID] ?? 0;
                    nextState[activePortfolio] = {
                      ...nextState[activePortfolio],
                      [optionID]: currentShares + amount,
                    };

                    return nextState;
                  });
                }}
                disabled={latestMark <= 0 || isExpired}
              >
                OPEN
              </button>
              <button
                className="btn-sleek btn-sleek-red"
                onClick={() => {
                  postData(
                    "closePosition",
                    optionID,
                    latestMark,
                    amount,
                    activePortfolio,
                  );
                  setIds((prev) => {
                    const updated = { ...prev };
                    const currentAmount =
                      updated[activePortfolio][optionID] ?? 0;
                    const newAmount = currentAmount - amount;

                    if (newAmount <= 0) {
                      delete updated[activePortfolio][optionID];
                    } else {
                      updated[activePortfolio][optionID] = newAmount;
                    }

                    return updated;
                  });
                }}
                disabled={latestMark <= 0 || isExpired}
              >
                CLOSE
              </button>
              <button
                className="btn-sleek"
                style={{ borderColor: "#444", color: "#888" }}
                onClick={() => {
                  postData(
                    "closePosition",
                    optionID,
                    latestMark,
                    currentContracts,
                    activePortfolio,
                  );
                  setIds((prev) => {
                    const updated = { ...prev };
                    delete updated[activePortfolio][optionID];
                    return updated;
                  });
                }}
                disabled={latestMark <= 0 || (currentContracts ?? 0) <= 0}
              >
                LIQUIDATE
              </button>
            </div>
          </div>

          {/* Right: Tracker Actions */}
          <div className="d-flex gap-2 align-self-end">
            <button
              className="btn-sleek"
              style={{ color: "#7e7cf3", borderColor: "#333" }}
              onClick={() => {
                ModifyTracker("newTracker");
                const symbol = formatOptionSymbol(
                  stockSymbol,
                  day,
                  month,
                  year,
                  type,
                  strikePrice,
                );
                setTrackers((prev) =>
                  prev.includes(symbol) ? prev : [...prev, symbol],
                );
              }}
              disabled={isExpired || latestMark <= 0}
            >
              TRACK
            </button>
            <button
              className="btn-sleek"
              style={{ color: "#666", borderColor: "#222" }}
              onClick={() => {
                ModifyTracker("closeTracker");
                const symbol = formatOptionSymbol(
                  stockSymbol,
                  day,
                  month,
                  year,
                  type,
                  strikePrice,
                );
                setTrackers((prev) => prev.filter((item) => item !== symbol));
              }}
            >
              UNTRACK
            </button>
          </div>
        </div>

        {/* --- Status Bar --- */}
        {(isExpired || latestMark <= 0) && (
          <div
            className="px-2 py-1"
            style={{
              backgroundColor: "#200",
              border: "1px solid #400",
              fontSize: "0.7rem",
              fontFamily: "monospace",
              color: "#f55",
              textAlign: "center",
            }}
          >
            {isExpired
              ? "CRITICAL: OPTION_EXPIRED // SETTLEMENT_CLOSED"
              : "WARNING: NO_MARK_DATA_AVAILABLE"}
          </div>
        )}
      </div>
    </div>
  );
};

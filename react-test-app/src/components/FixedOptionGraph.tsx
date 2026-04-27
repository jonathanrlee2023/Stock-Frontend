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
import { useWS } from "./Contexts/WSContest"; // adjust import
import "chartjs-adapter-date-fns";
import { OptionPoint, useOptionContext } from "./Contexts/OptionContext";
import { OptionMetric } from "./OptionGraph";
import { verticalLinePlugin } from "./TodayGraph";
import { formatFriendlyId } from "./OptionExpirationCards";
import { COLORS } from "../constants/Colors";
import {
  postData,
  formatOptionSymbol,
  ParseOptionId,
  ModifyTracker,
} from "./BackendCom";

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
  const { optionPoints } = useOptionContext();
  const { ids, setIds, setTrackers, clientID } = useWS();

  // Parse optionID once per render
  const parsedData = React.useMemo(() => ParseOptionId(optionID), [optionID]);
  if (!parsedData) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-muted">Invalid Option Format: {optionID}</div>
      </div>
    );
  }

  const { ticker, year, month, day, type, strike } = parsedData;
  const expiration = new Date(`${year}-${month}-${day}`);

  const now = new Date();
  const isExpired = expiration < now;

  const points = optionPoints[optionID] || [];
  const [amount, setAmount] = useState<number>(1);
  const portfolioPositions = ids[activePortfolio] || {};
  const currentContracts = portfolioPositions[optionID] ?? 0;
  const [dataPoint, setDataPoint] = useState<OptionMetric>("Mark");
  const latestPoint = points.length > 0 ? points[points.length - 1] : null;
  const latestMark = latestPoint?.Mark ?? 0;

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
          label: `${ticker} $${strike} ${type} Expiring ${month}/${day}/${year}`,
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
  }, [points, ticker, strike, type, month, day, year, dataPoint]);
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
          color: COLORS.secondaryTextColor, // Brand Purple
          font: {
            family: "monospace",
            size: 11,
            weight: "bold" as const,
          },
          padding: { bottom: 15 },
        },
        tooltip: {
          enabled: true,
          backgroundColor: COLORS.cardBackground,
          borderColor: COLORS.borderColor,
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
  }, [dataPoint, ticker]);

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
          key={ticker}
          options={options}
          data={graphData}
          plugins={[verticalLinePlugin]}
        />
      </div>

      {/* --- Metrics Selector (Grid) --- */}
      <div
        className="p-2 d-flex gap-1 flex-wrap justify-content-center"
        style={{
          backgroundColor: COLORS.cardBackground,
          borderBottom: "1px solid" + COLORS.cardSoftBorder,
        }}
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
                backgroundColor: isActive
                  ? COLORS.secondaryTextColor
                  : COLORS.cardBackground,
                color: isActive ? COLORS.appBackground : COLORS.infoTextColor,
                border: `1px solid ${isActive ? COLORS.secondaryTextColor : COLORS.cardSoftBorder}`,
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
        style={{ backgroundColor: COLORS.cardBackground }}
      >
        <div className="d-flex align-items-center justify-content-between">
          {/* Left: Input & Trade Actions */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex flex-column">
              <label
                style={{
                  fontSize: "9px",
                  color: COLORS.infoTextColor,
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
                  backgroundColor: COLORS.cardBackground,
                  border: `1px solid ${COLORS.borderColor}`,
                  color: COLORS.green.button,
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
                    clientID,
                  );
                  ModifyTracker(
                    "newTracker",
                    formatOptionSymbol(ticker, day, month, year, type, strike),
                  );
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
                    clientID,
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
                disabled={
                  latestMark <= 0 ||
                  isExpired ||
                  amount <= 0 ||
                  amount > currentContracts ||
                  (currentContracts ?? 0) <= 0
                }
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
                    clientID,
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
              style={{
                color: COLORS.secondaryTextColor,
                borderColor: COLORS.borderColor,
              }}
              onClick={() => {
                ModifyTracker(
                  "newTracker",
                  formatOptionSymbol(ticker, day, month, year, type, strike),
                );
                const symbol = formatOptionSymbol(
                  ticker,
                  day,
                  month,
                  year,
                  type,
                  strike,
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
              onClick={() => {
                ModifyTracker(
                  "closeTracker",
                  formatOptionSymbol(ticker, day, month, year, type, strike),
                );
                const symbol = formatOptionSymbol(
                  ticker,
                  day,
                  month,
                  year,
                  type,
                  strike,
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

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
import { useStreamActionsContext } from "./Contexts/StreamActionsContext";
import { verticalLinePlugin } from "./TodayGraph";
import { formatFriendlyId } from "./OptionExpirationCards";
import { COLORS } from "../constants/Colors";
import { postData, formatOptionSymbol, ModifyTracker } from "./BackendCom";
import exp from "constants";
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

interface OptionWSProps {
  stockSymbol: string;
  day: string;
  month: string;
  year: string;
  strikePrice: string;
  type: string;
  activePortfolio: number;
}

// 1. Derive a type of only the non‐symbol keys
export type OptionMetric = Exclude<keyof OptionPoint, "symbol">;

// 2. Build a literal list of exactly those metrics
const METRICS: OptionMetric[] = [
  "Mark",
  "IV",
  "Delta",
  "Gamma",
  "Theta",
  "Vega",
];

export const OptionWSComponent: React.FC<OptionWSProps> = ({
  stockSymbol,
  day,
  month,
  year,
  strikePrice,
  type,
  activePortfolio,
}) => {
  const { pendingRequests, startOptionStream } = useStreamActionsContext();
  const { optionPoints } = useOptionContext();
  const { ids, setIds, setTrackers, clientID } = useWS();

  const expectedSymbol = formatOptionSymbol(
    stockSymbol,
    day,
    month,
    year,
    type,
    strikePrice,
  );
  const portfolioPositions = ids[activePortfolio] || {};
  const currentContracts = portfolioPositions[expectedSymbol] ?? 0;
  const isPending = pendingRequests.has(expectedSymbol);

  const expirationDate = React.useMemo(() => {
    let yearNum = parseInt(year, 10);

    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100; // e.g., 2000
    yearNum += currentCentury;
    const monthNum = parseInt(month, 10) - 1;
    const dayNum = parseInt(day, 10);

    return new Date(yearNum, monthNum, dayNum, 23, 59, 59);
  }, [day, month, year]);

  const fieldMissing =
    stockSymbol == "" ||
    day == "" ||
    month == "" ||
    year == "" ||
    type == "" ||
    strikePrice == "";

  // Check if the expiration date is in the past
  const now = new Date();
  const isExpired = expirationDate < now;

  const points = optionPoints[expectedSymbol] || [];
  const [amount, setAmount] = useState<number>(1);
  const [dataPoint, setDataPoint] = useState<OptionMetric>("Mark");

  const latestPoint = points.length > 0 ? points[points.length - 1] : null;
  const latestMark = latestPoint?.Mark ?? 0;

  const graphData = React.useMemo(() => {
    const minutePoints = new Map<number, OptionPoint>(); // key: floored minute, value: StockPoint

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
        // Past minutes: store latest point for each completed minute
        minutePoints.set(minuteKey, p);
      } else if (pointMinute === currentMinute) {
        // Current minute: always overwrite with latest point for live movement
        minutePoints.set(minuteKey, p);
      }
      // Future points ignored (if clock sync issues send future data).
    }

    const filteredPoints = Array.from(minutePoints.entries())
      .sort((a, b) => a[0] - b[0]) // sort by minute order
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
          text: `METRIC_STREAM: ${dataPoint.toUpperCase()}_HIST // ${formatFriendlyId(expectedSymbol)}`,
          align: "start" as const,
          color: COLORS.secondaryTextColor,
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
            color: COLORS.cardSoftBorder,
            borderColor: COLORS.cardSoftBorder,
          },
          ticks: {
            color: COLORS.infoTextColor,
            font: { family: "monospace", size: 9 },
            maxRotation: 0,
          },
        },
        y: {
          grid: {
            color: COLORS.cardSoftBorder,
            borderColor: COLORS.cardSoftBorder,
          },
          ticks: {
            color: COLORS.infoTextColor,
            font: { family: "monospace", size: 9 },
            // If the metric is a small decimal (like Theta), force 4 decimal places
            callback: (value: any) =>
              typeof value === "number" ? value.toFixed(4) : value,
          },
        },
      },
    };
  }, [dataPoint, stockSymbol]);

  return (
    <div
      className="d-flex flex-column"
      style={{
        height: "94%",
        width: "100%",
        backgroundColor: "#000",
        overflow: "hidden",
        padding: "0",
      }}
    >
      {/* --- TOP CONTROL ROW: Search & Track --- */}
      <div
        className="d-flex gap-2 p-2 align-items-center"
        style={{ flex: "0 0 auto", borderBottom: "1px solid #222" }}
      >
        <button
          className={`btn-sleek ${isPending ? "btn-loading" : ""}`}
          style={{
            minWidth: "120px",
            backgroundColor: COLORS.secondaryTextColor,
            color: COLORS.mainFontColor,
          }}
          onClick={() =>
            startOptionStream(
              stockSymbol,
              strikePrice,
              day,
              month,
              year,
              type,
              clientID,
            )
          }
          disabled={fieldMissing || isExpired}
        >
          {isPending ? "BUSY..." : "STREAM LIVE 📡"}
        </button>

        <div className="ms-auto d-flex gap-2">
          <button
            className="btn-sleek btn-outline"
            onClick={() => {
              ModifyTracker("newTracker", expectedSymbol);
              setTrackers((prev) =>
                prev.includes(expectedSymbol)
                  ? prev
                  : [...prev, expectedSymbol],
              );
            }}
            disabled={fieldMissing || isExpired}
          >
            TRACK
          </button>
          <button
            className="btn-sleek btn-outline text-danger"
            onClick={() => {
              ModifyTracker("closeTracker", expectedSymbol);
              setTrackers((prev) =>
                prev.filter((item) => item !== expectedSymbol),
              );
            }}
            disabled={fieldMissing || isExpired}
          >
            UNTRACK
          </button>
        </div>
      </div>

      {/* --- STATUS NOTIFICATIONS (Pinned) --- */}
      {(isExpired || fieldMissing || latestMark <= 0) && (
        <div
          style={{
            flex: "0 0 auto",
            fontSize: "0.7rem",
            padding: "4px 12px",
            backgroundColor: "#1a0000",
            color: "#ff4444",
            borderBottom: "1px solid #300",
          }}
        >
          {isExpired && "⚠️ EXPIRED: Actions Disabled"}
          {fieldMissing && "⚠️ INPUT REQUIRED: Fill all fields"}
          {!isExpired &&
            !fieldMissing &&
            latestMark <= 0 &&
            "📡 NO MARK: Waiting for data..."}
        </div>
      )}

      {/* --- MAIN CHART AREA --- */}
      <div
        className="flex-grow-1 w-100"
        style={{
          minHeight: "0",
          position: "relative",
          backgroundColor: COLORS.cardBackground,
        }}
      >
        <Line
          key={stockSymbol}
          options={options}
          data={graphData}
          plugins={[verticalLinePlugin]}
        />
      </div>

      {/* --- METRIC SELECTOR GRID --- */}
      <div
        className="p-2 d-flex gap-1 flex-wrap justify-content-center"
        style={{
          flex: "0 0 auto",
          backgroundColor: "#0a0a0a",
          borderTop: "1px solid #222",
        }}
      >
        {METRICS.map((g) => {
          const val = latestPoint ? latestPoint[g as keyof OptionPoint] : null;
          const isActive = dataPoint === g;
          return (
            <button
              key={g}
              className={`btn btn-sm ${isActive ? "btn-primary" : "btn-dark"}`}
              style={{
                fontSize: "0.65rem",
                border: isActive
                  ? "1px solid COLORS.secondaryTextColor"
                  : "1px solid #333",
              }}
              onClick={() => setDataPoint(g)}
            >
              <span style={{ color: "#888" }}>{g.toUpperCase()}:</span>{" "}
              <span
                style={{
                  color: isActive ? COLORS.mainFontColor : "#00ff00",
                  fontFamily: "monospace",
                }}
              >
                {typeof val === "number" ? val.toFixed(4) : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- TRADING PANEL --- */}
      <div
        className="p-3"
        style={{
          flex: "0 0 auto",
          backgroundColor: "#000",
          borderTop: "1px solid #333",
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-3">
          <label
            className="text-secondary small fw-bold"
            style={{ letterSpacing: "1px" }}
          >
            QTY:
          </label>
          <input
            className="search-bar"
            type="number"
            value={amount}
            min={0}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{
              width: "80px",
              backgroundColor: "#111",
              border: "1px solid #444",
              color: COLORS.mainFontColor,
              textAlign: "center",
            }}
          />
          <div className="ms-auto text-end">
            <div className="text-secondary small">LATEST MARK</div>
            <div
              className="fw-bold"
              style={{ color: latestMark > 0 ? "#00ff00" : "#444" }}
            >
              {latestMark > 0 ? `$${latestMark.toFixed(2)}` : "N/A"}
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-success flex-grow-1 fw-bold"
            style={{ opacity: latestMark <= 0 || isExpired ? 0.5 : 1 }}
            onClick={() => {
              postData(
                "openPosition",
                expectedSymbol,
                latestMark,
                amount,
                activePortfolio,
                clientID,
              );
              ModifyTracker("newTracker", expectedSymbol);
              setIds((prev) => ({
                ...prev,
                [expectedSymbol]:
                  (prev[activePortfolio][expectedSymbol] ?? 0) + amount,
              }));
            }}
            disabled={latestMark <= 0 || isExpired}
          >
            BUY / OPEN
          </button>
          <button
            className="btn btn-outline-danger flex-grow-1 fw-bold"
            style={{ opacity: latestMark <= 0 || isExpired ? 0.5 : 1 }}
            onClick={() => {
              postData(
                "closePosition",
                expectedSymbol,
                latestMark,
                amount,
                activePortfolio,
                clientID,
              );
              setIds((prev) => {
                const updated = { ...prev };
                const newAmt =
                  (updated[activePortfolio][expectedSymbol] ?? 0) - amount;
                if (newAmt <= 0)
                  delete updated[activePortfolio][expectedSymbol];
                else updated[activePortfolio][expectedSymbol] = newAmt;
                return updated;
              });
            }}
            disabled={latestMark <= 0 || isExpired}
          >
            SELL / CLOSE
          </button>
          <button
            className="btn btn-danger fw-bold"
            onClick={() => {
              postData(
                "closePosition",
                stockSymbol,
                latestMark,
                portfolioPositions[expectedSymbol],
                activePortfolio,
                clientID,
              );
              setIds((prev) => {
                const u = { ...prev };
                delete u[activePortfolio][expectedSymbol];
                return u;
              });
            }}
            disabled={latestMark <= 0 || currentContracts <= 0}
          >
            EXIT ALL
          </button>
        </div>
      </div>
    </div>
  );
};

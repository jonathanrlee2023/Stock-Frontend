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
import { OptionPoint, usePriceStream } from "./PriceContext";
import { data } from "react-router-dom";
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
}

function formatOptionSymbol(
  stock: string,
  day: string,
  month: string,
  year: string,
  type: string,
  strike: string,
): string {
  const yy = year.length === 4 ? year.slice(2) : year; // Convert YYYY to YY if needed
  const typeLetter = type.toUpperCase().startsWith("C") ? "C" : "P";

  // Convert strike price string to number, then format
  const strikeNum = parseFloat(strike);
  const strikeStr = (strikeNum * 1000).toFixed(0).padStart(8, "0");

  return `${stock.toUpperCase()}_${yy}${month.padStart(2, "0")}${day.padStart(
    2,
    "0",
  )}${typeLetter}${strikeStr}`;
}
export const postData = async (
  openOrClose: string,
  ID: string,
  price: number,
  amount: number,
) => {
  const data = { id: ID, price, amount };

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
}) => {
  const { pendingRequests, optionPoints, startOptionStream } = usePriceStream();
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

  const expectedSymbol = formatOptionSymbol(
    stockSymbol,
    day,
    month,
    year,
    type,
    strikePrice,
  );
  const { setIds, setTrackers } = useWS();
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `${dataPoint.charAt(0).toUpperCase()}${dataPoint.slice(
          1,
        )} History`,
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          tooltipFormat: "HH:mm:ss",
        },
      },
    },
  };

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
      <div className="d-flex gap-2 mx-2 mb-2" style={{ flex: "0 0 auto" }}>
        <button
          className="btn-sleek btn-lg"
          onClick={() => {
            startOptionStream(stockSymbol, strikePrice, day, month, year, type);
          }}
          disabled={fieldMissing || isExpired}
        >
          {isPending ? "SEARCHING..." : "SEARCH 🔍"}
        </button>
        <button
          className="btn-sleek ms-auto mt-1"
          onClick={() => {
            {
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
            }
          }}
          disabled={fieldMissing || isExpired}
        >
          ADD
        </button>
        <button
          className="btn-sleek mt-1"
          onClick={() => {
            {
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
            }
          }}
          disabled={fieldMissing || isExpired}
        >
          REMOVE
        </button>
      </div>

      {isExpired && (
        <div
          style={{
            color: "red",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          The option expiration date has passed. Actions are disabled.
        </div>
      )}
      {fieldMissing && (
        <div
          className="d-flex gap-2 mx-2 mb-2"
          style={{
            color: "orange",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          Please fill in all fields before proceeding.
        </div>
      )}
      <div
        style={{
          flex: "1 1 auto",
          width: "100%",
          minHeight: "0",
          position: "relative",
        }}
      >
        <Line key={stockSymbol} options={options} data={graphData} />
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {METRICS.map((g) => {
          const val = latestPoint ? latestPoint[g as keyof OptionPoint] : null;

          return (
            <button
              key={g}
              className={`btn btn-sm ${dataPoint === g ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setDataPoint(g)}
            >
              {g.toUpperCase()}:{" "}
              {typeof val === "number" ? val.toFixed(4) : "N/A"}
            </button>
          );
        })}
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
      <div className="d-flex gap-2 mb-2 mx-2">
        <button
          className="btn-sleek btn-sleek-green"
          style={{
            opacity: latestMark <= 0 ? 0.5 : 1,
            cursor: latestMark <= 0 ? "not-allowed" : "pointer",
            color: latestMark <= 0 ? "gray" : "green",
          }}
          onClick={() => {
            postData("openPosition", expectedSymbol, latestMark, amount);
            ModifyTracker("newTracker");
            setIds((prev) => ({
              ...prev,
              [expectedSymbol]: (prev[expectedSymbol] ?? 0) + amount,
            }));
          }}
          disabled={latestMark <= 0 || isExpired}
        >
          Open Position
        </button>
        <button
          className="btn-sleek btn-sleek-red"
          style={{
            opacity: latestMark <= 0 ? 0.5 : 1,
            cursor: latestMark <= 0 ? "not-allowed" : "pointer",
            color: latestMark <= 0 ? "gray" : "red",
          }}
          onClick={() => {
            postData("closePosition", expectedSymbol, latestMark, amount);
            setIds((prev) => {
              const updated = { ...prev };
              const currentAmount = updated[expectedSymbol] ?? 0;
              const newAmount = currentAmount - amount;

              if (newAmount <= 0) {
                delete updated[expectedSymbol];
              } else {
                updated[expectedSymbol] = newAmount;
              }

              return updated;
            });
          }}
          disabled={latestMark <= 0 || isExpired}
        >
          Close Position
        </button>
        {isExpired && (
          <div
            style={{
              color: "red",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            The option expiration date has passed. Actions are disabled.
          </div>
        )}
        {latestMark <= 0 && (
          <div
            style={{
              color: "orange",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            No Mark
          </div>
        )}
      </div>
    </div>
  );
};

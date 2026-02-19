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
import { OptionMetric } from "./OptionGraph";
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
}) => {
  const { optionPoints } = usePriceStream();
  const { setIds, setTrackers } = useWS();

  console.log(optionPoints);

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
        padding: "0px", // Remove or minimize padding
        height: "100%",
        width: "100%", // Force full width
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
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
      <div className="d-flex justify-content-between align-items-center mb-2 mx-2">
        {/* Left Side: Position Actions */}
        <div className="d-flex gap-2 mb-2 mx-2">
          <button
            className="btn-sleek btn-sleek-green"
            style={{
              opacity: latestMark <= 0 ? 0.5 : 1,
              cursor: latestMark <= 0 ? "not-allowed" : "pointer",
              color: latestMark <= 0 ? "gray" : "green",
            }}
            onClick={() => {
              postData("openPosition", optionID, latestMark, amount);
              ModifyTracker("newTracker");
              setIds((prev) => ({
                ...prev,
                [optionID]: (prev[optionID] ?? 0) + amount,
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
              postData("closePosition", optionID, latestMark, amount);
              setIds((prev) => {
                const updated = { ...prev };
                const currentAmount = updated[optionID] ?? 0;
                const newAmount = currentAmount - amount;

                if (newAmount <= 0) {
                  delete updated[optionID];
                } else {
                  updated[optionID] = newAmount;
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

        {/* Right Side: Tracker Actions */}
        <div className="d-flex gap-2 mx-2 mb-2" style={{ flex: "0 0 auto" }}>
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
            disabled={isExpired || latestMark <= 0}
          >
            TRACK
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
            disabled={isExpired || latestMark <= 0}
          >
            UNTRACK
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
      </div>
      ;
    </div>
  );
};

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
  Legend
);

interface FixedOptionWSProps {
  optionID: string;
}

export const postData = async (
  openOrClose: string,
  ID: string,
  price: number,
  amount: number
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
  const [underlying, rest] = optionID.split("_");
  if (!rest || rest.length < 8) {
    throw new Error("Invalid option ID format");
  }

  const dateStr = rest.slice(0, 6);
  const type = rest.charAt(6);
  const strikeStr = rest.slice(7);

  const year = parseInt(dateStr.slice(0, 2), 10) + 2000;
  const month = parseInt(dateStr.slice(2, 4), 10);
  const day = parseInt(dateStr.slice(4, 6), 10);
  const expiration = new Date(year, month - 1, day);

  const strike = parseInt(strikeStr, 10) / 1000;

  return {
    underlying,
    expiration,
    type,
    strike,
  };
};

export const FixedOptionWSComponent: React.FC<FixedOptionWSProps> = ({
  optionID,
}) => {
  const { optionPoints } = usePriceStream();
  const { setIds } = useWS();

  // Parse optionID once per render
  const { underlying, expiration, type, strike } = React.useMemo(
    () => parseOptionId(optionID),
    [optionID]
  );

  const now = new Date();
  const isExpired = expiration < now;

  const points = optionPoints[optionID] || [];
  const [amount, setAmount] = useState<number>(1);
  const [dataPoint, setDataPoint] = useState<keyof OptionPoint>("mark");
  const latestPoint = points.length > 0 ? points[points.length - 1] : null;
  const latestMark = latestPoint?.mark ?? 0;

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
        pointTime.getMinutes()
      ).getTime();

      const currentMinute = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes()
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
            y: p[dataPoint],
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
          1
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
    <div>
      <div style={{ width: "100%", height: "750px" }}>
        {" "}
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
        {["mark", "iv", "delta", "gamma", "theta", "vega"].map((g) => (
          <button
            key={g}
            style={{
              background: dataPoint === g ? "#2d007a" : "#4200bd",
              color: "white",
              padding: "4px 8px",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
            onClick={() => setDataPoint(g as keyof OptionPoint)}
          >
            {g.toUpperCase()}:{" "}
            {latestPoint
              ? latestPoint[g as keyof typeof latestPoint]?.toFixed(4)
              : "N/A"}
          </button>
        ))}
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
            postData("openPosition", optionID, latestMark, amount);
            addNewTracker(optionID);
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
          className="btn btn-secondary"
          style={{
            opacity: latestMark <= 0 ? 0.5 : 1,
            cursor: latestMark <= 0 ? "not-allowed" : "pointer",
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
    </div>
  );
};

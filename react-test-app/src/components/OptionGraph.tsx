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
  strike: string
): string {
  const yy = year.length === 4 ? year.slice(2) : year; // Convert YYYY to YY if needed
  const typeLetter = type.toUpperCase().startsWith("C") ? "C" : "P";

  // Convert strike price string to number, then format
  const strikeNum = parseFloat(strike);
  const strikeStr = (strikeNum * 1000).toFixed(0).padStart(8, "0");

  return `${stock.toUpperCase()}_${yy}${month.padStart(2, "0")}${day.padStart(
    2,
    "0"
  )}${typeLetter}${strikeStr}`;
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

export const OptionWSComponent: React.FC<OptionWSProps> = ({
  stockSymbol,
  day,
  month,
  year,
  strikePrice,
  type,
}) => {
  const { optionPoints } = usePriceStream();

  const expectedSymbol = formatOptionSymbol(
    stockSymbol,
    day,
    month,
    year,
    type,
    strikePrice
  );
  const { setIds } = useWS();
  const expirationDate = React.useMemo(() => {
    let yearNum = parseInt(year, 10);

    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100; // e.g., 2000
    yearNum += currentCentury;
    const monthNum = parseInt(month, 10) - 1;
    const dayNum = parseInt(day, 10);

    return new Date(yearNum, monthNum, dayNum, 23, 59, 59);
  }, [day, month, year]);

  // Check if the expiration date is in the past
  const now = new Date();
  const isExpired = expirationDate < now;

  const points = optionPoints[expectedSymbol] || [];
  const [amount, setAmount] = useState<number>(1);
  const [dataPoint, setDataPoint] = useState<keyof OptionPoint>("mark");

  const latestPoint = points.length > 0 ? points[points.length - 1] : null;
  const latestMark = latestPoint?.mark ?? 0;

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
            y: p.mark,
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
            postData("openPosition", expectedSymbol, latestMark, amount);
            addNewTracker(expectedSymbol);
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
          className="btn btn-secondary"
          style={{
            opacity: latestMark <= 0 ? 0.5 : 1,
            cursor: latestMark <= 0 ? "not-allowed" : "pointer",
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

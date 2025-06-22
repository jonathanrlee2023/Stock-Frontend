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
import { usePriceStream } from "./PriceContext";
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
const postData = async (
  openOrClose: string,
  optionId: string,
  price: number,
  amount: number
) => {
  const data = { id: openOrClose, optionId, price, amount };

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

const addNewTracker = async (optionId: string) => {
  const data = {
    id: optionId,
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
  const { symbolPricePoints, greeks } = usePriceStream();

  const expectedSymbol = formatOptionSymbol(
    stockSymbol,
    day,
    month,
    year,
    type,
    strikePrice
  );
  const points = symbolPricePoints[expectedSymbol] || [];
  const greek = greeks[expectedSymbol] || {};
  const [amount, setAmount] = useState<number>(1);

  const latestMark = points.length > 0 ? points[points.length - 1].mark : 0;

  const graphData = React.useMemo(
    () => ({
      datasets: [
        {
          label: `${stockSymbol} $${strikePrice} ${type} Expiring ${month}/${day}/${year}`,
          data: points.map((p) => ({
            x: new Date(p.timestamp * 1000),
            y: p.mark,
          })),
          fill: false,
          borderColor: "rgb(66, 0, 189)",
          tension: 0.1,
        },
      ],
    }),
    [points, stockSymbol, strikePrice, type, month, day, year]
  );

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `Price History`,
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
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {["IV", "Delta", "Gamma", "Theta", "Vega"].map((name) => (
          <span
            key={name}
            style={{
              background: "#4200bd",
              color: "white",
              padding: "4px 8px",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          >
            {name}: {greek[name.toLowerCase() as keyof typeof greek] ?? "N/A"}
          </span>
        ))}
      </div>
      <div style={{ padding: "20px" }}>
        <Line key={stockSymbol} options={options} data={graphData} />
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
          onClick={() =>
            postData("openPosition", expectedSymbol, latestMark, amount)
          }
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
            postData("closePosition", expectedSymbol, latestMark, amount);
            addNewTracker(expectedSymbol);
          }}
          disabled={latestMark <= 0}
        >
          Close Position
        </button>
      </div>
    </div>
  );
};

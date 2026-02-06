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
import { StockPoint, usePriceStream } from "./PriceContext";
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
  const { stockPoints } = usePriceStream();
  const [amount, setAmount] = useState<number>(0);
  const { setIds, setTrackers } = useWS();
  const points = stockPoints[stockSymbol] || [];
  const latestPoint = points.length > 0 ? points[points.length - 1] : null;

  const latestMark = latestPoint?.Mark ?? 0;

  const graphData = React.useMemo(() => {
    const minutePoints = new Map<number, StockPoint>(); // key: floored minute, value: StockPoint

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
          label: `${stockSymbol}`,
          data: filteredPoints.map((p) => ({
            x: new Date(p.timestamp * 1000),
            y: p.Mark,
          })),
          fill: false,
          borderColor: "rgb(66, 0, 189)",
          tension: 0,
        },
      ],
    };
  }, [points, stockSymbol]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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

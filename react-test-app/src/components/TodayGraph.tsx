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
import { postData, addNewTracker } from "./OptionGraph";
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

interface TodayStockWSProps {
  stockSymbol: string;
}

export const TodayStockWSComponent: React.FC<TodayStockWSProps> = ({
  stockSymbol,
}) => {
  const { stockPoints } = usePriceStream();
  const [amount, setAmount] = useState<number>(0);

  const points = stockPoints[stockSymbol] || [];
  const latestPoint = points.length > 0 ? points[points.length - 1] : null;

  const latestMark = latestPoint?.mark ?? 0;

  const graphData = React.useMemo(
    () => ({
      datasets: [
        {
          label: `${stockSymbol} Last Price`,
          data: points.map((p) => ({
            x: new Date(p.timestamp * 1000),
            y: p.mark,
          })),
          fill: false,
          borderColor: "rgb(66, 0, 189)",
          tension: 0,
        },
      ],
    }),
    [points, stockSymbol]
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
    <div style={{ padding: "20px" }}>
      <Line key={stockSymbol} options={options} data={graphData} />
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
            addNewTracker(stockSymbol);
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
          }}
          disabled={latestMark <= 0}
        >
          Close Position
        </button>
      </div>
    </div>
  );
};

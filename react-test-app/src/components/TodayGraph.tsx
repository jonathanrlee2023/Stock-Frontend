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

type IncomingData = {
  symbol: string;
  mark: number;
  timestamp: number;
};

type PricePoint = {
  mark: number;
  timestamp: number;
};
interface TodayStockWSProps {
  stockSymbol: string;
}

export const TodayStockWSComponent: React.FC<TodayStockWSProps> = ({
  stockSymbol,
}) => {
  const { sendMessage, lastMessage } = useWS();
  const [symbolPricePoints, setSymbolPricePoints] = useState<
    Record<string, PricePoint[]>
  >({});

  useEffect(() => {
    if (lastMessage) {
      console.log("Processing lastMessage", lastMessage);
      const { symbol, mark, timestamp } = lastMessage;

      if (mark !== undefined && timestamp !== undefined) {
        const point: PricePoint = { mark, timestamp };
        setSymbolPricePoints((prev) => {
          const prevPoints = prev[symbol] || [];
          return {
            ...prev,
            [symbol]: [...prevPoints.slice(-99), point],
          };
        });
      } else {
        if (mark === undefined)
          console.warn("Message missing mark", lastMessage);
        if (timestamp === undefined)
          console.warn("Message missing timestamp", lastMessage);
      }
    }
  }, [lastMessage]);

  const graphData = React.useMemo(() => {
    const points = symbolPricePoints[stockSymbol] || [];
    return {
      datasets: [
        {
          label: `${stockSymbol} Last Price`,
          data: points.map((p) => ({
            x: new Date(p.timestamp * 1000),
            y: p.mark,
          })),
          fill: false,
          borderColor: "rgb(66, 0, 189)",
          tension: 0.1,
        },
      ],
    };
  }, [symbolPricePoints, stockSymbol]);

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
    </div>
  );
};

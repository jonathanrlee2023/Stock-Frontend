import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useWS } from "./WSContest"; // adjust import

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type LastPricePoint = {
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
  const [pricePoints, setPricePoints] = useState<LastPricePoint[]>([]);

  useEffect(() => {
    if (lastMessage) {
      console.log("Processing lastMessage", lastMessage);
      const { mark, timestamp } = lastMessage;

      if (mark !== undefined && timestamp !== undefined) {
        const point: LastPricePoint = { mark, timestamp };
        setPricePoints((prev) => [...prev.slice(-99), point]);
      } else {
        if (mark === undefined) {
          console.warn("Message missing mark", lastMessage);
        }
        if (timestamp === undefined) {
          console.warn("Message missing timestamp", lastMessage);
        }
      }
    }
  }, [lastMessage]);

  const labels = pricePoints.map((p) =>
    new Date(p.timestamp * 1000).toLocaleTimeString()
  );
  const dataValues = pricePoints.map((p) => p.mark);

  const graphData = React.useMemo(
    () => ({
      labels: pricePoints.map((p) =>
        new Date(p.timestamp * 1000).toLocaleTimeString()
      ),
      datasets: [
        {
          label: "Last Price",
          data: pricePoints.map((p) => p.mark),
          fill: false,
          borderColor: "rgb(66, 0, 189)",
          tension: 0.1,
        },
      ],
    }),
    [pricePoints]
  );

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `${stockSymbol} Last Price`,
      },
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <Line options={options} data={graphData} />
    </div>
  );
};

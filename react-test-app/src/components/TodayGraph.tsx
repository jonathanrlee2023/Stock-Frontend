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

interface TodayStockWSProps {
  stockSymbol: string;
}

export const TodayStockWSComponent: React.FC<TodayStockWSProps> = ({
  stockSymbol,
}) => {
  const { symbolPricePoints } = usePriceStream();

  const points = symbolPricePoints[stockSymbol] || [];

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
    </div>
  );
};

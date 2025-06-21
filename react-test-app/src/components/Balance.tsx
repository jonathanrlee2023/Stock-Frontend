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

export const BalanceWSComponent: React.FC = ({}) => {
  const { symbolPricePoints } = usePriceStream();

  const points = symbolPricePoints["balance"] || [];
  const latestBalance = points.length > 0 ? points[points.length - 1].mark : 0;

  const graphData = React.useMemo(
    () => ({
      datasets: [
        {
          label: `Balance`,
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
    [points]
  );

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `Balance`,
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
      <div
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}
      >
        Balance: ${latestBalance.toFixed(2)}
      </div>
      <Line key={"Balance"} options={options} data={graphData} />
    </div>
  );
};

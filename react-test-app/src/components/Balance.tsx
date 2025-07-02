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
  const { stockPoints } = usePriceStream();
  const { previousBalance } = useWS();

  const points = stockPoints["balance"] || [];
  const latestBalance = points.length > 0 ? points[points.length - 1].mark : 0;

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

    const xValues = filteredPoints.map((p) => new Date(p.timestamp * 1000));
    const minX = xValues[0] ?? new Date();
    const maxX = xValues[xValues.length - 1] ?? new Date();

    const lastPoint = filteredPoints[filteredPoints.length - 1];
    const balanceLineColor =
      lastPoint && lastPoint.mark < previousBalance
        ? "rgba(200, 0, 0, 0.8)"
        : "rgba(0, 150, 0, 0.8)";

    return {
      datasets: [
        {
          label: `Balance`,
          data: filteredPoints.map((p) => ({
            x: new Date(p.timestamp * 1000),
            y: p.mark,
          })),
          fill: false,
          borderColor: balanceLineColor,
          tension: 0,
        },
        {
          label: "Previous Balance",
          data: [
            { x: minX, y: previousBalance },
            { x: maxX, y: previousBalance },
          ],
          borderColor: "rgba(200, 0, 0, 0.8)",
          borderWidth: 1,
          pointRadius: 0,
          borderDash: [5, 5],
        },
      ],
    };
  }, [points, previousBalance]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: false,
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

  const balanceColor =
    latestBalance < previousBalance
      ? "rgba(200, 0, 0, 0.8)"
      : "rgba(0, 150, 0, 0.8)";

  let change = latestBalance - previousBalance;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}
      >
        Balance:{" "}
        <span style={{ color: balanceColor }}>
          ${latestBalance.toFixed(2)} ({change.toFixed(2)}){" "}
        </span>
      </div>
      <Line options={options} data={graphData} />
    </div>
  );
};

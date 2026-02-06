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
  Legend,
);

export const BalanceWSComponent: React.FC = ({}) => {
  const { stockPoints } = usePriceStream();
  const { previousBalance } = useWS();

  const points = stockPoints["balance"] || [];
  const latestBalance = points.length > 0 ? points[points.length - 1].Mark : 0;

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

    const xValues = filteredPoints.map((p) => new Date(p.timestamp * 1000));
    const minX = xValues[0] ?? new Date();
    const maxX = xValues[xValues.length - 1] ?? new Date();

    const lastPoint = filteredPoints[filteredPoints.length - 1];
    const balanceLineColor =
      lastPoint && lastPoint.Mark < previousBalance
        ? "rgba(200, 0, 0, 0.8)"
        : "rgba(0, 150, 0, 0.8)";

    return {
      datasets: [
        {
          label: `Balance`,
          data: filteredPoints.map((p) => ({
            x: new Date(p.timestamp * 1000),
            y: p.Mark,
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
    maintainAspectRatio: false, // Keep this false to obey the parent div height
    plugins: {
      legend: { display: false }, // Saves ~40px of vertical space
      title: { display: false }, // Header text handles this now
    },
    layout: {
      padding: { top: 10, bottom: 0 },
    },
    scales: {
      x: {
        type: "time" as const,
        time: { tooltipFormat: "HH:mm:ss" },
        ticks: { maxTicksLimit: 6, fontSize: 10 },
      },
      y: {
        ticks: { fontSize: 10, callback: (value: any) => `$${value}` },
      },
    },
  };

  const balanceColor =
    latestBalance < previousBalance
      ? "rgba(200, 0, 0, 0.8)"
      : "rgba(0, 150, 0, 0.8)";

  let change = latestBalance - previousBalance;

  return (
    <div style={{ padding: "20px", height: "70vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "5px",
        }}
      >
        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
          Balance:{" "}
          <span style={{ color: balanceColor }}>
            ${latestBalance.toFixed(2)}
          </span>
        </div>
        <div
          style={{ color: balanceColor, fontSize: "14px", fontWeight: "bold" }}
        >
          ({change >= 0 ? "+" : ""}
          {change.toFixed(2)})
        </div>
      </div>
      {/* This wrapper controls the chart's actual screen real estate */}
      <div style={{ height: "calc(100%)", position: "relative" }}>
        <Line options={options} data={graphData} />
      </div>
    </div>
  );
};

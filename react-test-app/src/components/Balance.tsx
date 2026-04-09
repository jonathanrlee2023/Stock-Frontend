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
import { BalancePoint, StockPoint, usePriceStream } from "./PriceContext";
import { COLORS } from "../constants/Colors";
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

interface BalanceWSProps {
  activePortfolio: number;
}

export const BalanceWSComponent: React.FC<BalanceWSProps> = ({
  activePortfolio,
}) => {
  const { balancePoints } = usePriceStream();
  const { previousBalance } = useWS();
  const previousPortfolioBalance = previousBalance[activePortfolio] || 0;
  const portfolioHistory = balancePoints[activePortfolio] || [];
  const latestBalance =
    portfolioHistory.length > 0
      ? portfolioHistory[portfolioHistory.length - 1].Balance
      : 0;

  const latestCash =
    portfolioHistory.length > 0
      ? portfolioHistory[portfolioHistory.length - 1].Cash
      : 0;

  const graphData = React.useMemo(() => {
    const minutePoints = new Map<number, BalancePoint>(); // key: floored minute, value: StockPoint

    for (const p of portfolioHistory) {
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
      lastPoint && lastPoint.Balance < previousPortfolioBalance
        ? COLORS.red.negative
        : COLORS.green.positive;

    return {
      datasets: [
        {
          label: `Balance`,
          data: filteredPoints.map((p) => ({
            x: new Date(p.timestamp * 1000),
            y: p.Balance,
          })),
          fill: false,
          borderColor: balanceLineColor,
          tension: 0,
        },
        {
          label: "Previous Balance",
          data: [
            { x: minX, y: previousPortfolioBalance },
            { x: maxX, y: previousPortfolioBalance },
          ],
          borderColor: "rgba(200, 0, 0, 0.8)",
          borderWidth: 1,
          pointRadius: 0,
          borderDash: [5, 5],
        },
      ],
    };
  }, [portfolioHistory, previousPortfolioBalance]);

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
        time: { tooltipFormat: "HH:mm:ss", timezone: "America/Chicago" },
        ticks: { maxTicksLimit: 6, fontSize: 10 },
      },
      y: {
        ticks: {
          fontSize: 10,
          callback: (value: any) => `$${value.toFixed(2)}`,
        },
      },
    },
  };

  const balanceColor =
    latestBalance < previousPortfolioBalance
      ? COLORS.red.negative
      : COLORS.green.positive;

  let change = latestBalance - previousPortfolioBalance;
  let changePercent =
    previousPortfolioBalance !== 0
      ? (change / previousPortfolioBalance) * 100
      : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%" /* Fill the container exactly */,
        padding: "15px" /* Consistent with terminal spacing */,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Data Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            fontSize: "1.25rem" /* Consistent with sidebar titles */,
            display: "flex",
            alignItems: "center",
            gap: "20px",
            letterSpacing: "0.05em",
          }}
        >
          <span style={{ color: COLORS.mainFontColor }}>
            TOTAL BALANCE:{" "}
            <span style={{ color: balanceColor, fontWeight: "bold" }}>
              $
              {latestBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </span>
          <span style={{ color: COLORS.mainFontColor }}>
            CASH:{" "}
            <span style={{ color: COLORS.mainFontColor, fontWeight: "bold" }}>
              $
              {latestCash.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </span>
        </div>

        {/* Performance Delta */}
        <div
          style={{
            color: balanceColor,
            fontSize: "12px",
            fontWeight: "900",
            fontFamily: "monospace",
          }}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)} | ({changePercent.toFixed(2)}%)
        </div>
      </div>

      {/* Chart Container - Forced to fill remaining vertical space */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Line
          options={{
            ...options,
            maintainAspectRatio: false /* Critical for filling flex space */,
            responsive: true,
          }}
          data={graphData}
        />
      </div>
    </div>
  );
};

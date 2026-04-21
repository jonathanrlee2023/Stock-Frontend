import React, { useState } from "react";
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
import "chartjs-adapter-date-fns";
import { COLORS } from "../constants/Colors";
import { useStockContext, BacktestPoint } from "./Contexts/StockContext"; // Import the types we made

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

interface BacktestGraphProps {
  setActiveCard: (query: string) => void;
}

export const BacktestGraphComponent: React.FC<BacktestGraphProps> = ({
  setActiveCard,
}) => {
  const { backtestPayload: data } = useStockContext();
  const [isExpanded, setIsExpanded] = useState(true); // Toggle state

  const graphData = React.useMemo(() => {
    // Process User (Strategy) Points
    const userPoints = data?.User.map((p: BacktestPoint) => ({
      x: new Date(p.datetime),
      y: p.Capital,
    }));

    // Process Benchmark Points
    const benchPoints = data?.Benchmark.map((p: BacktestPoint) => ({
      x: new Date(p.datetime),
      y: p.Capital,
    }));

    return {
      datasets: [
        {
          label: "STRATEGY_VALUATION",
          data: userPoints,
          borderColor: COLORS.green.positive, // Use a bright color for the user
          backgroundColor: "rgba(0, 255, 0, 0.1)",
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 0,
          fill: false,
        },
        {
          label: "BENCHMARK_SPY",
          data: benchPoints,
          borderColor: COLORS.infoTextColor, // Dim the benchmark
          borderDash: [5, 5], // Make it dashed to distinguish
          borderWidth: 1.5,
          tension: 0.1,
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  }, [data]);

  const options = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            color: COLORS.infoTextColor,
            font: { family: "monospace", size: 10 },
            boxWidth: 12,
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: COLORS.cardBackground,
          borderColor: COLORS.cardSoftBorder,
          borderWidth: 1,
          titleFont: { family: "monospace", weight: "bold" as const },
          bodyFont: { family: "monospace" },
          padding: 10,
          callbacks: {
            label: (context: any) =>
              ` ${context.dataset.label}: $${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          },
        },
      },
      scales: {
        x: {
          type: "time" as const,
          time: {
            unit: "month" as const,
            displayFormats: { month: "MMM yyyy" },
          },
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: {
            color: COLORS.infoTextColor,
            font: { family: "monospace", size: 10 },
          },
        },
        y: {
          type: "linear" as const,
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: {
            color: COLORS.infoTextColor,
            font: { family: "monospace", size: 10 },
            callback: (value: any) => `$${Number(value).toLocaleString()}`,
          },
        },
      },
    }),
    [],
  );

  if (!data || !data.User || data.User.length === 0) {
    return (
      <div
        style={{
          height: "94%",
          display: "flex",
          flexDirection: "column", // Stack button and text vertically
          alignItems: "flex-start", // Align to the left
          justifyContent: "flex-start", // Align to the top
          color: COLORS.infoTextColor,
          fontFamily: "monospace",
          fontSize: "12px",
          padding: "20px", // Adds breathing room from the edges
        }}
      >
        <button
          className="btn-sleek"
          onClick={() => setActiveCard("backtestSelection")}
          style={{
            padding: "2px 8px",
            fontSize: "0.7rem",
            border: "1px solid " + COLORS.borderColor,
            background: "transparent",
            cursor: "pointer",
            marginBottom: "10px", // Space between button and the text below
          }}
        >
          ← RETURN TO SELECTION
        </button>

        <div style={{ opacity: 0.8 }}>
          NO_BACKTEST_DATA_LOADED... [AWAITING_INPUT]
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "94%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "10px 20px",
          fontSize: "10px",
          color: COLORS.secondaryTextColor,
          fontFamily: "monospace",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn-sleek"
            onClick={() => setActiveCard("backtestSelection")}
            style={{
              padding: "2px 8px",
              fontSize: "0.7rem",
              border: "1px solid" + COLORS.borderColor,
              background: "transparent",
            }}
          >
            ←
          </button>
        </div>
        SYSTEM_BACKTEST_ANALYSIS // START:{" "}
        {data?.User?.[0]?.datetime &&
          new Date(data.User[0].datetime).toLocaleDateString()}
        // END: {/* END DATE */}
        {data?.User?.length > 0 &&
          new Date(
            data.User[data.User.length - 1].datetime,
          ).toLocaleDateString()}
      </div>

      <div
        style={{
          flex: 1,
          position: "relative",
          padding: "0 10px",
          minHeight: 0,
        }}
      >
        <Line data={graphData} options={options} />
      </div>

      <div
        style={{
          borderTop: `1px solid ${COLORS.cardSoftBorder}`,
          background: "#0a0a0a", // Slightly darker for the footer
          transition: "all 0.3s ease",
          flexShrink: 0, // CRITICAL: Prevents the footer from being pushed out of view
        }}
      >
        {/* TOGGLE BAR */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            padding: "8px 15px", // Increased padding for a better hit target
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            fontSize: "9px",
            color: COLORS.infoTextColor,
            fontFamily: "monospace",
            backgroundColor: "#111", // Distinct color so you can see the bar
            borderBottom: isExpanded
              ? `1px solid ${COLORS.cardSoftBorder}`
              : "none",
          }}
        >
          <span>STATISTICAL_METRICS_ENGINE</span>
          <span>
            {isExpanded ? "[ HIDE_DETAILS - ]" : "[ SHOW_DETAILS + ]"}
          </span>
        </div>

        {/* METRICS GRID (Collapsible) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            padding: isExpanded ? "15px" : "0px",
            maxHeight: isExpanded ? "200px" : "0px", // Use maxHeight for smoother transition
            overflow: "hidden",
            opacity: isExpanded ? 1 : 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Metric
            label="TOTAL_RETURN"
            value={`${data?.Stats?.performance?.total_return?.toFixed(2)}%`}
          />
          <Metric
            label="SHARPE_RATIO"
            value={data?.Stats?.performance?.sharpe?.toFixed(2)}
          />
          <Metric
            label="MAX_DRAWDOWN"
            value={`${data?.Stats?.risk?.max_drawdown?.toFixed(2)}%`}
          />

          {/* Optional: Add second row if expanded */}
          {isExpanded && (
            <>
              <div style={{ marginTop: "10px" }}>
                <Metric
                  label="CAGR"
                  value={`${data?.Stats?.performance?.cagr?.toFixed(2)}%`}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <Metric
                  label="VOLATILITY"
                  value={`${data?.Stats?.performance?.annualized_volatility?.toFixed(2)}%`}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <Metric
                  label="WIN_RATE"
                  value={`${(data?.Stats?.period_dynamics?.win_rate * 100).toFixed(1)}%`}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <Metric
                  label="SORTINO"
                  value={`${data?.Stats?.performance?.sortino?.toFixed(2)}%`}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <Metric
                  label="STANDARD_DEVIATION"
                  value={`${data?.Stats?.performance?.standard_deviation?.toFixed(2)}%`}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <Metric
                  label="PERIOD_MEAN_RETURN"
                  value={`${(data?.Stats?.performance?.period_mean_return * 100).toFixed(1)}%`}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        fontSize: "9px",
        color: COLORS.infoTextColor,
        fontFamily: "monospace",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: "14px",
        color: COLORS.mainFontColor,
        fontWeight: "bold",
        fontFamily: "monospace",
      }}
    >
      {value}
    </div>
  </div>
);

export default BacktestGraphComponent;

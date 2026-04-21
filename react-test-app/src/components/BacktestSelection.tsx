import React, { useState, useEffect, SetStateAction, Dispatch } from "react";
import { useStockContext } from "./Contexts/StockContext";
import { useWS } from "./Contexts/WSContest";
import { COLORS } from "../constants/Colors";

type BacktestSelectionProps = {
  setActiveCard: (query: string) => void;
  setWeights: Dispatch<SetStateAction<Record<string, number>>>;
  weights: Record<string, number>;
};

export const BacktestSelection: React.FC<BacktestSelectionProps> = ({
  setActiveCard,
  setWeights,
  weights,
}) => {
  const { clientID } = useWS();
  const [startDate, setStartDate] = useState("2023-01-01");
  const { stockPoints, updateBacktestPayload } = useStockContext();

  const calculateCash = () => {
    const otherWeightsTotal = Object.entries(weights)
      .filter(([ticker]) => ticker !== "Cash")
      .reduce((sum, [_, val]) => sum + val, 0);

    return Math.max(0, 1.0 - otherWeightsTotal);
  };

  const currentCash = calculateCash();

  const handleWeightChange = (ticker: string, value: string) => {
    const numValue = parseFloat(value) / 100; // Convert 50 to 0.5
    if (isNaN(numValue)) return;

    setWeights((prev) => ({
      ...prev,
      [ticker]: numValue,
    }));
  };

  const submitBacktest = async () => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(diffDays);
    weights = { ...weights, Cash: currentCash };
    const payload = {
      DaysAgo: diffDays, // You could add a DatePicker for this
      UserPortfolio: weights,
      BenchmarkPortfolio: { SPY: 1.0 },
      ClientID: clientID,
    };

    // Use your existing fetch logic redirected to your Go backtest endpoint
    await fetch(`http://localhost:8080/startBacktest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const StockWeightCard = ({ id }: { id: string }) => {
    const latestPrice =
      stockPoints[id]?.[stockPoints[id].length - 1]?.Mark || 0;
    const currentWeightPercent = (weights[id] || 0) * 100;

    return (
      <div
        className="portfolio-card"
        style={{ ...styles.card, position: "relative" }}
      >
        <div style={styles.cardHeader}>
          <span style={styles.tickerName}>{id}</span>
          <div style={styles.inputContainer}>
            <input
              type="number"
              value={currentWeightPercent}
              onChange={(e) => handleWeightChange(id, e.target.value)}
              style={styles.weightInput}
            />
            <span style={{ color: COLORS.mainFontColor }}>%</span>
          </div>
        </div>

        <div style={styles.cardPriceRow}>
          <span style={styles.priceLabel}>
            Last Price: ${latestPrice.toFixed(2)}
          </span>
        </div>

        {/* UPDATED DELETE BUTTON */}
        <button
          className="delete-btn"
          style={{
            position: "absolute",
            bottom: "10px", // Pinned to the bottom
            right: "10px", // Pinned to the right
            background: "none",
            border: "none",
            color: "#ff4444", // Bright Red
            fontSize: "12px",
            fontWeight: "bold",
            padding: "5px",
            cursor: "pointer",
            opacity: 0.7,
            fontFamily: "monospace",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          onClick={(e) => {
            e.stopPropagation();
            setWeights((prev) => {
              const newWeights = { ...prev };
              delete newWeights[id];
              return newWeights;
            });
          }}
        >
          [X]
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "94%",
        background: "#0d0d0d", // Darker slate for focus
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "20px 20px 0 20px", // Align with content padding
        }}
      >
        <div
          style={{
            fontSize: "15px",
            color: COLORS.infoTextColor,
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          BACKTEST_CONFIGURATION
        </div>

        <div style={{ width: "150px" }}>
          {" "}
          {/* Fixed width keeps it in the corner */}
          <label style={dateLabelStyle}>START_DATE</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              ...dateInputStyle,
              textAlign: "right", // Keeps text aligned to the right
              fontSize: "11px",
              padding: "4px 8px",
            }}
            className="custom-date-input"
          />
        </div>
      </div>
      <div
        className="custom-scrollbar"
        style={{ padding: "20px", overflowY: "auto", flex: 1 }}
      >
        <h4 style={styles.sectionHeader}>BACKTESTING_WEIGHTS</h4>

        {/* Filter out "Cash" so it doesn't render a card, then map the rest */}
        {Object.keys(weights)
          .filter((ticker) => ticker !== "Cash")
          .map((ticker) => (
            <StockWeightCard key={ticker} id={ticker} />
          ))}

        <button
          className="btn-sleek btn-outline"
          onClick={() => {
            setActiveCard("backtestStock");
          }}
          style={{ width: "100%", marginTop: "10px" }}
        >
          + ADD TICKER TO TEST
        </button>
      </div>

      <footer style={styles.footer}>
        <div style={styles.totalStats}>
          <span
            style={{
              color: COLORS.green.button,
            }}
          >
            TOTAL CASH: {(currentCash * 100).toFixed(0)}%
          </span>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn-sleek btn-outline-danger flex-grow-1"
            onClick={() => {
              setActiveCard("home");
              setWeights({});
            }}
          >
            CANCEL
          </button>
          <button
            className="btn-sleek flex-grow-1"
            style={{
              backgroundColor: COLORS.secondaryTextColor,
            }}
            onClick={() => {
              submitBacktest();
              updateBacktestPayload(null);
              setActiveCard("backtestGraph");
            }}
            disabled={currentCash === 1.0}
          >
            RUN BACKTEST
          </button>
        </div>
      </footer>
    </div>
  );
};

const dateInputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.03)", // Subtle depth
  border: `1px solid ${COLORS.borderColor}`,
  color: COLORS.mainFontColor,
  fontFamily: "monospace",
  fontSize: "11px",
  padding: "4px 8px",
  outline: "none",
  borderRadius: "2px",
  cursor: "pointer",
  colorScheme: "dark", // Ensures the browser's calendar popup is dark
  appearance: "none", // Removes default mobile styling
  textAlign: "right",
};

const dateLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "8px",
  color: COLORS.infoTextColor,
  marginBottom: "2px",
  fontFamily: "monospace",
  textAlign: "right",
  letterSpacing: "1px",
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#0d0d0d",
  },
  sectionHeader: {
    fontSize: "11px",
    color: COLORS.infoTextColor,
    marginBottom: "12px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
  },
  card: {
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: COLORS.cardBackground,
    marginBottom: "10px",
    border: `1px solid ${COLORS.borderColor}`,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tickerName: {
    fontSize: "16px",
    fontWeight: "700",
    color: COLORS.mainFontColor,
  },
  inputContainer: { display: "flex", alignItems: "center", gap: "5px" },
  weightInput: {
    background: "#1a1a1a",
    border: `1px solid ${COLORS.borderColor}`,
    color: COLORS.mainFontColor,
    width: "60px",
    padding: "5px",
    textAlign: "right",
    borderRadius: "4px",
  },
  cardPriceRow: { marginTop: "8px", fontSize: "12px" },
  priceLabel: { color: COLORS.infoTextColor },
  footer: {
    backgroundColor: COLORS.cardBackground,
    borderTop: `1px solid ${COLORS.borderColor}`,
    padding: "15px",
  },
  totalStats: {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "12px",
    fontWeight: "bold",
  },
} as const;

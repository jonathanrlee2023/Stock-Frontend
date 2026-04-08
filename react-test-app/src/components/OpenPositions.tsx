import React, { useEffect, useRef, useState } from "react";
import { useWS } from "./WSContest";
import { usePriceStream } from "./PriceContext";
import { get } from "http";

interface IdCardProps {
  setActiveID: (query: string) => void;
  setActiveCard: (query: string) => void;
  defaultMessage: string;
  activePortfolio: number;
}
interface OptionParts {
  ticker: string;
  month: string;
  day: string;
  year: string;
  type: string;
  strike: string;
}

export const ParseOptionId = (optionId: string): OptionParts | null => {
  if (optionId.length < 15) return null;

  // [A-Z]+ captures only letters, \s* consumes the OCC padding separately
  const regex = /^([A-Z]+)\s*(\d{2})(\d{2})(\d{2})([CP])(\d+)$/;
  const match = optionId.trim().match(regex);

  if (!match) return null;

  return {
    ticker: match[1], // "SPY" — no trailing spaces
    year: match[2],
    month: match[3],
    day: match[4],
    type: match[5],
    strike: String(parseInt(match[6]) / 1000),
  };
};

export const IdCards: React.FC<IdCardProps> = ({
  setActiveID,
  setActiveCard,
  defaultMessage,
  activePortfolio,
}) => {
  const { ids, setPreviousID } = useWS();
  const portfolioIds = ids[activePortfolio];
  const previousIdsRef = useRef<Record<string, number>>({});
  const {
    stockPoints,
    optionPoints,
    startStockStream,
    startOptionStream,
    historicalStockPoints,
  } = usePriceStream();
  useEffect(() => {
    previousIdsRef.current = portfolioIds; // just track the latest ids
  }, [ids]);

  const handleCardClick = (id: string) => {
    if (id.length > 6) {
      const optionParts = ParseOptionId(id);

      if (optionParts) {
        startOptionStream(
          optionParts.ticker,
          optionParts.strike,
          optionParts.day,
          optionParts.month,
          optionParts.year,
          optionParts.type,
        );
        setActiveCard("fixedOption");
      } else {
        console.error("Failed to parse option ID:", id);
        return; // Exit early if parsing fails
      }
    } else {
      startStockStream(id);
      setPreviousID(id);
      setActiveCard("fixedStock");
    }

    setActiveID(id);
  };
  const getLatestPrice = (id: string): string => {
    if (id.length > 6) {
      const points = optionPoints[id];
      if (!points || points.length === 0) {
        return "Loading...";
      }
      const latestPoint = points.at(-1);
      return latestPoint ? `$${latestPoint.Mark.toFixed(2)}` : "N/A";
    } else {
      const points = stockPoints[id];
      if (!points || points.length === 0) {
        return "Loading...";
      }
      const latestPoint = points.at(-1);
      return latestPoint ? `$${latestPoint.Mark.toFixed(2)}` : "N/A";
    }
  };

  const priceColor = (id: string): string => {
    const points = id.length > 6 ? optionPoints[id] : stockPoints[id];
    if (!points || points.length < 2) return "#ffffff"; // Default color
    const latest = points.at(-1)?.Mark || 0;
    const previous = historicalStockPoints[id]?.at(-1)?.close || 0;
    if (latest > previous) return "rgba(0, 150, 0, 0.8)";
    if (latest < previous) return "rgba(150, 0, 0, 0.8)";
    return "#ffffff"; // Default color
  };

  const formatDisplayId = (id: string): string => {
    const parts = ParseOptionId(id);
    if (!parts) return id; // plain stock, show as-is

    const typeFull = parts.type === "C" ? "Call" : "Put";
    const fullYear = `20${parts.year}`;
    return `${parts.ticker} $${parts.strike} ${typeFull} ${parts.month}/${parts.day}/${fullYear}`;
  };

  const isOption = (id: string): boolean => ParseOptionId(id) !== null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px" /* Tight gap for a "list" feel rather than "card" feel */,
        padding: "0",
        maxHeight: "100%",
        overflowY: "auto",
        backgroundColor: "#000000",
      }}
    >
      {Object.keys(ids).length === 0 ? (
        <div
          style={{
            color: "#444",
            padding: "24px",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            textAlign: "center",
          }}
        >
          {defaultMessage}
        </div>
      ) : (
        Object.entries(portfolioIds).map(([id, amount]) => (
          <div
            key={id}
            onClick={() => handleCardClick(id)}
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: "#050505",
              borderBottom: "1px solid #1a1a1a" /* Thin separator */,
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#111")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#050505")
            }
          >
            {/* Ticker / ID Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  color: "#ffffff" /* Brighter for readability */,
                  fontFamily: "monospace",
                }}
              >
                {formatDisplayId(id)}
              </span>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  color: priceColor(id) /* Accent color for price */,
                  fontFamily: "monospace",
                }}
              >
                {getLatestPrice(id)}
              </span>
            </div>

            {/* Holdings Info Row */}
            <div
              style={{
                fontSize: "0.7rem",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {isOption(id) ? "CONTRACTS" : "SHARES"}: {amount}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

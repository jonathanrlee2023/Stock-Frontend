import React, { useEffect, useRef, useState } from "react";
import { useWS } from "./Contexts/WSContest";
import { useStockContext } from "./Contexts/StockContext";
import { useOptionContext } from "./Contexts/OptionContext";
import { useStreamActionsContext } from "./Contexts/StreamActionsContext";
import { COLORS } from "../constants/Colors";
import { ParseOptionId } from "./BackendCom";

interface IdCardProps {
  setActiveID: (query: string) => void;
  setActiveCard: (query: string) => void;
  setActiveStock: (query: string) => void;
  defaultMessage: string;
  activePortfolio: number;
}

export const IdCards: React.FC<IdCardProps> = ({
  setActiveID,
  setActiveStock,
  setActiveCard,
  defaultMessage,
  activePortfolio,
}) => {
  const { ids, setPreviousID, clientID } = useWS();
  const portfolioIds = ids[activePortfolio];
  const previousIdsRef = useRef<Record<string, number>>({});
  const { stockPoints, historicalStockPoints } = useStockContext();
  const { optionPoints } = useOptionContext();
  const { startStockStream, startOptionStream } = useStreamActionsContext();
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
          clientID,
        );
        setActiveCard("fixedOption");
        setActiveID(id);
      } else {
        console.error("Failed to parse option ID:", id);
        return; // Exit early if parsing fails
      }
    } else {
      startStockStream(id, clientID, "Yes");
      setPreviousID(id);
      setActiveCard("fixedStock");
      setActiveStock(id);
    }
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
    if (!points || points.length < 2) return COLORS.mainFontColor; // Default color
    const latest = points.at(-1)?.Mark || 0;
    const previous = historicalStockPoints[id]?.at(-1)?.close || 0;
    if (latest > previous) return COLORS.green.positive;
    if (latest < previous) return COLORS.red.negative;
    return COLORS.mainFontColor; // Default color
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
              backgroundColor: COLORS.dynamic.background,
              borderBottom: "1px solid " + COLORS.dynamic.bottomBorder,
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.dynamic.hover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                COLORS.dynamic.background)
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
                  color: COLORS.mainFontColor /* Brighter for readability */,
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
                color: COLORS.infoTextColor,
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

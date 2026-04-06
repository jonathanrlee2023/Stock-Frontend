import React, { useEffect, useRef, useState } from "react";
import { useWS } from "./WSContest";
import { usePriceStream } from "./PriceContext";

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
  const { stockPoints, optionPoints, startStockStream, startOptionStream } =
    usePriceStream();
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
        gap: "12px",
        padding: "0 16px",
        maxHeight: "100%",
        overflowY: "auto",
      }}
    >
      {Object.keys(ids).length === 0 ? (
        // 2. Return the fallback UI
        <div
          style={{
            color: "#666",
            padding: "16px",
            fontStyle: "italic",
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
            className="position-card"
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#919191",
                marginBottom: "4px",
              }}
            >
              {formatDisplayId(id)}
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#919191",
              }}
            >
              {getLatestPrice(id)}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#666",
              }}
            >
              {isOption(id) ? "Contracts" : "Shares"}: {amount}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

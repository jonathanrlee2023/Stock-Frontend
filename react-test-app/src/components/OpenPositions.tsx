import React, { useEffect, useRef, useState } from "react";
import { useWS } from "./WSContest";
import { usePriceStream } from "./PriceContext";

interface IdCardProps {
  setActiveID: (query: string) => void;
  setActiveCard: (query: string) => void;
  defaultMessage: string;
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
  // Standard option format: TICKER + YYMMDD + C/P + Strike
  // Example: AAPL250117C00150000 = AAPL, 25, 01, 17, C, 00150000

  const cleanId = optionId.trim();

  // Check if it's long enough to be an option (at least ticker + 6 date + 1 type + strike)
  if (optionId.length < 15) {
    return null;
  }

  // Find where the date part starts (after the ticker, before the 6-digit date)
  // The date is always YYMMDD (6 digits) followed by C or P
  const regex = /^([A-Z\s]+)(\d{2})(\d{2})(\d{2})([CP])(\d+)$/;
  const match = cleanId.match(regex);

  if (!match) {
    return null;
  }

  return {
    ticker: match[1], // e.g., "AAPL"
    year: match[2], // e.g., "25" (2025)
    month: match[3], // e.g., "01" (January)
    day: match[4], // e.g., "17"
    type: match[5], // e.g., "C" (Call) or "P" (Put)
    strike: String(parseInt(match[6]) / 1000), // e.g., "00150000" (150.00)
  };
};

export const IdCards: React.FC<IdCardProps> = ({
  setActiveID,
  setActiveCard,
  defaultMessage,
}) => {
  const { ids, setPreviousID } = useWS();
  const previousIdsRef = useRef<Record<string, number>>({});
  const { stockPoints, startStockStream, startOptionStream } = usePriceStream();
  useEffect(() => {
    previousIdsRef.current = ids; // just track the latest ids
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
    const points = stockPoints[id];
    if (!points || points.length === 0) {
      return "Loading...";
    }
    const latestPoint = points.at(-1);
    return latestPoint ? `$${latestPoint.Mark.toFixed(2)}` : "N/A";
  };

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
        Object.entries(ids).map(([id, amount]) => (
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
              {id}
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
              {id.length <= 6 ? "Shares" : "Contracts"}: {amount}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

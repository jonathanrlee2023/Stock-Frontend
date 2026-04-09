import React, { useEffect, useRef, useState } from "react";
import { useWS } from "./WSContest";
import { OptionExpiration, usePriceStream } from "./PriceContext";
import { COLORS } from "../constants/Colors";

interface OptionExpirationCardsProps {
  setActiveID: (query: string) => void;
  setActiveCard: (query: string) => void;
  stock: string;
  defaultMessage: string;
  optionExpirations: Record<string, OptionExpiration>;
  prevCard: string;
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
  const cleanId = optionId.trim();
  const regex = /^([A-Z]+)\s*(\d{2})(\d{2})(\d{2})([CP])(\d+)$/;
  const match = cleanId.match(regex);

  if (!match) return null;

  return {
    ticker: match[1],
    year: match[2],
    month: match[3],
    day: match[4],
    type: match[5],
    strike: String(parseInt(match[6]) / 1000),
  };
};

export const formatFriendlyId = (id: string): string => {
  const parts = ParseOptionId(id);
  if (!parts) return id; // Fallback to raw ID if parsing fails

  // Convert YY to 20YY
  const fullYear = `20${parts.year}`;
  const typeFull = parts.type === "C" ? "Call" : "Put";

  // Format: "$180 NVDA Call Expiring 02/20/2026"
  return `$${parts.strike} ${parts.ticker} ${typeFull} Expiring ${parts.month}/${parts.day}/${fullYear}`;
};

export const OptionExpirationCards: React.FC<OptionExpirationCardsProps> = ({
  setActiveID,
  setActiveCard,
  stock,
  defaultMessage,
  optionExpirations,
  prevCard,
}) => {
  const { optionPoints, startOptionStream } = usePriceStream();
  const { previousCard, setPreviousCard } = useWS();
  const [filter, setFilter] = useState<"CALL" | "PUT">("CALL");

  const handleCardClick = (id: string) => {
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
      setActiveID(id);
      setPreviousCard(prevCard);
    } else {
      console.error("Failed to parse option ID:", id);
    }
  };

  const getLatestPrice = (id: string): string => {
    const points = optionPoints[id];
    if (!points || points.length === 0) return "Loading...";
    const latestPoint = points.at(-1);
    return latestPoint ? `$${latestPoint.Mark.toFixed(2)}` : "N/A";
  };

  const filteredExpirations = Object.entries(optionExpirations).filter(
    ([ticker]) => ticker.toUpperCase() === stock.toUpperCase(),
  );

  const OptionCard = ({
    id,
    label,
    price,
    onClick,
  }: {
    id: string;
    label: string;
    price: string;
    onClick: (id: string) => void;
  }) => {
    const friendlyName = formatFriendlyId(id);
    const isCall = label === "CALL";
    const accentColor = isCall ? COLORS.green.positive : COLORS.red.negative;

    return (
      <div
        onClick={() => onClick(id)}
        className="position-card"
        style={{
          cursor: "pointer",
          padding: "12px",
          borderRadius: "0px", // Sharp terminal edge
          backgroundColor: COLORS.cardBackground,
          border: "1px solid " + COLORS.cardSoftBorder,
          borderLeft: `3px solid ${accentColor}`,
          transition: "all 0.1s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.dynamic.hover;
          e.currentTarget.style.borderColor = COLORS.dynamic.bottomBorder;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.dynamic.background;
          e.currentTarget.style.borderColor = COLORS.dynamic.bottomBorder;
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: "700",
            color: COLORS.mainFontColor,
            fontFamily: "monospace",
            letterSpacing: "0.5px",
          }}
        >
          {/* Using a monospace font for the ID/Name looks cleaner */}
          {friendlyName || id}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: "900",
              color: accentColor,
              letterSpacing: "1px",
              backgroundColor: `${accentColor}15`, // Very faint glow background
              padding: "1px 4px",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: "700",
              color: COLORS.mainFontColor,
              fontFamily: "monospace",
            }}
          >
            {price}
          </span>
        </div>
      </div>
    );
  };

  // Main List Component
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: COLORS.appBackground,
      }}
    >
      {/* Filter Header */}
      <div
        style={{
          display: "flex",
          gap: "1px", // Grid-line gap
          padding: "8px",
          background: COLORS.cardBackground,
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: `1px solid ${COLORS.cardSoftBorder}`,
        }}
      >
        {(["CALL", "PUT"] as const).map((f) => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "0px",
                border: `1px solid ${isActive ? COLORS.borderColor : "transparent"}`,
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: "bold",
                letterSpacing: "1px",
                backgroundColor: isActive
                  ? COLORS.cardBackground
                  : "transparent",
                color: isActive ? COLORS.mainFontColor : COLORS.infoTextColor,
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = COLORS.dynamic.hover;
                  e.currentTarget.style.color = COLORS.mainFontColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = COLORS.infoTextColor;
                }
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Scrollable List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px", // Tighter gap for list view
          padding: "12px",
          overflowY: "auto",
        }}
      >
        {filteredExpirations.length === 0 ? (
          <div
            style={{
              color: COLORS.infoTextColor,
              padding: "20px",
              fontSize: "11px",
              fontFamily: "monospace",
              textAlign: "center",
            }}
          >
            NO_DATA_RETURNED
          </div>
        ) : (
          filteredExpirations.map(([ticker, expirationData]) => (
            <React.Fragment key={ticker}>
              <div
                style={{
                  color: COLORS.secondaryTextColor,
                  fontSize: "9px",
                  fontWeight: "bold",
                  marginTop: "12px",
                  marginBottom: "4px",
                  letterSpacing: "2px",
                  fontFamily: "monospace",
                }}
              >
                {ticker.toUpperCase()} // OPTIONS
              </div>

              {filter === "CALL" &&
                expirationData.Call.map((id) => (
                  <OptionCard
                    key={id}
                    id={id}
                    label="CALL"
                    price={getLatestPrice(id)}
                    onClick={handleCardClick}
                  />
                ))}

              {filter === "PUT" &&
                expirationData.Put.map((id) => (
                  <OptionCard
                    key={id}
                    id={id}
                    label="PUT"
                    price={getLatestPrice(id)}
                    onClick={handleCardClick}
                  />
                ))}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

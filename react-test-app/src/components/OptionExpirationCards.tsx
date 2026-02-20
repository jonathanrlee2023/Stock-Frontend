import React, { useEffect, useRef, useState } from "react";
import { useWS } from "./WSContest";
import { OptionExpiration, usePriceStream } from "./PriceContext";

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

  const formatFriendlyId = (id: string): string => {
    const parts = ParseOptionId(id);
    if (!parts) return id; // Fallback to raw ID if parsing fails

    // Convert YY to 20YY
    const fullYear = `20${parts.year}`;
    const typeFull = parts.type === "C" ? "Call" : "Put";

    // Format: "$180 NVDA Call Expiring 02/20/2026"
    return `$${parts.strike} ${parts.ticker} ${typeFull} Expiring ${parts.month}/${parts.day}/${fullYear}`;
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
    // Parse the ID for the display string
    const friendlyName = formatFriendlyId(id);

    return (
      <div
        onClick={() => onClick(id)}
        className="position-card"
        style={{
          cursor: "pointer",
          padding: "10px",
          borderRadius: "6px",
          backgroundColor: "#242424",
          borderLeft:
            label === "CALL" ? "4px solid #00ff88" : "4px solid #ff4444",
          transition: "transform 0.1s",
        }}
        // Optional: adds a little feedback on hover
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#2a2a2a")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#242424")
        }
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#e0e0e0",
            lineHeight: "1.4",
          }}
        >
          {friendlyName}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "6px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: "800",
              color: label === "CALL" ? "#00ff88" : "#ff4444",
              letterSpacing: "0.5px",
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>
            {price}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Filter Button Group */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
          background: "#1a1a1a",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {(["CALL", "PUT"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1,
              padding: "6px 0",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              backgroundColor: filter === f ? "#444" : "#2a2a2a",
              color: filter === f ? "#fff" : "#919191",
              transition: "all 0.2s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "0 16px 16px 16px",
          overflowY: "auto",
        }}
      >
        {/* Fix: filteredExpirations is an array, so use .length */}
        {filteredExpirations.length === 0 ? (
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
          /* Fix: Removed the extra curly braces that were causing the syntax error */
          filteredExpirations.map(([ticker, expirationData]) => (
            <React.Fragment key={ticker}>
              <div
                style={{
                  color: "#777",
                  fontSize: "11px",
                  fontWeight: "bold",
                  marginTop: "8px",
                  letterSpacing: "1px",
                }}
              >
                {ticker.toUpperCase()}
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

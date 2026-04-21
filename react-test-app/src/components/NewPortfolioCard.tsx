import React, { Dispatch, SetStateAction } from "react";
import { Position } from "./Contexts/StreamActionsContext";
import { useStockContext } from "./Contexts/StockContext";
import { useWS } from "./Contexts/WSContest";
import { COLORS } from "../constants/Colors";

interface NewPortfolioCardProps {
  setActiveCard: (query: string) => void;
  setFixedID: (query: string) => void;
  setNewStocks: Dispatch<SetStateAction<Record<string, Position>>>;
  setActivePortfolio: (id: number) => void;
  setTempPortfolioName: Dispatch<SetStateAction<string>>;
  newStocks: Record<string, Position>;
  activePortfolio: number;
  tempPortfolioName: string;
}

const PostData = async (
  PID: number,
  name: string,
  clientID: string,
  positions: Position[],
) => {
  const data = {
    id: PID,
    name: name,
    clientID: clientID,
    positions: positions,
  };

  try {
    const response = await fetch(`http://localhost:8080/newPortfolio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.text();
    console.log("Server response:", result);
  } catch (error) {
    console.error("POST request failed:", error);
  }
};

export const NewPortfolioCard: React.FC<NewPortfolioCardProps> = ({
  setActiveCard,
  setFixedID,
  setNewStocks,
  setActivePortfolio,
  setTempPortfolioName,
  newStocks,
  activePortfolio,
  tempPortfolioName,
}) => {
  const { stockPoints } = useStockContext();
  const { ids, clientID } = useWS();
  const portfolioIds = ids[activePortfolio];
  const tickerSymbols = Object.keys(portfolioIds);
  const newTickerSymbols = Object.keys(newStocks);

  const StockCard = ({
    id,
    isStaged,
    onClick,
  }: {
    id: string;
    isStaged: boolean;
    onClick: (id: string) => void;
  }) => {
    const latestPrice = stockPoints[id][stockPoints[id].length - 1]?.Mark || 0;
    const shares = portfolioIds[id] || 0;
    return (
      <div
        onClick={() => onClick(id)}
        className="portfolio-card"
        style={{
          cursor: "pointer",
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: COLORS.cardBackground,
          borderLeft: "4px solid " + COLORS.green.button,
          marginBottom: "10px",
          // 1. Added smooth transition for transform and shadow
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          border: isStaged
            ? "1px solid " + COLORS.secondaryTextColor
            : "1px solid " + COLORS.borderColor,
          boxShadow: isStaged ? "0 0 10px rgba(126, 124, 243, 0.1)" : "none",
        }}
        onMouseEnter={(e) => {
          // 3. Apply the "Pop" effect
          e.currentTarget.style.transform = "scale(1.005) translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          // 4. Reset to original state
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: COLORS.mainFontColor,
            }}
          >
            {id}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "10px",
                color: COLORS.infoTextColor,
                fontWeight: "800",
              }}
            >
              Price:
            </span>
            <span
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: COLORS.mainFontColor,
              }}
            >
              $
              {latestPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "right",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: COLORS.infoTextColor,
                fontWeight: "800",
              }}
            >
              Shares:
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: COLORS.infoTextColor,
              }}
            >
              {newStocks[id].amount}
            </span>
          </div>
        </div>
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
      {/* --- Header: Dynamic Title --- */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid " + COLORS.borderColor,
          backgroundColor: COLORS.cardBackground,
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: COLORS.secondaryTextColor,
            fontWeight: "900",
            marginBottom: "4px",
          }}
        >
          {tempPortfolioName
            ? "EDITING CONFIGURATION"
            : "INITIAL PORTFOLIO SETUP"}
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "1.2rem",
            color: COLORS.mainFontColor,
            fontWeight: "700",
          }}
        >
          {tempPortfolioName || "Unnamed Portfolio"}
        </h2>
      </div>

      <div
        style={{
          padding: "20px",
          backgroundColor: COLORS.cardBackground,
          borderBottom: "1px solid " + COLORS.cardSoftBorder,
        }}
      >
        <label
          style={{
            fontSize: "10px",
            color: COLORS.infoTextColor,
            fontWeight: "800",
            display: "block",
            marginBottom: "8px",
          }}
        >
          PORTFOLIO_NAME
        </label>
        <input
          type="text"
          placeholder="e.g. GAMMA_NEUTRAL_HEDGE"
          value={tempPortfolioName}
          onChange={(e) => setTempPortfolioName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "4px",
            background: COLORS.appBackground,
            border: "1px solid " + COLORS.borderColor,
            color: COLORS.mainFontColor, // Terminal green input
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.9rem",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = COLORS.secondaryTextColor)
          }
          onBlur={(e) => (e.target.style.borderColor = COLORS.borderColor)}
        />
      </div>

      <div
        className="custom-scrollbar"
        style={{ padding: "20px", overflowY: "auto", flex: 1 }}
      >
        {/* Existing Assets Section */}
        {tickerSymbols.length > 0 && (
          <section className="mb-4">
            <h4
              style={{
                fontSize: "11px",
                color: COLORS.infoTextColor,
                marginBottom: "12px",
                borderBottom: "1px solid " + COLORS.borderColor,
              }}
            >
              EXISTING_POSITIONS
            </h4>
            {tickerSymbols.map((id) => (
              <StockCard
                key={id}
                id={id}
                isStaged={false}
                onClick={() => {
                  setActiveCard("stock");
                  setFixedID(id);
                }}
              />
            ))}
          </section>
        )}

        {/* New Assets (Staged) Section */}
        <section>
          <h4
            style={{
              fontSize: "11px",
              color: COLORS.secondaryTextColor,
              marginBottom: "12px",
              borderBottom: "1px solid " + COLORS.borderColor,
            }}
          >
            STAGED_FOR_COMMIT
          </h4>
          {newTickerSymbols.length === 0 ? (
            <div
              style={{
                color: COLORS.borderColor,
                textAlign: "center",
                fontSize: "0.8rem",
                padding: "20px",
                border: "1px dashed " + COLORS.cardSoftBorder,
              }}
            >
              NO NEW ASSETS SELECTED
            </div>
          ) : (
            newTickerSymbols.map((id) => (
              <StockCard
                key={id}
                id={id}
                isStaged={true}
                onClick={() => {
                  setActiveCard("stock");
                  setFixedID(id);
                }}
              />
            ))
          )}
        </section>
      </div>

      {/* --- Footer Controls --- */}
      <footer
        className="d-flex gap-2 p-3"
        style={{
          backgroundColor: COLORS.cardBackground,
          borderTop: "1px solid " + COLORS.borderColor,
        }}
      >
        <button
          className="btn-sleek btn-outline-danger flex-grow-1"
          style={{ padding: "10px" }}
          onClick={() => {
            setNewStocks({});
            setActivePortfolio(1);
            setActiveCard("home");
          }}
        >
          ABORT
        </button>

        <button
          className="btn-sleek btn-outline flex-grow-1"
          style={{ padding: "10px" }}
          onClick={() => setActiveCard("stockToPortfolio")}
        >
          + ADD TICKER
        </button>

        <button
          className="btn-sleek flex-grow-1"
          style={{
            padding: "10px",
            backgroundColor: COLORS.secondaryTextColor,
            color: COLORS.mainFontColor,
          }}
          onClick={() => {
            const positionsArray = Object.values(newStocks);
            PostData(
              activePortfolio,
              tempPortfolioName,
              clientID,
              positionsArray,
            );
            // ... rest of your save logic
            setActiveCard("home");
          }}
        >
          COMMIT CHANGES
        </button>
      </footer>
    </div>
  );
};

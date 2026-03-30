import React from "react";
import { usePriceStream } from "./PriceContext";

interface PortfolioCardsProps {
  setActiveCard: (query: string) => void;
  setActivePortfolio: (id: number) => void;
  activePortfolio: number;
}

export const PortfolioCards: React.FC<PortfolioCardsProps> = ({
  setActiveCard,
  setActivePortfolio,
  activePortfolio,
}) => {
  const { balancePoints } = usePriceStream();

  // Get unique portfolio IDs from the balancePoints record
  const portfolioIds = Object.keys(balancePoints).map(Number);

  const PortfolioCard = ({
    id,
    balance,
    cash,
    isActive,
    onClick,
  }: {
    id: number;
    balance: number;
    cash: number;
    isActive: boolean;
    onClick: (id: number) => void;
  }) => {
    return (
      <div
        onClick={() => onClick(id)}
        className="portfolio-card"
        style={{
          cursor: "pointer",
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: isActive ? "#2a2a2a" : "#1e1e1e",
          borderLeft: isActive ? "4px solid #00ff88" : "4px solid #444",
          border: isActive ? "1px solid #333" : "1px solid transparent",
          marginBottom: "10px",
          // 1. Added smooth transition for transform and shadow
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          // 2. Initial shadow (flat)
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
        onMouseEnter={(e) => {
          // 3. Apply the "Pop" effect
          e.currentTarget.style.transform = "scale(1.005) translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
          if (!isActive) e.currentTarget.style.backgroundColor = "#242424";
        }}
        onMouseLeave={(e) => {
          // 4. Reset to original state
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
          if (!isActive) e.currentTarget.style.backgroundColor = "#1e1e1e";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>
            Portfolio #{id}
          </div>
          <div
            style={{ fontSize: "11px", fontWeight: "600", color: "#00ff88" }}
          >
            ACTIVE
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
              style={{ fontSize: "10px", color: "#888", fontWeight: "800" }}
            >
              TOTAL BALANCE
            </span>
            <span
              style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}
            >
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
              style={{ fontSize: "10px", color: "#888", fontWeight: "800" }}
            >
              AVAILABLE CASH
            </span>
            <span
              style={{ fontSize: "13px", fontWeight: "600", color: "#bbb" }}
            >
              ${cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
        height: "100%",
        background: "#363636",
      }}
    >
      <div style={{ padding: "16px", borderBottom: "1px solid #222" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            color: "#fff",
            letterSpacing: "0.5px",
          }}
        >
          Portfolios ({portfolioIds.length})
        </h3>
      </div>

      <div
        className="d-flex flex-column mb-10"
        style={{ padding: "16px", overflowY: "auto", flex: 1 }}
      >
        {portfolioIds.length === 0 ? (
          <div
            style={{
              color: "#666",
              textAlign: "center",
              fontStyle: "italic",
              marginTop: "20px",
            }}
          >
            No portfolios found...
          </div>
        ) : (
          portfolioIds.map((id) => {
            // Get the most recent balance point for this portfolio
            const points = balancePoints[id] || [];
            const latest =
              points.length > 0
                ? points[points.length - 1]
                : { Balance: 0, Cash: 0 };

            return (
              <PortfolioCard
                key={id}
                id={id}
                balance={latest.Balance}
                cash={latest.Cash}
                isActive={activePortfolio === id}
                onClick={() => {
                  setActivePortfolio(id);
                  setActiveCard("home");
                }}
              />
            );
          })
        )}
      </div>
      <div
        className="d-flex justify-content-center mb-15 mt-5"
        style={{ paddingBottom: "16px" }}
      >
        <button
          className="btn-sleek mx-2"
          onClick={() => setActiveCard("newPortfolioCard")}
        >
          Create New Portfolio
        </button>
      </div>
    </div>
  );
};

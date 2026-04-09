import React, { useCallback } from "react";
import { usePriceStream } from "./PriceContext";
import { useWS } from "./WSContest";
import { COLORS } from "../constants/Colors";

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
  const { ids, setIds, setPortfolioNames } = useWS();
  const { portfolioNames } = useWS();
  console.log("Rendering PortfolioCards with portfolios:", portfolioNames);

  const portfolioIds = Object.keys(portfolioNames).map(Number);

  // 2. Keep this for your "Create" logic
  const lastPortfolioId =
    portfolioIds.length > 0 ? Math.max(...portfolioIds) : 0;

  const deletePortfolio = useCallback(
    async (pid: number) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const baseUrl = "http://localhost:8080";
        const response = await fetch(`${baseUrl}/deletePortfolio?id=${pid}`, {
          method: "DELETE",
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.error(`Deletion of Portfolio ${pid} timed out`);
        } else {
          console.error("API error:", err);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [setIds, setPortfolioNames],
  );

  const PortfolioCard = ({
    id,
    balance,
    isActive,
    onClick,
  }: {
    id: number;
    balance: number;
    isActive: boolean;
    onClick: (id: number) => void;
  }) => {
    return (
      <div
        onClick={() => onClick(id)}
        className={`portfolio-card ${isActive ? "active" : ""}`}
        style={{
          cursor: "pointer",
          padding: "12px",
          borderRadius: "4px",
          backgroundColor: isActive ? COLORS.dynamic.hover : "transparent",
          border: isActive
            ? "1px solid " + COLORS.borderColor
            : "1px solid transparent",
          borderLeft: isActive
            ? "3px solid " + COLORS.secondaryTextColor
            : "3px solid" + COLORS.borderColor,
          marginBottom: "8px",
          transition: "all 0.15s ease",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = COLORS.dynamic.hover;
          } else {
            e.currentTarget.style.backgroundColor = COLORS.borderColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = "transparent";
          } else {
            e.currentTarget.style.backgroundColor = COLORS.dynamic.hover;
          }
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: COLORS.mainFontColor,
              }}
            >
              {portfolioNames[id] || `SYS_PORTFOLIO_${id}`}
            </span>
            <span
              style={{
                fontSize: "10px",
                color: COLORS.infoTextColor,
                marginTop: "2px",
              }}
            >
              ID: {id.toString().padStart(4, "0")}
            </span>
          </div>

          {/* Active Status Pulse */}
          {isActive && (
            <div className="status-indicator">
              <span
                style={{
                  fontSize: "8px",
                  color: COLORS.secondaryTextColor,
                  fontWeight: "900",
                }}
              >
                ● LIVE
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 d-flex justify-content-between align-items-end">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "9px",
                color: COLORS.infoTextColor,
                fontWeight: "800",
              }}
            >
              EQUITY
            </span>
            <span
              style={{
                fontSize: "14px",
                fontFamily: "monospace",
                fontWeight: "700",
                color: isActive ? COLORS.green.positive : COLORS.mainFontColor,
              }}
            >
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Delete only shows on inactive cards to prevent "Self-Delete" bugs */}
          {!isActive && (
            <button
              className="delete-btn"
              style={{
                background: "none",
                border: "none",
                color: COLORS.infoTextColor,
                fontSize: "10px",
                padding: "0",
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Your existing delete logic here
              }}
            >
              ×
            </button>
          )}
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
        background: "#0a0a0a", // Deeper black for sidebar contrast
        borderRight: "1px solid #222",
      }}
    >
      {/* --- Header Section --- */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #222",
          backgroundColor: "#0f0f0f",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: COLORS.infoTextColor,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            fontWeight: "800",
          }}
        >
          Portfolios{" "}
          <span style={{ color: COLORS.secondaryTextColor }}>
            [{portfolioIds.length}]
          </span>
        </h3>
      </div>

      {/* --- Scrollable List Section --- */}
      <div
        className="custom-scrollbar"
        style={{
          padding: "12px",
          overflowY: "auto",
          flex: 1,
          backgroundColor: COLORS.cardBackground,
        }}
      >
        {portfolioIds.length === 0 ? (
          <div
            style={{
              color: COLORS.infoTextColor,
              textAlign: "center",
              fontSize: "0.8rem",
              marginTop: "40px",
            }}
          >
            NO PORTFOLIOS INITIALIZED
          </div>
        ) : (
          portfolioIds.map((id) => {
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

      {/* --- Action Section --- */}
      <div
        className="p-3"
        style={{
          borderTop: `1px solid ${COLORS.cardSoftBorder}`,
          backgroundColor: COLORS.cardBackground,
        }}
      >
        <button
          className="btn-sleek w-100 py-2"
          style={{
            fontSize: "0.7rem",
            fontWeight: "bold",
            letterSpacing: "1px",
            backgroundColor: COLORS.cardBackground,
            border: "1px solid" + COLORS.borderColor,
          }}
          onClick={() => {
            const nextId = (lastPortfolioId || 0) + 1;
            setActiveCard("newPortfolio");
            setActivePortfolio(nextId);
            setIds((prevIds) => ({ ...prevIds, [nextId]: {} }));
          }}
        >
          + NEW PORTFOLIO
        </button>
      </div>
    </div>
  );
};

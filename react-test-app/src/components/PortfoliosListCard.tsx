import React, { useCallback } from "react";
import { usePriceStream } from "./PriceContext";
import { useWS } from "./WSContest";

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

  const portfolioIds = Object.keys(ids).map(Number);

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
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          position: "relative",
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
            {portfolioNames[id] || `Portfolio ${id}`}
          </div>
          {isActive && (
            <div
              style={{ fontSize: "11px", fontWeight: "600", color: "#00ff88" }}
            >
              ACTIVE
            </div>
          )}
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

          <button
            className="btn-sleek btn-sleek-red"
            style={{
              padding: "4px 8px",
              fontSize: "10px",
              alignSelf: "flex-end",
            }}
            onClick={(e) => {
              e.stopPropagation();

              setIds((prevIds) => {
                const { [id]: _, ...rest } = prevIds;
                return rest;
              });

              setPortfolioNames((prevNames) => {
                const { [id]: _, ...rest } = prevNames;
                return rest;
              });

              deletePortfolio(id);
            }}
          >
            Delete
          </button>
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
          onClick={() => {
            const nextId = (lastPortfolioId || 0) + 1;
            setActiveCard("newPortfolio");
            setActivePortfolio(lastPortfolioId + 1);
            setIds((prevIds) => ({
              ...prevIds,
              [nextId]: {},
            }));
          }}
        >
          Create New Portfolio
        </button>
      </div>
    </div>
  );
};

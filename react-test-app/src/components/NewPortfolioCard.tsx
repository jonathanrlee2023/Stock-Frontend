import React, { Dispatch, SetStateAction, useState } from "react";
import { usePriceStream, Position } from "./PriceContext";
import { useWS } from "./WSContest";

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

const PostData = async (PID: number, name: string, positions: Position[]) => {
  const data = { id: PID, name: name, positions: positions };

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
  const { stockPoints } = usePriceStream();
  const { ids, setIds, setPortfolioNames } = useWS();
  const portfolioIds = ids[activePortfolio];
  const tickerSymbols = Object.keys(portfolioIds);
  const newTickerSymbols = Object.keys(newStocks);

  const StockCard = ({
    id,
    onClick,
  }: {
    id: string;
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
          backgroundColor: "#2a2a2a",
          borderLeft: "4px solid #00ff88",
          border: "1px solid #333",
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
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>
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
              style={{ fontSize: "10px", color: "#888", fontWeight: "800" }}
            >
              Price:
            </span>
            <span
              style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}
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
              style={{ fontSize: "10px", color: "#888", fontWeight: "800" }}
            >
              Shares:
            </span>
            <span
              style={{ fontSize: "13px", fontWeight: "600", color: "#bbb" }}
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
          {tempPortfolioName ? tempPortfolioName : "New Portfolio"}
        </h3>
      </div>
      <div style={{ padding: "16px", borderBottom: "1px solid #222" }}>
        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "14px",
            color: "#888",
            textTransform: "uppercase",
          }}
        >
          Portfolio Configuration
        </h3>
        <input
          type="text"
          placeholder="Enter Portfolio Name (e.g. Tech Growth)"
          value={tempPortfolioName}
          onChange={(e) => setTempPortfolioName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            background: "#222",
            border: "1px solid #444",
            color: "#fff",
            fontSize: "16px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#00ff88")}
          onBlur={(e) => (e.target.style.borderColor = "#444")}
        />
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
            No open stocks
          </div>
        ) : (
          tickerSymbols.map((id) => {
            return (
              <StockCard
                key={id}
                id={id}
                onClick={() => {
                  setActiveCard("stock");
                  setFixedID(id);
                }}
              />
            );
          })
        )}
        {newTickerSymbols.length === 0 ? (
          <div
            style={{
              color: "#666",
              textAlign: "center",
              fontStyle: "italic",
              marginTop: "20px",
            }}
          >
            No new stocks
          </div>
        ) : (
          newTickerSymbols.map((id) => {
            return (
              <StockCard
                key={id}
                id={id}
                onClick={() => {
                  setActiveCard("stock");
                  setFixedID(id);
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
          className="btn-sleek btn-sleek-red mx-2"
          onClick={() => {
            setNewStocks({});
            setActivePortfolio(1);
            setActiveCard("home");
          }}
        >
          Cancel
        </button>
        <button
          className="btn-sleek mx-2"
          onClick={() => setActiveCard("stockToPortfolio")}
        >
          Add New Stock
        </button>
        <button
          className="btn-sleek mx-2"
          onClick={() => {
            const positionsArray: Position[] = Object.values(newStocks);
            PostData(activePortfolio, tempPortfolioName, positionsArray);
            setPortfolioNames((prevNames) => ({
              ...prevNames,
              [activePortfolio]: tempPortfolioName,
            }));
            if (Object.keys(newStocks).length !== 0) {
              setIds((prevIds) => {
                const updatedPortfolio = {
                  ...(prevIds[activePortfolio] || {}),
                };

                // Loop through new stocks and add their values to the existing ones
                Object.entries(newStocks).forEach(([ticker, count]) => {
                  updatedPortfolio[ticker] =
                    (updatedPortfolio[ticker] || 0) + count.amount;
                });

                return {
                  ...prevIds,
                  [activePortfolio]: updatedPortfolio,
                };
              });
              setNewStocks({});
            }
            setActiveCard("home");
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

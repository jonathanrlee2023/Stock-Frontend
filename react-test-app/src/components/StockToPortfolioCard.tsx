import { Dispatch, SetStateAction, useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { useStockContext } from "./Contexts/StockContext";
import { useBalanceContext } from "./Contexts/BalanceContext";
import { useOptionContext } from "./Contexts/OptionContext";
import {
  Position,
  useStreamActionsContext,
} from "./Contexts/StreamActionsContext";
import { useWS } from "./Contexts/WSContest";
import { COLORS } from "../constants/Colors";

interface StockCardProps {
  setActiveCard: (query: string) => void;
  setNewStocks: Dispatch<SetStateAction<Record<string, Position>>>;
  activeCard: string;
  activePortfolio: number;
}

export const StockToPortfolioCard: React.FC<StockCardProps> = ({
  setActiveCard,
  activeCard,
  setNewStocks,
  activePortfolio,
}) => {
  const { ids, previousID, setPreviousID } = useWS();
  const [amount, setAmount] = useState<number>(0);
  const [dollarValue, setDollarValue] = useState<number>(0); // Cash

  const [activeStock, setActiveStock] = useState<string>(previousID || ""); // Persistent state for search query
  const { stockPoints } = useStockContext();
  const { balancePoints } = useBalanceContext();
  const { startStockStream } = useStreamActionsContext();

  const latestMark =
    stockPoints[activeStock]?.[stockPoints[activeStock].length - 1]?.Mark || 0;

  const portfolioHistory = balancePoints[activePortfolio] || [];
  const currentShares = ids[activePortfolio]?.[activeStock] ?? 0;

  const latestCash =
    portfolioHistory.length > 0
      ? portfolioHistory[portfolioHistory.length - 1].Cash
      : 0;

  const ModifyTracker = async (action: string) => {
    let data: { id: string } = { id: "" };
    data.id = activeStock || "";

    try {
      const response = await fetch(`http://localhost:8080/${action}`, {
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
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = Number(e.target.value);
    setAmount(val);
    // Calculate dollar value: Shares * Price
    setDollarValue(Number((val * latestMark).toFixed(2)));
  };

  // Handler for Dollar changes
  const handleDollarChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = Number(e.target.value);
    setDollarValue(val);
    // Calculate shares: Cash / Price (Check for division by zero)
    const calculatedShares = latestMark > 0 ? val / latestMark : 0;
    setAmount(Number(calculatedShares.toFixed(5))); // High precision for shares
  };
  const inputStyle = {
    backgroundColor: COLORS.appBackground,
    border: "1px solid " + COLORS.borderColor,
    color: COLORS.mainFontColor,
    fontSize: "0.9rem",
    padding: "4px 8px",
    width: "120px",
    outline: "none",
    fontFamily: "monospace",
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "94vh", // Maintain full screen
        backgroundColor: COLORS.appBackground,
        color: COLORS.mainFontColor,
        overflow: "hidden",
      }}
    >
      {/* --- Navigation Bar --- */}
      <header
        className="p-2 d-flex align-items-center justify-content-between"
        style={{ borderBottom: "1px solid " + COLORS.borderColor }}
      >
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setActiveCard("newPortfolio")}
          style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
        >
          ← BACK TO CONFIG
        </button>
        <div
          style={{
            fontSize: "0.75rem",
            color: COLORS.infoTextColor,
            fontFamily: "monospace",
            marginRight: "12px",
          }}
        >
          ACTIVE SESSION: {activeStock || "NULL"}
        </div>
      </header>

      {/* --- Main Execution Area --- */}
      <main className="flex-grow-1 d-flex p-3 gap-3" style={{ minHeight: 0 }}>
        {/* Chart & Stream Section */}
        <div
          className="flex-grow-1 d-flex flex-column gap-2"
          style={{ minWidth: 0 }}
        >
          <SearchBar
            setSearchQuery={setActiveStock}
            searchQuery={activeStock}
            inputMessage="SYMBOL (e.g. NVDA)"
            onEnter={startStockStream}
            onSearchClick={startStockStream}
            setPreviousID={setPreviousID}
          />

          <div
            className="flex-grow-1 rounded"
            style={{
              backgroundColor: COLORS.cardBackground,
              border: "1px solid " + COLORS.borderColor,
              minHeight: 0, // CRITICAL: allows the flex item to shrink smaller than its content
              position: "relative", // Helps absolute-positioned charts stay inside
            }}
          >
            <TodayStockWSComponent
              stockSymbol={activeStock}
              setActiveCard={setActiveCard}
              activeCard={activeCard}
              activePortfolio={activePortfolio}
            />
          </div>

          {/* --- Trading Controls Panel --- */}
          <div
            className="p-3 mt-2 rounded"
            style={{
              backgroundColor: COLORS.cardBackground,
              border: "1px solid " + COLORS.borderColor,
            }}
          >
            <div className="d-flex align-items-end justify-content-between">
              {/* Input Group */}
              <div className="d-flex gap-4">
                <div className="d-flex flex-column gap-1">
                  <label
                    style={{
                      fontSize: "10px",
                      color: COLORS.infoTextColor,
                      fontWeight: "800",
                    }}
                  >
                    SHARES
                  </label>
                  <input
                    className="terminal-input"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    style={inputStyle}
                  />
                </div>

                <div className="d-flex flex-column gap-1">
                  <label
                    style={{
                      fontSize: "10px",
                      color: COLORS.infoTextColor,
                      fontWeight: "800",
                    }}
                  >
                    TOTAL VALUE ($)
                  </label>
                  <input
                    className="terminal-input"
                    type="number"
                    value={dollarValue}
                    onChange={handleDollarChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Live Data Summary */}
              <div className="text-end" style={{ fontFamily: "monospace" }}>
                <div style={{ fontSize: "10px", color: COLORS.infoTextColor }}>
                  CURRENT HOLDINGS
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    color: COLORS.secondaryTextColor,
                    fontWeight: "bold",
                  }}
                >
                  {currentShares ?? 0}{" "}
                  <small style={{ fontSize: "0.6rem" }}>SHRS</small>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="btn-sleek btn-sleek-green px-4 py-2"
                disabled={latestMark <= 0 || amount <= 0}
                style={{
                  opacity: latestMark <= 0 || amount <= 0 ? 0.4 : 1,
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                }}
                onClick={() => {
                  setNewStocks((prev) => {
                    const existing = prev[activeStock] || {
                      id: activeStock,
                      amount: 0,
                      price: 0,
                      portfolio_id: activePortfolio,
                    };
                    return {
                      ...prev,
                      [activeStock]: {
                        ...existing,
                        amount: existing.amount + amount,
                      },
                    };
                  });
                  ModifyTracker("newTracker");
                  setActiveCard("newPortfolio");
                }}
              >
                ADD POSITION
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockToPortfolioCard;

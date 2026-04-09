import { useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { usePriceStream } from "./PriceContext";
import { OptionExpirationCards } from "./OptionExpirationCards";
import { useWS } from "./WSContest";
import { postData } from "./OptionGraph";
import { COLORS } from "../constants/Colors";

interface StockCardProps {
  setActiveCard: (query: string) => void;
  setFixedID: (query: string) => void;
  activeCard: string;
  activePortfolio: number;
}

export const StockCard: React.FC<StockCardProps> = ({
  setActiveCard,
  setFixedID,
  activeCard,
  activePortfolio,
}) => {
  const { ids, setIds, setTrackers, previousID, setPreviousID } = useWS();
  const [amount, setAmount] = useState<number>(0);
  const [dollarValue, setDollarValue] = useState<number>(0); // Cash

  const [activeStock, setActiveStock] = useState<string>(previousID || ""); // Persistent state for search query
  const { optionExpirations, startStockStream, balancePoints, stockPoints } =
    usePriceStream();

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
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "94%" /* Fills space below header */,
        width: "100%",
        backgroundColor: COLORS.appBackground,
        padding: "0 20px 15px 20px",
        marginTop: "10px" /* Consistent gap with HomePage */,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Main content area */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "20px",
          overflow: "hidden",
        }}
      >
        {/* Left side - Chart & Trade Controls */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <SearchBar
              setSearchQuery={setActiveStock}
              searchQuery={activeStock}
              inputMessage="TICKER_LOOKUP..."
              onEnter={startStockStream}
              onSearchClick={startStockStream}
              setPreviousID={setPreviousID}
            />
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              border: "1px solid " + COLORS.cardSoftBorder,
              borderRadius: "4px",
              marginBottom: "15px",
            }}
          >
            <TodayStockWSComponent
              stockSymbol={activeStock}
              setActiveCard={setActiveCard}
              activeCard={activeCard}
              activePortfolio={activePortfolio}
            />
          </div>

          {/* Execution Terminal Area */}
          <div
            className="d-flex justify-content-between align-items-center p-3"
            style={{
              background: COLORS.cardBackground,
              border: "1px solid " + COLORS.borderColor,
              borderRadius: "4px",
            }}
          >
            <div className="d-flex align-items-center gap-4">
              <div className="d-flex flex-column">
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: COLORS.infoTextColor,
                    marginBottom: "4px",
                  }}
                >
                  SHARES
                </span>
                <input
                  className="search-bar"
                  type="number"
                  value={amount}
                  min={0}
                  onChange={handleAmountChange}
                  style={{
                    width: "80px",
                    textAlign: "center",
                    borderBottom: "1px solid " + COLORS.borderColor,
                  }}
                />
              </div>
              <div className="d-flex flex-column">
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: COLORS.infoTextColor,
                    marginBottom: "4px",
                  }}
                >
                  TOTAL_VAL
                </span>
                <input
                  className="search-bar"
                  type="number"
                  value={dollarValue}
                  min={0}
                  onChange={handleDollarChange}
                  style={{
                    width: "100px",
                    textAlign: "center",
                    borderBottom: "1px solid " + COLORS.borderColor,
                  }}
                />
              </div>
              <div className="d-flex flex-column">
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: COLORS.infoTextColor,
                    marginBottom: "4px",
                  }}
                >
                  OPEN_POS
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: COLORS.mainFontColor,
                  }}
                >
                  {currentShares ?? 0}
                </span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn-sleek btn-sleek-green"
                onClick={() => {
                  postData(
                    "openPosition",
                    activeStock,
                    latestMark,
                    amount,
                    activePortfolio,
                  );
                  ModifyTracker("newTracker");
                  setIds((prev) => {
                    const nextState = { ...prev };

                    if (!nextState[activePortfolio]) {
                      nextState[activePortfolio] = {};
                    }

                    const currentShares =
                      nextState[activePortfolio][activeStock] ?? 0;
                    nextState[activePortfolio] = {
                      ...nextState[activePortfolio],
                      [activeStock]: currentShares + amount,
                    };

                    return nextState;
                  });
                }}
                disabled={
                  latestMark <= 0 ||
                  amount * latestMark > latestCash ||
                  amount <= 0
                }
              >
                BUY
              </button>
              <button
                className="btn-sleek btn-sleek-red"
                onClick={() => {
                  postData(
                    "closePosition",
                    activeStock,
                    latestMark,
                    amount,
                    activePortfolio,
                  );
                  setIds((prev) => {
                    const updated = { ...prev };

                    if (!updated[activePortfolio]) return prev;

                    const currentAmount =
                      updated[activePortfolio][activeStock] ?? 0;
                    const newAmount = currentAmount - amount;

                    if (newAmount <= 0) {
                      delete updated[activePortfolio][activeStock];
                    } else {
                      updated[activePortfolio][activeStock] = newAmount;
                    }

                    return updated;
                  });
                }}
                disabled={
                  latestMark <= 0 || amount <= 0 || amount > currentShares
                }
              >
                SELL
              </button>
              <button
                className="btn-sleek btn-sleek-red"
                onClick={() => {
                  postData(
                    "closePosition",
                    activeStock,
                    latestMark,
                    currentShares,
                    activePortfolio,
                  );
                  setIds((prev) => {
                    const updated = { ...prev };

                    if (updated[activePortfolio]) {
                      const newPortfolio = { ...updated[activePortfolio] };
                      delete newPortfolio[activeStock];
                      updated[activePortfolio] = newPortfolio;
                    }

                    return updated;
                  });
                }}
                disabled={latestMark <= 0 || currentShares <= 0}
              >
                LIQUIDATE
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Options Sidebar */}
        <div
          style={{
            width: "300px",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              color: COLORS.secondaryTextColor,
              letterSpacing: "0.2em",
              marginBottom: "10px",
              paddingLeft: "5px",
              textTransform: "uppercase",
            }}
          >
            Options Chain
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              background: COLORS.cardBackground,
              border: `1px solid ${COLORS.cardSoftBorder}`,
              borderRadius: "4px",
            }}
          >
            <OptionExpirationCards
              setActiveCard={setActiveCard}
              setActiveID={setFixedID}
              stock={activeStock}
              defaultMessage="INITIALIZING_CHAIN..."
              optionExpirations={optionExpirations}
              prevCard="stock"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;

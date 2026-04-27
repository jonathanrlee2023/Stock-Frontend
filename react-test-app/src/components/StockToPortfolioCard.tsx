import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { useStockContext } from "./Contexts/StockContext";
import { useBalanceContext } from "./Contexts/BalanceContext";
import {
  Position,
  useStreamActionsContext,
} from "./Contexts/StreamActionsContext";
import { useWS } from "./Contexts/WSContest";
import { COLORS } from "../constants/Colors";
import { ModifyTracker } from "./BackendCom";

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
  const { ids, previousID, setPreviousID, clientID } = useWS();
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
  const totalAccountValue =
    portfolioHistory.length > 0
      ? portfolioHistory[portfolioHistory.length - 1].Balance
      : 10000;

  const latestCash =
    portfolioHistory.length > 0
      ? portfolioHistory[portfolioHistory.length - 1].Cash
      : 0;

  const [portfolioPercentage, setPortfolioPercentage] = useState<number>(
    currentShares > 0
      ? ((latestMark * currentShares) / totalAccountValue) * 100
      : 0,
  );
  const currentPortfolioPct =
    totalAccountValue > 0
      ? ((currentShares * latestMark) / totalAccountValue) * 100
      : 0;

  // The CHANGE in percentage based on the current input values
  const orderImpactPct =
    totalAccountValue > 0 ? (dollarValue / totalAccountValue) * 100 : 0;

  // Helper for the UI to show the "Target" state
  const targetPortfolioPct = currentPortfolioPct + orderImpactPct;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = Number(e.target.value);
    const newDollars = val * latestMark;
    setAmount(val);
    // Calculate dollar value: Shares * Price
    setDollarValue(Number(newDollars.toFixed(2)));
    setPortfolioPercentage(
      Number(((newDollars / totalAccountValue) * 100).toFixed(2)),
    );
  };

  // Handler for Dollar changes
  const handleDollarChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = Number(e.target.value);
    setDollarValue(val);
    // Calculate shares: Cash / Price (Check for division by zero)
    const calculatedShares = latestMark > 0 ? val / latestMark : 0;
    setAmount(Number(calculatedShares.toFixed(5))); // High precision for shares
    setPortfolioPercentage(
      Number(((val / totalAccountValue) * 100).toFixed(2)),
    );
  };

  useEffect(() => {
    setAmount(0);
    setDollarValue(0);
    setPortfolioPercentage(0);
  }, [activeStock]);

  const handlePortfolioPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const targetPctChange = Number(e.target.value);
    setPortfolioPercentage(targetPctChange);

    // Calculate order size based on the desired % increase/decrease
    const targetDollars = totalAccountValue * (targetPctChange / 100);
    setDollarValue(Number(targetDollars.toFixed(2)));
    setAmount(
      latestMark > 0 ? Number((targetDollars / latestMark).toFixed(5)) : 0,
    );
  };

  const isInteracting = useRef(false);
  useEffect(() => {
    // 3. PRICE SYNC: Only update siblings if user isn't actively changing them
    if (!isInteracting.current && latestMark > 0) {
      const newDollars = amount * latestMark;
      setDollarValue(Number(newDollars.toFixed(2)));
      setPortfolioPercentage(
        Number(((newDollars / totalAccountValue) * 100).toFixed(2)),
      );
    }
  }, [latestMark, totalAccountValue]);
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
            getOptionsData={"No"}
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
                <div className="d-flex flex-column">
                  <span
                    style={{ fontSize: "0.6rem", color: COLORS.infoTextColor }}
                  >
                    ORDER_SHARES
                  </span>
                  <input
                    className="search-bar"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    onFocus={() => (isInteracting.current = true)}
                    onBlur={() => (isInteracting.current = false)}
                    style={{
                      width: "80px",
                      textAlign: "center",
                      borderBottom: `1px solid ${COLORS.borderColor}`,
                    }}
                  />
                </div>

                {/* DOLLAR INPUT */}
                <div className="d-flex flex-column">
                  <span
                    style={{ fontSize: "0.6rem", color: COLORS.infoTextColor }}
                  >
                    ORDER_VALUE
                  </span>
                  <input
                    className="search-bar"
                    type="number"
                    value={dollarValue}
                    onChange={handleDollarChange}
                    onFocus={() => (isInteracting.current = true)}
                    onBlur={() => (isInteracting.current = false)}
                    style={{
                      width: "100px",
                      textAlign: "center",
                      borderBottom: `1px solid ${COLORS.borderColor}`,
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
                    ORDER_BY_%
                  </span>
                  <input
                    className="search-bar"
                    type="number"
                    step="0.1" // Allows for fine-tuning like 1.5%
                    value={portfolioPercentage}
                    onFocus={() => (isInteracting.current = true)}
                    onBlur={() => (isInteracting.current = false)}
                    onChange={handlePortfolioPercentageChange} // <--- USE IT HERE
                    style={{
                      width: "100px",
                      textAlign: "center",
                      borderBottom: "1px solid " + COLORS.borderColor,
                    }}
                  />
                </div>

                {/* PERCENTAGE IMPACT DISPLAY */}
                <div className="d-flex flex-column">
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: COLORS.infoTextColor,
                      marginBottom: "4px",
                    }}
                  >
                    PORTFOLIO_IMPACT
                  </span>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      minHeight: "31px", // Keep the vertical height consistent with inputs
                      display: "flex",
                      alignItems: "center", // Vertically centers the text and arrow
                      paddingBottom: "2px", // Tiny nudge for baseline alignment
                    }}
                  >
                    {/* Current Position Weight */}
                    <span
                      style={{
                        color:
                          currentShares > 0
                            ? COLORS.mainFontColor
                            : COLORS.infoTextColor,
                      }}
                    >
                      {currentPortfolioPct.toFixed(2)}%
                    </span>

                    {/* Transition Arrow */}
                    <span
                      style={{ margin: "0 8px", color: COLORS.infoTextColor }}
                    >
                      →
                    </span>

                    {/* Projected Weight */}
                    <span
                      style={{
                        color:
                          amount > 0
                            ? COLORS.green.button
                            : COLORS.mainFontColor,
                      }}
                    >
                      {targetPortfolioPct.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="d-flex flex-column">
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: COLORS.infoTextColor,
                      marginBottom: "4px",
                    }}
                  >
                    TOTAL_POS_VAL
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      color:
                        currentShares > 0
                          ? COLORS.mainFontColor
                          : COLORS.infoTextColor,
                      minHeight: "31px", // Matches standard input height
                      display: "flex",
                      alignItems: "center",
                      paddingBottom: "2px", // Baseline adjustment
                    }}
                  >
                    {currentShares > 0
                      ? `$${(currentShares * latestMark).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : "$0.00"}
                  </span>
                </div>

                {/* Open Positions */}
                <div className="d-flex flex-column">
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: COLORS.infoTextColor,
                      marginBottom: "4px",
                    }}
                  >
                    OPEN_POSITIONS
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      color: COLORS.mainFontColor,
                      minHeight: "31px",
                      display: "flex",
                      alignItems: "center",
                      paddingBottom: "2px",
                    }}
                  >
                    {currentShares ?? 0}
                  </span>
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
                      client_id: clientID,
                    };
                    return {
                      ...prev,
                      [activeStock]: {
                        ...existing,
                        amount: existing.amount + amount,
                      },
                    };
                  });
                  ModifyTracker("newTracker", activeStock);
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

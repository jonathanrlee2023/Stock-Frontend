import { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { useStockContext } from "./Contexts/StockContext";
import { useBalanceContext } from "./Contexts/BalanceContext";
import { useOptionContext } from "./Contexts/OptionContext";
import { useStreamActionsContext } from "./Contexts/StreamActionsContext";
import { OptionExpirationCards } from "./OptionExpirationCards";
import { useWS } from "./Contexts/WSContest";
import { postData, ModifyTracker } from "./BackendCom";
import { COLORS } from "../constants/Colors";

interface StockCardProps {
  setActiveCard: (query: string) => void;
  setFixedID: (query: string) => void;
  setActiveStock: (query: string) => void;
  activeCard: string;
  activePortfolio: number;
  activeStock: string;
}

export const StockCard: React.FC<StockCardProps> = ({
  setActiveCard,
  setFixedID,
  setActiveStock,
  activeCard,
  activePortfolio,
  activeStock,
}) => {
  const { ids, setIds, clientID, setPreviousID } = useWS();
  const [amount, setAmount] = useState<number>(0);
  const [dollarValue, setDollarValue] = useState<number>(0); // Cash
  const { stockPoints } = useStockContext();
  const { optionExpirations } = useOptionContext();
  const { balancePoints } = useBalanceContext();
  const { startStockStream } = useStreamActionsContext();

  const latestMark =
    stockPoints[activeStock]?.[stockPoints[activeStock].length - 1]?.Mark || 0;

  const portfolioHistory = balancePoints[activePortfolio] || [];
  const currentShares = ids[activePortfolio]?.[activeStock] ?? 0;
  const totalAccountValue =
    portfolioHistory.length > 0
      ? portfolioHistory[portfolioHistory.length - 1].Balance
      : 0;
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
              getOptionsData={"Yes"}
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
                  style={{ fontSize: "0.6rem", color: COLORS.infoTextColor }}
                >
                  PORTFOLIO_IMPACT
                </span>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: COLORS.mainFontColor,
                  }}
                >
                  {/* Shows current % -> projected % */}
                  <span style={{ color: COLORS.secondaryTextColor }}>
                    {currentPortfolioPct.toFixed(2)}%
                  </span>
                  <span
                    style={{ margin: "0 8px", color: COLORS.infoTextColor }}
                  >
                    →
                  </span>
                  <span
                    style={{
                      color:
                        amount > 0 ? COLORS.green.button : COLORS.mainFontColor,
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
                  Total Position Value
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color:
                      currentShares > 0
                        ? COLORS.mainFontColor
                        : COLORS.infoTextColor, // Dim the color if 0
                  }}
                >
                  {currentShares > 0
                    ? `$${(currentShares * latestMark).toFixed(2)}`
                    : "$0.00"}
                </span>
              </div>
              <div className="d-flex flex-column">
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: COLORS.infoTextColor,
                    marginBottom: "4px",
                  }}
                >
                  Open Positions
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
                    clientID,
                  );
                  ModifyTracker("newTracker", activeStock);
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
                    clientID,
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
                    clientID,
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

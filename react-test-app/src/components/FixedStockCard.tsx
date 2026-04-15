import { useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { useOptionContext } from "./Contexts/OptionContext";
import { useStreamActionsContext } from "./Contexts/StreamActionsContext";
import { useStockContext } from "./Contexts/StockContext";
import { useWS } from "./Contexts/WSContest";
import { OptionExpirationCards } from "./OptionExpirationCards";
import { postData } from "./OptionGraph";
import { COLORS } from "../constants/Colors";
import { useBalanceContext } from "./Contexts/BalanceContext";
interface FixedStockCardProps {
  setActiveCard: (query: string) => void;
  setFixedID: (query: string) => void;
  activeCard: string;
  activePortfolio: number;
}

export const StockCard: React.FC<FixedStockCardProps> = ({
  setActiveCard,
  setFixedID,
  activeCard,
  activePortfolio,
}) => {
  const { ids, setIds, setTrackers, previousID, setPreviousID } = useWS();
  const [amount, setAmount] = useState<number>(0);
  const [dollarValue, setDollarValue] = useState<number>(0); // Cash

  const [activeStock, setActiveStock] = useState<string>(previousID || ""); // Persistent state for search query
  const { stockPoints } = useStockContext();
  const { optionExpirations } = useOptionContext();
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
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "95%", // Use full height
        backgroundColor: "#000",
        color: COLORS.mainFontColor,
        overflow: "hidden",
      }}
    >
      {/* --- Navigation Bar --- */}
      <header
        className="p-2 d-flex align-items-center"
        style={{ borderBottom: "1px solid #1a1a1a" }}
      >
        <button
          className="btn-sleek"
          onClick={() => setActiveCard("home")}
          style={{ fontSize: "0.7rem", padding: "4px 12px" }}
        >
          ← TERMINAL_EXIT
        </button>
        <div
          className="ms-auto"
          style={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: COLORS.infoTextColor,
            marginRight: "12px",
          }}
        >
          ACTIVE_TICKER:{" "}
          <span style={{ color: COLORS.secondaryTextColor }}>
            {activeStock}
          </span>
        </div>
      </header>

      {/* --- Main Dashboard Area --- */}
      <div
        className="d-flex flex-grow-1 p-3 gap-3"
        style={{ minHeight: 0, overflow: "hidden" }}
      >
        {/* LEFT: Chart & Trading Panel */}
        <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
          {/* Chart Viewport */}
          <div
            className="flex-grow-1 rounded-sm"
            style={{
              backgroundColor: COLORS.cardBackground,
              border: `1px solid ${COLORS.cardSoftBorder}`,
              minHeight: 0,
            }}
          >
            <TodayStockWSComponent
              stockSymbol={activeStock}
              setActiveCard={setActiveCard}
              activeCard={activeCard}
              activePortfolio={activePortfolio}
            />
          </div>

          {/* Trade Execution Bar */}
          <div
            className="mt-3 p-3"
            style={{
              backgroundColor: COLORS.cardBackground,
              border: `1px solid ${COLORS.cardSoftBorder}`,
            }}
          >
            <div className="d-flex align-items-end justify-content-between">
              <div className="d-flex gap-4">
                {/* Shares Input */}
                <div className="d-flex flex-column gap-1">
                  <label
                    style={{
                      fontSize: "9px",
                      color: COLORS.infoTextColor,
                      fontWeight: "800",
                    }}
                  >
                    QUANTITY
                  </label>
                  <input
                    className="terminal-input"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    style={{
                      width: "90px",
                      backgroundColor: COLORS.appBackground,
                      border: `1px solid ${COLORS.borderColor}`,
                      color: COLORS.mainFontColor,
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                {/* Dollar Value Input */}
                <div className="d-flex flex-column gap-1">
                  <label
                    style={{
                      fontSize: "9px",
                      color: COLORS.infoTextColor,
                      fontWeight: "800",
                    }}
                  >
                    EST_TOTAL_VALUE ($)
                  </label>
                  <input
                    className="terminal-input"
                    type="number"
                    value={dollarValue}
                    onChange={handleDollarChange}
                    style={{
                      width: "120px",
                      backgroundColor: COLORS.appBackground,
                      border: `1px solid ${COLORS.borderColor}`,
                      color: COLORS.mainFontColor,
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                {/* Holdings Info */}
                <div className="d-flex flex-column justify-content-end pb-1">
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: COLORS.infoTextColor,
                      fontFamily: "monospace",
                    }}
                  >
                    OPEN_POSITION:{" "}
                    <span style={{ color: COLORS.mainFontColor }}>
                      {currentShares ?? 0}
                    </span>{" "}
                    SHRS
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
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
                  OPEN_LONG
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
                  CLOSE_POS
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
        </div>

        {/* RIGHT: Options List */}
        <aside
          style={{
            width: "300px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: COLORS.cardBackground,
            border: `1px solid ${COLORS.cardSoftBorder}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              letterSpacing: "2px",
              color: COLORS.infoTextColor,
              fontWeight: "bold",
              padding: "12px 16px",
              borderBottom: `1px solid ${COLORS.cardSoftBorder}`,
            }}
          >
            CHAIN_EXPIRATIONS
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px",
            }}
          >
            <OptionExpirationCards
              setActiveCard={setActiveCard}
              setActiveID={setFixedID}
              stock={activeStock}
              defaultMessage="FETCHING_DATA..."
              optionExpirations={optionExpirations}
              prevCard="fixedStock"
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StockCard;

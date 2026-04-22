import { Dispatch, SetStateAction, useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { useStockContext } from "./Contexts/StockContext";
import { useStreamActionsContext } from "./Contexts/StreamActionsContext";
import { useWS } from "./Contexts/WSContest";
import { COLORS } from "../constants/Colors";

interface StockCardProps {
  setActiveCard: (query: string) => void;
  weight: Record<string, number>;
  setWeight: Dispatch<SetStateAction<Record<string, number>>>;
  activeCard: string;
}

export const StockToPortfolioCard: React.FC<StockCardProps> = ({
  setActiveCard,
  weight,
  setWeight,
  activeCard,
}) => {
  const { previousID, setPreviousID } = useWS();
  const [activeStock, setActiveStock] = useState<string>(previousID || ""); // Persistent state for search query
  const { stockPoints } = useStockContext();
  const { startStockStream } = useStreamActionsContext();

  const latestMark =
    stockPoints[activeStock]?.[stockPoints[activeStock].length - 1]?.Mark || 0;

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = Number(e.target.value);
    if (isNaN(val)) return;

    setWeight((prev) => ({
      ...prev,
      [activeStock]: val, // Store as decimal (e.g., 0.20)
    }));
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
          onClick={() => setActiveCard("backtestSelection")}
          style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
        >
          ← BACK TO SELECTION
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
                <div className="d-flex flex-column gap-1">
                  <label
                    style={{
                      fontSize: "10px",
                      color: COLORS.infoTextColor,
                      fontWeight: "800",
                    }}
                  >
                    WEIGHTING (AS A DECIMAL)
                  </label>
                  <input
                    className="terminal-input"
                    type="number"
                    value={weight[activeStock] || 0}
                    onChange={handleWeightChange}
                    style={inputStyle}
                  />
                </div>
              </div>
              {/* Action Button */}
              <button
                className="btn-sleek btn-sleek-green px-4 py-2"
                disabled={latestMark <= 0}
                style={{
                  opacity: latestMark <= 0 ? 0.5 : 1,
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                }}
                onClick={() => {
                  setActiveCard("backtestSelection");
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

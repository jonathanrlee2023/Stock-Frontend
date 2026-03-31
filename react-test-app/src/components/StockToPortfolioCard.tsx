import { Dispatch, SetStateAction, useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { Position, usePriceStream } from "./PriceContext";
import { OptionExpirationCards } from "./OptionExpirationCards";
import { useWS } from "./WSContest";

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
  const { startStockStream, balancePoints, stockPoints } = usePriceStream();

  const latestMark =
    stockPoints[activeStock]?.[stockPoints[activeStock].length - 1]?.Mark || 0;

  const portfolioHistory = balancePoints[activePortfolio] || [];
  const currentShares = ids[activePortfolio][activeStock] || 0;

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
        height: "98vh",
        gap: "10px",
      }}
    >
      <button
        className="btn btn-secondary"
        onClick={() => setActiveCard("newPortfolio")}
      >
        Back
      </button>
      {/* Main content area with graph and positions side by side */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "16px",
          overflow: "hidden",
          padding: "0 10px",
        }}
      >
        {/* Left side - Graph/Main content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <SearchBar
            setSearchQuery={setActiveStock}
            searchQuery={activeStock}
            inputMessage="Enter Stock Symbol..."
            onEnter={startStockStream}
            onSearchClick={startStockStream}
            setPreviousID={setPreviousID}
          />
          <TodayStockWSComponent
            stockSymbol={activeStock}
            setActiveCard={setActiveCard}
            activeCard={activeCard}
            activePortfolio={activePortfolio}
          />
          <div className="d-flex justify-content-between align-items-center mb-2 mx-2">
            {/* Left Side: Position Actions */}
            <div
              className="mb-2 mx-2"
              style={{ display: "flex", alignItems: "center", gap: "20px" }}
            >
              <label>
                Shares:{" "}
                <input
                  className="search-bar input-small"
                  type="number"
                  value={amount}
                  min={0}
                  step="any"
                  onChange={handleAmountChange}
                  style={{
                    paddingLeft: "5px",
                    paddingRight: "25px",
                    textAlign: "center",
                  }}
                />
              </label>
              <label>
                Total $:{" "}
                <input
                  className="search-bar input-small"
                  type="number"
                  value={dollarValue}
                  min={0}
                  step="0.01"
                  onChange={handleDollarChange}
                  style={{
                    paddingLeft: "5px",
                    paddingRight: "25px",
                    textAlign: "center",
                  }}
                />
              </label>
              <span>
                <b>Open Shares:</b> {currentShares ?? 0}
              </span>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn-sleek btn-sleek-green"
                style={{
                  opacity: latestMark <= 0 ? 0.5 : 1,
                  cursor: latestMark <= 0 ? "not-allowed" : "pointer",
                }}
                onClick={() => {
                  setNewStocks((prev) => {
                    const existingPosition = prev[activeStock] || {
                      id: activeStock,
                      amount: 0,
                      price: 0,
                      portfolio_id: activePortfolio,
                    };

                    return {
                      ...prev,
                      [activeStock]: {
                        ...existingPosition,
                        amount: existingPosition.amount + amount,
                      },
                    };
                  });
                  ModifyTracker("newTracker");
                  setActiveCard("newPortfolio");
                }}
                disabled={latestMark <= 0 || amount <= 0}
              >
                Add Position
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockToPortfolioCard;

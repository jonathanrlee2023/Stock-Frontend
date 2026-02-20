import { useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { usePriceStream } from "./PriceContext";
import { FixedOptionWSComponent } from "./FixedOptionGraph";
import { useWS } from "./WSContest";
import { OptionExpirationCards } from "./OptionExpirationCards";
interface FixedStockCardProps {
  setActiveCard: (query: string) => void;
  setFixedID: (query: string) => void;
  fixedID: string;
}

export const StockCard: React.FC<FixedStockCardProps> = ({
  setActiveCard,
  setFixedID,
  fixedID,
}) => {
  const { previousID, setPreviousID } = useWS();
  const [activeStock, setActiveStock] = useState<string>(previousID || ""); // Persistent state for search query
  const { optionExpirations, startStockStream } = usePriceStream();
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
        onClick={() => setActiveCard("home")}
      >
        Back to Home
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
          <TodayStockWSComponent stockSymbol={activeStock} />
        </div>

        {/* Right side - Open Positions */}
        <div
          style={{
            width: "280px",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              padding: "0 16px",
            }}
          >
            Options
          </div>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              border: "1px solid #ffffff",
              borderRadius: "8px",
              padding: "12px 0",
            }}
          >
            <OptionExpirationCards
              setActiveCard={setActiveCard}
              setActiveID={setFixedID}
              stock={activeStock}
              defaultMessage="Loading..."
              optionExpirations={optionExpirations}
              prevCard="fixedStock"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;

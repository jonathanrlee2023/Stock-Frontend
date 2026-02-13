import { useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { usePriceStream } from "./PriceContext";

interface StockCardProps {
  setActiveCard: (query: string) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ setActiveCard }) => {
  const [activeStock, setActiveStock] = useState<string>(""); // Persistent state for search query
  const { startStockStream } = usePriceStream();
  return (
    <div
      className="card bg-dark text-white" // Bootstrap classes for dark mode
      style={{
        width: "100%",
        height: "98vh",
        margin: "0",
        borderRadius: "0",
        border: "none",
        backgroundColor: "#000000", // Overriding to true black
        overflow: "hidden",
      }}
    >
      <button
        className="btn btn-secondary"
        onClick={() => setActiveCard("home")}
      >
        Back to Home
      </button>
      <SearchBar
        setSearchQuery={setActiveStock}
        searchQuery={activeStock}
        inputMessage="Enter Stock Symbol..."
        onEnter={startStockStream}
        onSearchClick={startStockStream}
      />
      <TodayStockWSComponent stockSymbol={activeStock} />
    </div>
  );
};

export default StockCard;

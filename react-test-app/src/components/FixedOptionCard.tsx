import { useState } from "react";
import SearchBar from "./SearchBar";
import { TodayStockWSComponent } from "./TodayGraph";
import { usePriceStream } from "./PriceContext";
import { FixedOptionWSComponent } from "./FixedOptionGraph";
import { useWS } from "./WSContest";
interface FixedOptionCardProps {
  setActiveCard: (query: string) => void;
  fixedID: string;
}

export const StockCard: React.FC<FixedOptionCardProps> = ({
  setActiveCard,
  fixedID,
}) => {
  const { previousCard, previousID } = useWS();
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
      <div className="d-flex align-items-center p-2">
        {/* Previous Card Arrow */}
        {previousCard && (
          <button
            className="btn btn-outline-light me-2"
            onClick={() => {
              setActiveCard(previousCard);
            }}
            title="Go back to previous"
            style={{ borderRadius: "50%", padding: "5px 12px" }}
          >
            ←
          </button>
        )}

        {/* Back to Home Button */}
        <button
          className="btn btn-secondary"
          onClick={() => setActiveCard("home")}
        >
          Back to Home
        </button>
      </div>
      <FixedOptionWSComponent optionID={fixedID} />
    </div>
  );
};

export default StockCard;

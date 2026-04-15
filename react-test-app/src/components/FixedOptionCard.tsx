import { FixedOptionWSComponent } from "./FixedOptionGraph";
import { useWS } from "./Contexts/WSContest";
import { COLORS } from "../constants/Colors";
interface FixedOptionCardProps {
  setActiveCard: (query: string) => void;
  fixedID: string;
  activePortfolio: number;
}

export const StockCard: React.FC<FixedOptionCardProps> = ({
  setActiveCard,
  fixedID,
  activePortfolio,
}) => {
  const { previousCard } = useWS();
  return (
    <div
      className="bg-black text-white"
      style={{
        width: "100%",
        height: "100vh", // Use full viewport height
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.appBackground,
        overflow: "hidden",
      }}
    >
      {/* --- Utility Navigation Bar --- */}
      <div
        className="d-flex align-items-center p-2 gap-2"
        style={{ borderBottom: "1px solid " + COLORS.cardSoftBorder }}
      >
        {/* Return to Previous Card */}
        {previousCard && (
          <button
            className="btn-sleek"
            onClick={() => setActiveCard(previousCard)}
            style={{
              padding: "4px 12px",
              fontSize: "0.8rem",
              backgroundColor: "transparent",
              border: "1px solid " + COLORS.borderColor,
            }}
          >
            ← ESC
          </button>
        )}
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: COLORS.secondaryTextColor,
            marginRight: "12px",
          }}
        >
          ID_NODE:{" "}
          <span style={{ color: COLORS.mainFontColor }}>{fixedID}</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <FixedOptionWSComponent
          optionID={fixedID}
          activePortfolio={activePortfolio}
        />
      </div>
    </div>
  );
};

export default StockCard;

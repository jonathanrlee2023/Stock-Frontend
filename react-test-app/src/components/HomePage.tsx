import { useState } from "react";
import { COLORS } from "../constants/Colors";
import { BalanceWSComponent } from "./Balance";
import { IdCards } from "./OpenPositions";
import { SectorAllocation } from "./SectorAllocation";

interface HomePageProps {
  setActiveCard: (query: string) => void;
  setFixedID: (query: string) => void;
  setActiveStock: (query: string) => void;
  activeCard: string;
  activePortfolio: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveCard,
  setFixedID,
  setActiveStock,
  activePortfolio,
}) => {
  const [view, setView] = useState<"balance" | "sector">("balance");

  const toggleView = () => {
    setView((prev) => (prev === "balance" ? "sector" : "balance"));
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "94vh",
        width: "100%",
        backgroundColor: COLORS.appBackground,
        padding: "0 20px 15px 20px",
        marginTop: "10px",
        marginBottom: "10px",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{ display: "flex", flex: 1, gap: "20px", overflow: "hidden" }}
      >
        {/* Left side - Chart Dashboard */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            className="card"
            style={{
              flex: 1,
              margin: "0",
              display: "flex",
              flexDirection: "column",
              background: COLORS.appBackground,
              border: "1px solid " + COLORS.cardSoftBorder,
              borderRadius: "4px",
              overflow: "hidden",
              position: "relative", // Added for positioning arrows
            }}
          >
            {/* Navigation Arrows */}
            <button
              onClick={toggleView}
              style={{
                position: "absolute",
                right: "15px",
                top: "15px",
                zIndex: 10,
                background: "rgba(0,0,0,0.5)",
                border: `1px solid ${COLORS.cardSoftBorder}`,
                color: "#fff",
                cursor: "pointer",
                padding: "5px 10px",
                fontSize: "0.8rem",
                fontFamily: "monospace",
                borderRadius: "3px",
              }}
            >
              {view === "balance" ? "SECTOR →" : "← BALANCE"}
            </button>

            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              {view === "balance" ? (
                <BalanceWSComponent activePortfolio={activePortfolio} />
              ) : (
                <SectorAllocation activePortfolio={activePortfolio} />
              )}
            </div>

            {/* Optional: Pagination Dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                paddingBottom: "10px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    view === "balance" ? COLORS.secondaryTextColor : "#333",
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    view === "sector" ? COLORS.secondaryTextColor : "#333",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right side - Sidebar */}
        <div
          style={{
            width: "280px",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            className="card-title"
            style={{
              fontSize: "0.65rem",
              color: COLORS.secondaryTextColor,
              letterSpacing: "0.15em",
              marginBottom: "10px",
              paddingLeft: "5px",
            }}
          >
            MARKET POSITIONS
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              background: COLORS.cardBackground,
              border: "1px solid " + COLORS.cardSoftBorder,
              borderRadius: "4px",
            }}
          >
            <IdCards
              setActiveCard={setActiveCard}
              setActiveID={setFixedID}
              setActiveStock={setActiveStock}
              defaultMessage="NO OPEN POSITIONS"
              activePortfolio={activePortfolio}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

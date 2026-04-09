import { COLORS } from "../constants/Colors";
import { BalanceWSComponent } from "./Balance";
import { IdCards } from "./OpenPositions";

interface HomePageProps {
  setActiveCard: (query: string) => void;
  setFixedID: (query: string) => void;
  activeCard: string;
  activePortfolio: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveCard,
  setFixedID,
  activePortfolio,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "94vh" /* Fill the space below the header */,
        width: "100%",
        backgroundColor: COLORS.appBackground,
        padding: "0 20px 15px 20px",
        marginTop: "10px" /* The gap between the header and the content */,
        marginBottom: "10px" /* The gap between the content and the footer */,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "20px",
          overflow: "hidden",
        }}
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
            }}
          >
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              <BalanceWSComponent activePortfolio={activePortfolio} />
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

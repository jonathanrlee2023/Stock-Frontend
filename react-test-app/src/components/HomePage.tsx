import { BalanceWSComponent } from "./Balance";
import { IdButtons } from "./OpenPositions";

interface HomePageProps {
  setActiveCard: (query: string) => void;
  setFixedID: (query: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveCard,
  setFixedID,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "98vh", // Use 90% of tab height to leave room for card borders
        justifyContent: "space-between",
      }}
    >
      <>
        <BalanceWSComponent />
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            margin: "10px 0 5px 10px",
            zIndex: 2, // Ensures it stays above any absolute-positioned chart elements
          }}
        >
          Open Positions
        </div>
        <IdButtons setActiveCard={setActiveCard} setActiveID={setFixedID} />

        <div className="d-flex justify-content-center mt-2">
          <button
            className="btn-sleek mb-3 mx-2"
            onClick={() => setActiveCard("stock")}
          >
            Stocks
          </button>
          <button
            className="btn-sleek mb-3 mx-2"
            onClick={() => setActiveCard("options")}
          >
            Options
          </button>
        </div>
      </>
    </div>
  );
};

export default HomePage;

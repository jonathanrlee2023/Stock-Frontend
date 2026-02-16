import { BalanceWSComponent } from "./Balance";
import { IdCards } from "./OpenPositions";

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
        height: "98vh",
        gap: "10px",
      }}
    >
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
          <BalanceWSComponent />
          <div className="d-flex justify-content-center mb-10 mt-5">
            <button
              className="btn-sleek mx-2"
              onClick={() => setActiveCard("stock")}
            >
              Stocks
            </button>
            <button
              className="btn-sleek mx-2"
              onClick={() => setActiveCard("options")}
            >
              Options
            </button>
          </div>
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
            Open Positions
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
            <IdCards
              setActiveCard={setActiveCard}
              setActiveID={setFixedID}
              defaultMessage="No Open Positions"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

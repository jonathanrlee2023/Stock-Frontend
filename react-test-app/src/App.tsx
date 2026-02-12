import React, { act, useState } from "react";
import { OptionWSComponent } from "./components/OptionGraph";
import { TodayStockWSComponent } from "./components/TodayGraph";
import { WSProvider } from "./components/WSContest";
import SearchBar from "./components/SearchBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { PriceStreamProvider } from "./components/PriceContext";
import { ButtonsProvider } from "./components/ButtonContext";
import OptionsSearchBar from "./components/OptionsSearchBar";
import { BalanceWSComponent } from "./components/Balance";
import { FixedOptionWSComponent } from "./components/FixedOptionGraph";
import { IdButtons } from "./components/OpenPositions";
import { usePriceStream } from "./components/PriceContext";

const App: React.FC = () => {
  const [activeStock, setActiveStock] = useState<string>(""); // Persistent state for search query
  const [activeCard, setActiveCard] = useState<string>("home"); // State to track the active screen
  const [underlyingStock, setUnderlyingStock] = useState<string>("");
  const [optionDay, setOptionDay] = useState<string>("");
  const [optionMonth, setOptionMonth] = useState<string>("");
  const [optionYear, setOptionYear] = useState<string>("");
  const [strikePrice, setStrikePrice] = useState<string>("");
  const [optionType, setOptionType] = useState<string>("");
  const [fixedID, setFixedID] = useState<string>("");

  const { startStockStream } = usePriceStream();

  return (
    <div
      className="container-fluid p-0"
      style={{ backgroundColor: "#121212", minHeight: "100vh" }}
    >
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
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {activeCard === "home" && (
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
                <IdButtons
                  setActiveCard={setActiveCard}
                  setActiveID={setFixedID}
                />

                <div className="d-flex justify-content-center mt-2">
                  <button
                    className="btn btn-primary btn-lg mb-3 mx-2"
                    onClick={() => setActiveCard("stock")}
                  >
                    Stocks
                  </button>
                  <button
                    className="btn btn-primary btn-lg mb-3 mx-2"
                    onClick={() => setActiveCard("options")}
                  >
                    Options
                  </button>
                </div>
              </>
            </div>
          )}
          {activeCard === "options" && (
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
              <div className="d-flex flex-wrap gap-2 mb-3">
                <OptionsSearchBar
                  setSearchQuery={setUnderlyingStock}
                  searchQuery={underlyingStock}
                  inputMessage="Enter Stock Symbol..."
                  onEnter={setUnderlyingStock}
                  onSearchClick={setUnderlyingStock}
                />
                <OptionsSearchBar
                  setSearchQuery={setStrikePrice}
                  searchQuery={strikePrice}
                  inputMessage="Enter Strike Price..."
                  onEnter={setStrikePrice}
                  onSearchClick={setStrikePrice}
                />
                <OptionsSearchBar
                  setSearchQuery={setOptionDay}
                  searchQuery={optionDay}
                  inputMessage="Enter Expiration Day..."
                  onEnter={setOptionDay}
                  onSearchClick={setOptionDay}
                />
                <OptionsSearchBar
                  setSearchQuery={setOptionMonth}
                  searchQuery={optionMonth}
                  inputMessage="Enter Expiration Month..."
                  onEnter={setOptionMonth}
                  onSearchClick={setOptionMonth}
                />
                <OptionsSearchBar
                  setSearchQuery={setOptionYear}
                  searchQuery={optionYear}
                  inputMessage="Enter Expiration Year..."
                  onEnter={setOptionYear}
                  onSearchClick={setOptionYear}
                />
                <OptionsSearchBar
                  setSearchQuery={setOptionType}
                  searchQuery={optionType}
                  inputMessage="Enter Option Type..."
                  onEnter={setOptionType}
                  onSearchClick={setOptionType}
                />
              </div>
              <OptionWSComponent
                stockSymbol={underlyingStock}
                strikePrice={strikePrice}
                year={optionYear}
                month={optionMonth}
                day={optionDay}
                type={optionType}
              />
            </div>
          )}
          {activeCard == "stock" && (
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
          )}
          {activeCard == "fixedStock" && (
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
              <TodayStockWSComponent stockSymbol={fixedID} />
            </div>
          )}
          {activeCard == "fixedOption" && (
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
              <FixedOptionWSComponent optionID={fixedID} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

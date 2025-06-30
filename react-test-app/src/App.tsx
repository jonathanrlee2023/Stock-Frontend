import React, { act, useState } from "react";
import { StockStatisticsComponent } from "./components/StockStatistics";
import { EarningsDateComponent } from "./components/EarningsData";
import { OptionWSComponent } from "./components/OptionGraph";
import { EarningsVolatilityComponent } from "./components/EarningsVolatility";
import { EconomicDataComponent } from "./components/EconomicData";
import { TodayStockWSComponent } from "./components/TodayGraph";
import { CombinedOptionsDataComponent } from "./components/CombinedOptions";
import { WSProvider } from "./components/WSContest";
import SearchBar from "./components/SearchBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { setuid } from "process";
import { PriceStreamProvider } from "./components/PriceContext";
import { ButtonsProvider } from "./components/ButtonContext";
import OptionsSearchBar from "./components/OptionsSearchBar";
import { BalanceWSComponent } from "./components/Balance";
import { FixedOptionWSComponent } from "./components/FixedOptionGraph";
import { IdButtons } from "./components/OpenPositions";

const App: React.FC = () => {
  const [activeStock, setActiveStock] = useState<string>(""); // Persistent state for search query
  const [activeCard, setActiveCard] = useState<string>("home"); // State to track the active screen
  const [underlyingStock, setUnderlyingStock] = useState<string>("");
  const [optionDay, setOptionDay] = useState<string>("");
  const [optionMonth, setOptionMonth] = useState<string>("");
  const [optionYear, setOptionYear] = useState<string>("");
  const [strikePrice, setStrikePrice] = useState<string>("");
  const [optionType, setOptionType] = useState<string>("");
  const [ids, setIds] = useState<string[]>([]);
  const [fixedID, setFixedID] = useState<string>("");
  const startStockStream = (symbol: string) => {
    setActiveStock(symbol);
    fetch(`http://localhost:8080/startStockStream?symbol=${symbol}`)
      .then((res) => res.text())
      .then((data) => console.log("Data:", data))
      .catch((err) => console.error("API error:", err));
  };
  function formatOptionSymbol(
    stock: string,
    day: string,
    month: string,
    year: string,
    type: string,
    strike: string
  ): string {
    const yy = year.length === 4 ? year.slice(2) : year; // Convert YYYY to YY if needed
    const typeLetter = type.toUpperCase().startsWith("C") ? "C" : "P";

    // Convert strike price string to number, then format
    const strikeNum = parseFloat(strike);
    const strikeStr = (strikeNum * 1000).toFixed(0).padStart(8, "0");

    return `${stock.toUpperCase()}_${yy}${month.padStart(2, "0")}${day.padStart(
      2,
      "0"
    )}${typeLetter}${strikeStr}`;
  }
  const postData = async (action: string, type: string) => {
    let data: { id: string } = { id: "" };
    if (type == "Stock") {
      data.id = activeStock;
    } else if (type == "Option") {
      data.id = formatOptionSymbol(
        underlyingStock,
        optionDay,
        optionMonth,
        optionYear,
        optionType,
        strikePrice
      );
    }

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
  const expirationDate = React.useMemo(() => {
    let yearNum = parseInt(optionYear, 10);

    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100; // e.g., 2000
    yearNum += currentCentury;
    const monthNum = parseInt(optionMonth, 10) - 1;
    const dayNum = parseInt(optionDay, 10);

    const date = new Date(yearNum, monthNum, dayNum, 23, 59, 59);
    console.log(date);
    return isNaN(date.getTime()) ? null : date; // invalid -> null
  }, [optionDay, optionMonth, optionYear]);

  // Check if the expiration date is in the past
  const now = new Date();

  const isExpired = expirationDate ? expirationDate < now : true;
  const fieldMissing =
    underlyingStock == "" ||
    optionDay == "" ||
    optionMonth == "" ||
    optionYear == "" ||
    optionType == "" ||
    strikePrice == "";

  return (
    <div className="App">
      <ButtonsProvider>
        <PriceStreamProvider>
          <WSProvider clientId="STOCK_CLIENT">
            {activeCard === "home" && (
              <>
                <BalanceWSComponent />
                <IdButtons
                  setActiveCard={setActiveCard}
                  setActiveID={setFixedID}
                />
                <div className="d-flex justify-content-center mt-0">
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
            )}
            {activeCard === "options" && (
              <div className="card">
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
                <div className="d-flex gap-2 mx-2">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      fetch(
                        `http://localhost:8080/startOptionStream?symbol=${underlyingStock}&price=${strikePrice}&day=${optionDay}&month=${optionMonth}&year=${optionYear}&type=${optionType}`
                      )
                        .then((res) => res.text())
                        .then((data) => console.log("Data:", data))
                        .catch((err) => console.error("API error:", err));
                    }}
                    disabled={fieldMissing || isExpired}
                  >
                    SEARCH
                  </button>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      {
                        postData("newTracker", "Option");
                      }
                    }}
                    disabled={fieldMissing || isExpired}
                  >
                    ADD
                  </button>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      {
                        postData("closeTracker", "Option");
                      }
                    }}
                    disabled={fieldMissing || isExpired}
                  >
                    REMOVE
                  </button>
                  {isExpired && (
                    <div
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        marginTop: "10px",
                      }}
                    >
                      The option expiration date has passed. Actions are
                      disabled.
                    </div>
                  )}
                  {fieldMissing && (
                    <div
                      style={{
                        color: "orange",
                        fontWeight: "bold",
                        marginTop: "10px",
                      }}
                    >
                      Please fill in all fields before proceeding.
                    </div>
                  )}
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
              <div className="card">
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
                <div className="d-flex gap-2 mx-2 mb-2">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      {
                        postData("newTracker", "Stock");
                      }
                    }}
                    disabled={activeStock == ""}
                  >
                    ADD
                  </button>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      {
                        postData("closeTracker", "Stock");
                      }
                    }}
                    disabled={activeStock == ""}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            )}
            {activeCard == "fixedStock" && (
              <div className="card">
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
              <div className="card">
                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveCard("home")}
                >
                  Back to Home
                </button>
                <FixedOptionWSComponent optionID={fixedID} />
              </div>
            )}
          </WSProvider>
        </PriceStreamProvider>
      </ButtonsProvider>
    </div>
  );
};

export default App;

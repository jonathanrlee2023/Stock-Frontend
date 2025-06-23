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

const App: React.FC = () => {
  const [activeStock, setActiveStock] = useState<string>(""); // Persistent state for search query
  const [activeCard, setActiveCard] = useState<string>("home"); // State to track the active screen
  const [underlyingStock, setUnderlyingStock] = useState<string>("");
  const [optionDay, setOptionDay] = useState<string>("");
  const [optionMonth, setOptionMonth] = useState<string>("");
  const [optionYear, setOptionYear] = useState<string>("");
  const [strikePrice, setStrikePrice] = useState<string>("");
  const [optionType, setOptionType] = useState<string>("");
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
  const postData = async () => {
    const data = {
      id: formatOptionSymbol(
        underlyingStock,
        optionDay,
        optionMonth,
        optionYear,
        optionType,
        strikePrice
      ),
    };

    try {
      const response = await fetch("http://localhost:8080/newTracker", {
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

  return (
    <div className="App">
      <ButtonsProvider>
        <PriceStreamProvider>
          <WSProvider clientId="STOCK_CLIENT">
            {activeCard === "home" && (
              <>
                <BalanceWSComponent />
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
                <div className="d-flex gap-2 mb-6 mx-2">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      fetch(
                        `http://localhost:8080/startOptionStream?symbol=${underlyingStock}&price=${strikePrice}&day=${optionDay}&month=${optionMonth}&year=${optionYear}&type=${optionType}`
                      )
                        .then((res) => res.text())
                        .then((data) => console.log("Data:", data))
                        .catch((err) => console.error("API error:", err));
                    }}
                  >
                    SEARCH
                  </button>

                  <button className="btn btn-primary btn-lg" onClick={postData}>
                    ADD
                  </button>
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
              </div>
            )}
          </WSProvider>
        </PriceStreamProvider>
      </ButtonsProvider>
    </div>
  );
};

//   return (
//     <div className="App">
//       {activeCard === "home" && (
//         <div className="home-screen">
//           <h1>Stock Tracker</h1>
//           <EconomicDataComponent />
//           <SearchBar
//             setSearchQuery={setSearchQuery}
//             searchQuery={searchQuery}
//           />
//           <TodayStockComponent stockSymbol={searchQuery} />
//           <div className="d-flex gap-5">
//             <button
//               className="btn btn-primary btn-lg"
//               onClick={() => setActiveCard("statistics")}
//             >
//               Statistics
//             </button>
//             <button
//               className="btn btn-primary btn-lg"
//               onClick={() => setActiveCard("earningsCalender")}
//             >
//               Earnings Data
//             </button>
//             <button
//               className="btn btn-primary btn-lg"
//               onClick={() => setActiveCard("earningsVolatility")}
//             >
//               Earnings Volatility
//             </button>
//             <button
//               className="btn btn-primary btn-lg"
//               onClick={() => setActiveCard("callOption")}
//             >
//               Call Option Data
//             </button>
//             <button
//               className="btn btn-primary btn-lg"
//               onClick={() => setActiveCard("putOption")}
//             >
//               Put Option Data
//             </button>
//             <button
//               className="btn btn-primary btn-lg"
//               onClick={() => setActiveCard("combinedOptions")}
//             >
//               Combined Options Data
//             </button>
//           </div>
//         </div>
//       )}
//       {activeCard === "statistics" && (
//         <div className="card">
//           <button
//             className="btn btn-secondary"
//             onClick={() => setActiveCard("home")}
//           >
//             Back to Home
//           </button>
//           <div className="card-title">
//             {searchQuery || "Enter a symbol"} Statistics
//           </div>
//           <StockStatisticsComponent stockSymbol={searchQuery} />
//         </div>
//       )}
//       {activeCard === "earningsCalender" && (
//         <div className="card">
//           <button
//             className="btn btn-secondary"
//             onClick={() => setActiveCard("home")}
//           >
//             Back to Home
//           </button>
//           <div className="card-title">
//             Earnings Data for {searchQuery || "Enter a symbol"}
//           </div>
//           <EarningsDateComponent stockSymbol={searchQuery} />
//         </div>
//       )}
//       {activeCard === "earningsVolatility" && (
//         <div className="card">
//           <button
//             className="btn btn-secondary"
//             onClick={() => setActiveCard("home")}
//           >
//             Back to Home
//           </button>
//           <div className="card-title">
//             Earnings Data for {searchQuery || "Enter a symbol"}
//           </div>
//           <EarningsVolatilityComponent stockSymbol={searchQuery} />
//         </div>
//       )}
//       {activeCard === "callOption" && (
//         <div className="card">
//           <button
//             className="btn btn-secondary"
//             onClick={() => setActiveCard("home")}
//           >
//             Back to Home
//           </button>
//           <div className="card-title">
//             Call Option Data for {searchQuery || "Enter a symbol"}
//           </div>
//           <OptionsDataComponent stockSymbol={searchQuery} optionType="Call" />
//         </div>
//       )}
//       {activeCard === "putOption" && (
//         <div className="card">
//           <button
//             className="btn btn-secondary"
//             onClick={() => setActiveCard("home")}
//           >
//             Back to Home
//           </button>
//           <div className="card-title">
//             Put Option Data for {searchQuery || "Enter a symbol"}
//           </div>
//           <OptionsDataComponent stockSymbol={searchQuery} optionType="Put" />
//         </div>
//       )}
//       {activeCard === "combinedOptions" && (
//         <div className="card">
//           <button
//             className="btn btn-secondary"
//             onClick={() => setActiveCard("home")}
//           >
//             Back to Home
//           </button>
//           <div className="card-title">
//             Combined Option Data for {searchQuery || "Enter a symbol"}
//           </div>
//           <CombinedOptionsDataComponent stockSymbol={searchQuery} />
//         </div>
//       )}
//     </div>
//   );
// };

export default App;

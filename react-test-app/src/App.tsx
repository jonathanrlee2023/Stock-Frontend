import React, { useState } from "react";
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

const App: React.FC = () => {
  const [activeStock, setActiveStock] = useState<string>(""); // Persistent state for search query
  const [activeCard, setActiveCard] = useState<string>("home"); // State to track the active screen
  const [underlyingStock, setUnderlyingStock] = useState<string>("");
  const [optionDay, setOptionDay] = useState<string>("");
  const [optionMonth, setOptionMonth] = useState<string>("");
  const [optionYear, setOptionYear] = useState<string>("");
  const [strikePrice, setStrikePrice] = useState<string>("");
  const [optionType, setOptionType] = useState<string>("");

  return (
    <div className="App">
      <WSProvider>
        {activeCard === "home" && (
          <div className="home-screen">
            <SearchBar
              setSearchQuery={setActiveStock}
              searchQuery={activeStock}
              inputMessage="Enter Stock Symbol..."
              onEnter={(symbol) => {
                setActiveStock(symbol);
                fetch(`http://localhost:8080/startStockStream?symbol=${symbol}`)
                  .then((res) => res.text())
                  .then((data) => console.log("Data:", data))
                  .catch((err) => console.error("API error:", err));
              }}
              onSearchClick={(symbol) => {
                setActiveStock(symbol);
                fetch(`http://localhost:8080/startStockStream?symbol=${symbol}`)
                  .then((res) => res.text())
                  .then((data) => console.log("Data:", data))
                  .catch((err) => console.error("API error:", err));
              }}
            />
            <TodayStockWSComponent stockSymbol={activeStock} />
            <div className="d-flex justify-content-center mt-0">
              <button
                className="btn btn-primary btn-lg mb-3"
                onClick={() => setActiveCard("options")}
              >
                Options
              </button>
            </div>
          </div>
        )}
        {activeCard === "options" && (
          <div className="card">
            <button
              className="btn btn-secondary"
              onClick={() => setActiveCard("home")}
            >
              Back to Home
            </button>
            <SearchBar
              setSearchQuery={setUnderlyingStock}
              searchQuery={underlyingStock}
              inputMessage="Enter Stock Symbol..."
              onEnter={setUnderlyingStock}
              onSearchClick={setUnderlyingStock}
            />
            <SearchBar
              setSearchQuery={setStrikePrice}
              searchQuery={strikePrice}
              inputMessage="Enter Strike Price..."
              onEnter={setStrikePrice}
              onSearchClick={setStrikePrice}
            />
            <SearchBar
              setSearchQuery={setOptionDay}
              searchQuery={optionDay}
              inputMessage="Enter Expiration Day..."
              onEnter={setOptionDay}
              onSearchClick={setOptionDay}
            />
            <SearchBar
              setSearchQuery={setOptionMonth}
              searchQuery={optionMonth}
              inputMessage="Enter Expiration Month..."
              onEnter={setOptionMonth}
              onSearchClick={setOptionMonth}
            />
            <SearchBar
              setSearchQuery={setOptionYear}
              searchQuery={optionYear}
              inputMessage="Enter Expiration Year..."
              onEnter={setOptionYear}
              onSearchClick={setOptionYear}
            />
            <SearchBar
              setSearchQuery={setOptionType}
              searchQuery={optionType}
              inputMessage="Enter Option Type..."
              onEnter={setOptionType}
              onSearchClick={setOptionType}
            />
            <button
              className="btn btn-primary btn-lg mb-3"
              onClick={() => {
                fetch(
                  `http://localhost:8080/startOptionStream?symbol=${underlyingStock}&price=${strikePrice}&day=${optionDay}&month=${optionMonth}&year=${optionYear}&type=${optionType}`
                )
                  .then((res) => res.text())
                  .then((data) => console.log("Data:", data))
                  .catch((err) => console.error("API error:", err));
              }}
            >
              Confirm
            </button>

            <div className="card-title">
              {underlyingStock} ${strikePrice} {optionType} Expiring
              {optionMonth}/{optionDay}/{optionYear}
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
      </WSProvider>
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

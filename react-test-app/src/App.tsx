import React, { useState } from "react";
import { StockStatisticsComponent } from "./components/StockStatistics";
import { EarningsDateComponent } from "./components/EarningsData";
import { OptionsDataComponent } from "./components/OptionGraph";
import { EarningsVolatilityComponent } from "./components/EarningsVolatility";
import { EconomicDataComponent } from "./components/EconomicData";
import { TodayStockComponent } from "./components/TodayGraph";
import SearchBar from "./components/SearchBar";
import "bootstrap/dist/css/bootstrap.min.css";

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(""); // Persistent state for search query
  const [activeCard, setActiveCard] = useState<string>("home"); // State to track the active screen

  return (
    <div className="App">
      {activeCard === "home" && (
        <div className="home-screen">
          <h1>Stock Tracker</h1>
          <EconomicDataComponent />
          <SearchBar
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
          />
          <TodayStockComponent stockSymbol={searchQuery} />
          <div className="d-flex gap-5">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActiveCard("statistics")}
            >
              Statistics
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActiveCard("earningsCalender")}
            >
              Earnings Data
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActiveCard("earningsVolatility")}
            >
              Earnings Volatility
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActiveCard("callOption")}
            >
              Call Option Data
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActiveCard("putOption")}
            >
              Put Option Data
            </button>
          </div>
        </div>
      )}
      {activeCard === "statistics" && (
        <div className="card">
          <button
            className="btn btn-secondary"
            onClick={() => setActiveCard("home")}
          >
            Back to Home
          </button>
          <div className="card-title">
            {searchQuery || "Enter a symbol"} Statistics
          </div>
          <StockStatisticsComponent stockSymbol={searchQuery} />
        </div>
      )}
      {activeCard === "earningsCalender" && (
        <div className="card">
          <button
            className="btn btn-secondary"
            onClick={() => setActiveCard("home")}
          >
            Back to Home
          </button>
          <div className="card-title">
            Earnings Data for {searchQuery || "Enter a symbol"}
          </div>
          <EarningsDateComponent stockSymbol={searchQuery} />
        </div>
      )}
      {activeCard === "earningsVolatility" && (
        <div className="card">
          <button
            className="btn btn-secondary"
            onClick={() => setActiveCard("home")}
          >
            Back to Home
          </button>
          <div className="card-title">
            Earnings Data for {searchQuery || "Enter a symbol"}
          </div>
          <EarningsVolatilityComponent stockSymbol={searchQuery} />
        </div>
      )}
      {activeCard === "callOption" && (
        <div className="card">
          <button
            className="btn btn-secondary"
            onClick={() => setActiveCard("home")}
          >
            Back to Home
          </button>
          <div className="card-title">
            Call Option Data for {searchQuery || "Enter a symbol"}
          </div>
          <OptionsDataComponent stockSymbol={searchQuery} optionType="Call" />
        </div>
      )}
      {activeCard === "putOption" && (
        <div className="card">
          <button
            className="btn btn-secondary"
            onClick={() => setActiveCard("home")}
          >
            Back to Home
          </button>
          <div className="card-title">
            Put Option Data for {searchQuery || "Enter a symbol"}
          </div>
          <OptionsDataComponent stockSymbol={searchQuery} optionType="Put" />
        </div>
      )}
    </div>
  );
};

export default App;

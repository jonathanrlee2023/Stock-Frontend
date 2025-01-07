import React, { useState } from "react";
import { StockStatisticsComponent } from "./components/StockStatistics";
import { EarningsDateComponent } from "./components/EarningsData";
import { OptionsDataComponent } from "./components/OptionGraph";
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
          <SearchBar
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
          />
          <div className="d-flex gap-5">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActiveCard("statistics")}
            >
              Statistics
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActiveCard("earnings")}
            >
              Earnings Data
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActiveCard("options")}
            >
              Options Data
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
      {activeCard === "earnings" && (
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
      {activeCard === "options" && (
        <div className="card">
          <button
            className="btn btn-secondary"
            onClick={() => setActiveCard("home")}
          >
            Back to Home
          </button>
          <div className="card-title">
            Options Data for {searchQuery || "Enter a symbol"}
          </div>
          <OptionsDataComponent stockSymbol={searchQuery} />
        </div>
      )}
    </div>
  );
};

export default App;

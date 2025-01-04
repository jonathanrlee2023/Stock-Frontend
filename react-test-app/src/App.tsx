import "./App.css";
import { StockStatisticsComponent } from "./components/StockStatistics";
import { EarningsDateComponent } from "./components/EarningsData";
import { OptionsDataComponent } from "./components/OptionGraph";
import SearchBar from "./components/SearchBar";
import { useState } from "react";

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(""); // State to track the search query

  return (
    <div className="App">
      <div className="card">
        <SearchBar setSearchQuery={setSearchQuery} />
      </div>
      <div className="card">
        <div className="card-title">{searchQuery} Statistics</div>
        <StockStatisticsComponent stockSymbol={searchQuery} />
      </div>
      <div className="card">
        <div className="card-title">Earnings Data</div>
        <EarningsDateComponent stockSymbol={searchQuery} />
      </div>
      <div className="card">
        <div className="card-title">Options Data</div>
        <OptionsDataComponent />
      </div>
    </div>
  );
};

export default App;

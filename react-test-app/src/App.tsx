import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { StockStatisticsComponent } from "./components/StockStatistics";
import { EarningsDateComponent } from "./components/EarningsData";
import { OptionsDataComponent } from "./components/OptionGraph";
import SearchBar from "./components/SearchBar";
import { useState } from "react";

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <div className="home-screen">
                <h1>Welcome to Stock Tracker</h1>
                <SearchBar setSearchQuery={setSearchQuery} />
                <div className="d-flex gap-3">
                  <Link to="/statistics" className="btn btn-primary">
                    Statistics
                  </Link>
                  <Link to="/earnings" className="btn btn-primary">
                    Earnings Data
                  </Link>
                  <Link to="/options" className="btn btn-primary">
                    Options Data
                  </Link>
                </div>
              </div>
            }
          />
          <Route
            path="/statistics"
            element={
              <div className="card">
                <Link to="/" className="btn btn-secondary">
                  Back to Home
                </Link>
                <div className="card-title">
                  {searchQuery || "Enter a symbol"} Statistics
                </div>
                <StockStatisticsComponent stockSymbol={searchQuery} />
              </div>
            }
          />
          <Route
            path="/earnings"
            element={
              <div className="card">
                <Link to="/" className="btn btn-secondary">
                  Back to Home
                </Link>
                <div className="card-title">
                  Earnings Data for {searchQuery || "Enter a symbol"}
                </div>
                <EarningsDateComponent stockSymbol={searchQuery} />
              </div>
            }
          />
          <Route
            path="/options"
            element={
              <div className="card">
                <Link to="/" className="btn btn-secondary">
                  Back to Home
                </Link>
                <div className="card-title">
                  Options Data for {searchQuery || "Enter a symbol"}
                </div>
                <OptionsDataComponent stockSymbol={searchQuery} />
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

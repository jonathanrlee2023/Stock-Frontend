import "bootstrap/dist/css/bootstrap.min.css";
import { Position } from "./components/PriceContext";
import React, { useState } from "react";
import "../App.css";
import OptionCard from "./components/OptionCard";
import HomePage from "./components/HomePage";
import StockCard from "./components/StockCard";
import FixedOptionCard from "./components/FixedOptionCard";
import FixedStockCard from "./components/FixedStockCard";
import { FinancialsCard } from "./components/FinancialsCard";
import { PortfolioCards } from "./components/PortfoliosListCard";
import { NewPortfolioCard } from "./components/NewPortfolioCard";
import StockToPortfolioCard from "./components/StockToPortfolioCard";

const App: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string>("home"); // State to track the active screen
  const [fixedID, setFixedID] = useState<string>("");
  const [activePortfolio, setActivePortfolio] = useState<number>(1);
  const [newStocks, setNewStocks] = useState<Record<string, Position>>({});
  const [tempPortfolioName, setTempPortfolioName] = useState<string>("");

  return (
    <div
      className="container-fluid p-0"
      style={{ backgroundColor: "#363636", minHeight: "100vh" }}
    >
      <div
        className="card bg-dark text-white" // Bootstrap classes for dark mode
        style={{
          width: "100%",
          height: "100vh",
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
            <HomePage
              setActiveCard={setActiveCard}
              setFixedID={setFixedID}
              activePortfolio={activePortfolio}
            />
          )}
          {activeCard === "options" && (
            <OptionCard
              setActiveCard={setActiveCard}
              activePortfolio={activePortfolio}
            />
          )}
          {activeCard == "stock" && (
            <StockCard
              setActiveCard={setActiveCard}
              setFixedID={setFixedID}
              activeCard="stock"
              activePortfolio={activePortfolio}
            />
          )}
          {activeCard == "fixedStock" && (
            <FixedStockCard
              setActiveCard={setActiveCard}
              setFixedID={setFixedID}
              activeCard="fixedStock"
              activePortfolio={activePortfolio}
            />
          )}
          {activeCard == "fixedOption" && (
            <FixedOptionCard
              setActiveCard={setActiveCard}
              fixedID={fixedID}
              activePortfolio={activePortfolio}
            />
          )}
          {activeCard == "financials" && (
            <FinancialsCard setActiveCard={setActiveCard} />
          )}
          {activeCard == "portfolioList" && (
            <PortfolioCards
              setActiveCard={setActiveCard}
              setActivePortfolio={setActivePortfolio}
              activePortfolio={activePortfolio}
            />
          )}
          {activeCard == "newPortfolio" && (
            <NewPortfolioCard
              setActiveCard={setActiveCard}
              setFixedID={setFixedID}
              setNewStocks={setNewStocks}
              setActivePortfolio={setActivePortfolio}
              setTempPortfolioName={setTempPortfolioName}
              newStocks={newStocks}
              activePortfolio={activePortfolio}
              tempPortfolioName={tempPortfolioName}
            />
          )}
          {activeCard == "stockToPortfolio" && (
            <StockToPortfolioCard
              setActiveCard={setActiveCard}
              activePortfolio={activePortfolio}
              setNewStocks={setNewStocks}
              activeCard="stockToPortfolio"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

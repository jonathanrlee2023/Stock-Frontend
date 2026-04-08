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
      style={{
        backgroundColor: "#000000",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* 1. PERSISTENT HEADER LIVES HERE */}
      <div
        className="d-flex justify-content-between align-items-center"
        style={{
          height: "50px",
          borderBottom: "1px solid #9e9e9e",
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: "0.9rem",
            margin: "0",
            letterSpacing: "0.25em",
            color: "#ffffff",
            fontWeight: 900,
          }}
        >
          QUANTAE DIVITIAE
        </h1>

        <nav className="d-flex gap-4" style={{ height: "100%" }}>
          {[
            { id: "home", label: "DASHBOARD" },
            { id: "stock", label: "STOCKS" },
            { id: "options", label: "OPTIONS" },
            { id: "portfolioList", label: "PORTFOLIOS" },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveCard(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 700,
                color:
                  activeCard === item.id ||
                  (item.id === "home" && activeCard === "home")
                    ? "#ffffff"
                    : "#666666",
                borderBottom:
                  activeCard === item.id
                    ? "2px solid #7e7cf3"
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                padding: "0 4px",
                height: "100%",
              }}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          overflow: "hidden" /* Keeps children like HomePage constrained */,
        }}
      >
        {activeCard === "home" && (
          <HomePage
            setActiveCard={setActiveCard}
            setFixedID={setFixedID}
            activeCard={activeCard}
            activePortfolio={activePortfolio}
          />
        )}
        {activeCard === "options" && (
          <OptionCard
            setActiveCard={setActiveCard}
            activePortfolio={activePortfolio}
          />
        )}
        {activeCard === "stock" && (
          <StockCard
            setActiveCard={setActiveCard}
            setFixedID={setFixedID}
            activeCard="stock"
            activePortfolio={activePortfolio}
          />
        )}
        {activeCard === "fixedStock" && (
          <FixedStockCard
            setActiveCard={setActiveCard}
            setFixedID={setFixedID}
            activeCard="fixedStock"
            activePortfolio={activePortfolio}
          />
        )}
        {activeCard === "fixedOption" && (
          <FixedOptionCard
            setActiveCard={setActiveCard}
            fixedID={fixedID}
            activePortfolio={activePortfolio}
          />
        )}
        {activeCard === "financials" && (
          <FinancialsCard setActiveCard={setActiveCard} />
        )}
        {activeCard === "portfolioList" && (
          <PortfolioCards
            setActiveCard={setActiveCard}
            setActivePortfolio={setActivePortfolio}
            activePortfolio={activePortfolio}
          />
        )}
        {activeCard === "newPortfolio" && (
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
        {activeCard === "stockToPortfolio" && (
          <StockToPortfolioCard
            setActiveCard={setActiveCard}
            activePortfolio={activePortfolio}
            setNewStocks={setNewStocks}
            activeCard="stockToPortfolio"
          />
        )}
      </div>
    </div>
  );
};

export default App;

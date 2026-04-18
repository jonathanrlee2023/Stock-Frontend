import "bootstrap/dist/css/bootstrap.min.css";
import { Position } from "./components/Contexts/StreamActionsContext";
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
import { COLORS } from "./constants/Colors";
import { MetalText } from "./components/MetalText";
import NewsTicker from "./components/ScrollingNews";
import { useWS } from "./components/Contexts/WSContest";
const App: React.FC = () => {
  const { previousID } = useWS();
  const [activeCard, setActiveCard] = useState<string>("home"); // State to track the active screen
  const [activeStock, setActiveStock] = useState<string>(previousID || ""); // Persistent state for search query
  const [fixedID, setFixedID] = useState<string>("");
  const [activePortfolio, setActivePortfolio] = useState<number>(1);
  const [newStocks, setNewStocks] = useState<Record<string, Position>>({});
  const [tempPortfolioName, setTempPortfolioName] = useState<string>("");

  return (
    <div
      className="container-fluid p-0"
      style={{
        backgroundColor: COLORS.cardBackground,
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* 1. PERSISTENT HEADER */}
      <div
        className="d-flex align-items-center" // Removed justify-content-between
        style={{
          height: "50px",
          borderBottom: "1px solid " + COLORS.headerBottomBorder,
          padding: "0 20px",
          flexShrink: 0,
          position: "relative", // Needed for absolute centering
        }}
      >
        {/* LEFT: Logo */}
        <div style={{ flex: "0 0 200px" }}>
          {" "}
          {/* Fixed width keeps center stable */}
          <MetalText
            children="QUANTAE DIVITIAE"
            className="card-title mb-0"
            fontSize="1.2rem"
          />
        </div>

        {/* MIDDLE: The News Ticker */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
            height: "100%",
            padding: "0 40px",
          }}
        >
          <NewsTicker activeCard={activeCard} activeStock={activeStock} />
        </div>

        {/* RIGHT: Navigation */}
        <nav
          className="d-flex gap-4"
          style={{ height: "100%", flex: "0 0 auto" }}
        >
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
                fontSize: "0.7rem",
                fontWeight: 700,
                color:
                  activeCard === item.id
                    ? COLORS.mainFontColor
                    : COLORS.infoTextColor,
                borderBottom:
                  activeCard === item.id
                    ? "2px solid " + COLORS.secondaryTextColor
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                padding: "0 4px",
                height: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.mainFontColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  activeCard === item.id
                    ? COLORS.mainFontColor
                    : COLORS.infoTextColor;
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
            setActiveStock={setActiveStock}
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
            setActiveStock={setActiveStock}
            activeCard="stock"
            activePortfolio={activePortfolio}
            activeStock={activeStock}
          />
        )}
        {activeCard === "fixedStock" && (
          <FixedStockCard
            setActiveCard={setActiveCard}
            setFixedID={setFixedID}
            activeCard="fixedStock"
            activePortfolio={activePortfolio}
            activeStock={activeStock}
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

import React, { act, useState } from "react";
import { OptionWSComponent } from "./components/OptionGraph";
import { TodayStockWSComponent } from "./components/TodayGraph";
import { WSProvider } from "./components/WSContest";
import SearchBar from "./components/SearchBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { PriceStreamProvider } from "./components/PriceContext";
import { ButtonsProvider } from "./components/ButtonContext";
import OptionsSearchBar from "./components/OptionsSearchBar";
import { BalanceWSComponent } from "./components/Balance";
import { FixedOptionWSComponent } from "./components/FixedOptionGraph";
import { usePriceStream } from "./components/PriceContext";
import "../App.css";
import OptionCard from "./components/OptionCard";
import HomePage from "./components/HomePage";
import StockCard from "./components/StockCard";
import FixedOptionCard from "./components/FixedOptionCard";
import FixedStockCard from "./components/FixedStockCard";

const App: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string>("home"); // State to track the active screen
  const [fixedID, setFixedID] = useState<string>("");

  const { startStockStream } = usePriceStream();

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
            <HomePage setActiveCard={setActiveCard} setFixedID={setFixedID} />
          )}
          {activeCard === "options" && (
            <OptionCard setActiveCard={setActiveCard} />
          )}
          {activeCard == "stock" && (
            <StockCard setActiveCard={setActiveCard} setFixedID={setFixedID} />
          )}
          {activeCard == "fixedStock" && (
            <FixedStockCard
              setActiveCard={setActiveCard}
              setFixedID={setFixedID}
              fixedID={fixedID}
            />
          )}
          {activeCard == "fixedOption" && (
            <FixedOptionCard setActiveCard={setActiveCard} fixedID={fixedID} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

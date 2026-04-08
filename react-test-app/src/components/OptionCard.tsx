import React from "react";
import { useState } from "react";

import OptionsSearchBar from "./OptionsSearchBar";
import { OptionWSComponent } from "./OptionGraph";

interface OptionCardProps {
  setActiveCard: (query: string) => void;
  activePortfolio: number;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  setActiveCard,
  activePortfolio,
}) => {
  const [underlyingStock, setUnderlyingStock] = useState<string>("");
  const [optionDay, setOptionDay] = useState<string>("");
  const [optionMonth, setOptionMonth] = useState<string>("");
  const [optionYear, setOptionYear] = useState<string>("");
  const [strikePrice, setStrikePrice] = useState<string>("");
  const [optionType, setOptionType] = useState<string>("");
  return (
    <div
      className="options-terminal-wrapper"
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevents the main body from scrolling
      }}
    >
      {/* --- Navigation & Command Input Bar --- */}
      <header
        className="d-flex align-items-center gap-3 p-2"
        style={{
          borderBottom: "1px solid #222",
          backgroundColor: "#050505",
          zIndex: 10,
        }}
      >
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setActiveCard("home")}
          style={{
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
            borderColor: "#444",
          }}
        >
          ← ESC
        </button>

        {/* Horizontal Input Row */}
        <div
          className="d-flex flex-grow-1 align-items-center gap-2 overflow-x-auto no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          <OptionsSearchBar
            setSearchQuery={setUnderlyingStock}
            searchQuery={underlyingStock}
            inputMessage="TICKER"
            onEnter={setUnderlyingStock}
            onSearchClick={setUnderlyingStock}
          />

          <OptionsSearchBar
            setSearchQuery={setStrikePrice}
            searchQuery={strikePrice}
            inputMessage="STRIKE"
            onEnter={setStrikePrice}
            onSearchClick={setStrikePrice}
          />

          {/* Date Cluster */}
          <div
            className="d-flex gap-1 align-items-center px-2"
            style={{
              borderLeft: "1px solid #333",
              borderRight: "1px solid #333",
            }}
          >
            <OptionsSearchBar
              setSearchQuery={setOptionDay}
              searchQuery={optionDay}
              inputMessage="DD"
              onEnter={setOptionDay}
              onSearchClick={setOptionDay}
            />
            <OptionsSearchBar
              setSearchQuery={setOptionMonth}
              searchQuery={optionMonth}
              inputMessage="MM"
              onEnter={setOptionMonth}
              onSearchClick={setOptionMonth}
            />
            <OptionsSearchBar
              setSearchQuery={setOptionYear}
              searchQuery={optionYear}
              inputMessage="YYYY"
              onEnter={setOptionYear}
              onSearchClick={setOptionYear}
            />
          </div>

          <OptionsSearchBar
            setSearchQuery={setOptionType}
            searchQuery={optionType}
            inputMessage="CALL/PUT"
            onEnter={setOptionType}
            onSearchClick={setOptionType}
          />
        </div>
      </header>

      {/* --- Live Stream & Trading Engine Area --- */}
      <main
        className="flex-grow-1"
        style={{
          position: "relative",
          minHeight: 0, // Crucial for inner flex children to scroll/resize correctly
        }}
      >
        <OptionWSComponent
          stockSymbol={underlyingStock}
          strikePrice={strikePrice}
          year={optionYear}
          month={optionMonth}
          day={optionDay}
          type={optionType}
          activePortfolio={activePortfolio}
        />
      </main>
    </div>
  );
};

export default OptionCard;

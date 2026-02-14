import React from "react";
import { useState } from "react";

import OptionsSearchBar from "./OptionsSearchBar";
import { OptionWSComponent } from "./OptionGraph";

interface OptionCardProps {
  setActiveCard: (query: string) => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({ setActiveCard }) => {
  const [underlyingStock, setUnderlyingStock] = useState<string>("");
  const [optionDay, setOptionDay] = useState<string>("");
  const [optionMonth, setOptionMonth] = useState<string>("");
  const [optionYear, setOptionYear] = useState<string>("");
  const [strikePrice, setStrikePrice] = useState<string>("");
  const [optionType, setOptionType] = useState<string>("");
  return (
    <div
      className="card bg-dark text-white" // Bootstrap classes for dark mode
      style={{
        width: "100%",
        height: "98vh",
        margin: "0",
        borderRadius: "0",
        border: "none",
        backgroundColor: "#000000", // Overriding to true black
        overflow: "hidden",
      }}
    >
      <button
        className="btn btn-secondary"
        onClick={() => setActiveCard("home")}
      >
        Back to Home
      </button>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <OptionsSearchBar
          setSearchQuery={setUnderlyingStock}
          searchQuery={underlyingStock}
          inputMessage="Underlying Stock..."
          onEnter={setUnderlyingStock}
          onSearchClick={setUnderlyingStock}
        />
        <OptionsSearchBar
          setSearchQuery={setStrikePrice}
          searchQuery={strikePrice}
          inputMessage="Strike Price..."
          onEnter={setStrikePrice}
          onSearchClick={setStrikePrice}
        />
        <OptionsSearchBar
          setSearchQuery={setOptionDay}
          searchQuery={optionDay}
          inputMessage="Expiration Day..."
          onEnter={setOptionDay}
          onSearchClick={setOptionDay}
        />
        <OptionsSearchBar
          setSearchQuery={setOptionMonth}
          searchQuery={optionMonth}
          inputMessage="Expiration Month..."
          onEnter={setOptionMonth}
          onSearchClick={setOptionMonth}
        />
        <OptionsSearchBar
          setSearchQuery={setOptionYear}
          searchQuery={optionYear}
          inputMessage="Expiration Year..."
          onEnter={setOptionYear}
          onSearchClick={setOptionYear}
        />
        <OptionsSearchBar
          setSearchQuery={setOptionType}
          searchQuery={optionType}
          inputMessage="Option Type..."
          onEnter={setOptionType}
          onSearchClick={setOptionType}
        />
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
  );
};

export default OptionCard;

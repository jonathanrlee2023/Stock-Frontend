import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { on } from "process";
import { useButtons } from "./ButtonContext";
import { usePriceStream } from "./PriceContext";
import "../../App.css";

interface SearchBarProps {
  setSearchQuery: (query: string) => void; // Function to update search query
  searchQuery: string; // Prop to hold the current search query
  inputMessage: string;
  onEnter: (input: string) => void; // NEW
  onSearchClick: (input: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  setSearchQuery,
  searchQuery,
  inputMessage,
  onEnter,
  onSearchClick,
}) => {
  const [inputValue, setInputValue] = useState<string>(searchQuery); // Local state to keep input value
  const { buttons, setButtons } = useButtons();
  const { pendingRequests, startStockStream } = usePriceStream();
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(inputValue);
      onEnter(inputValue);
      if (inputValue.trim() !== "" && !buttons.includes(inputValue)) {
        setButtons((prev) => [...prev, inputValue]);
      }
    }
  };

  const handleSearchClick = async () => {
    setSearchQuery(inputValue);
    onSearchClick(inputValue);

    if (inputValue.trim() !== "" && !buttons.includes(inputValue)) {
      setButtons((prev) => [...prev, inputValue]);
    }
  };
  const handleButtonClick = (value: string) => {
    setSearchQuery(value);
    setInputValue(value);
    onSearchClick(value);
  };

  return (
    <>
      {/* Main Search Row */}
      <div className="d-flex justify-content-center align-items-center mb-4 mt-2 px-2">
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "500px", // Reduced this so the button stays close
          }}
        >
          <input
            className="search-bar"
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "24px",
              paddingLeft: "45px",
              color: "white",
              height: "45px", // Match button height
            }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search symbol..."
          />
          <span
            style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.5,
            }}
          >
            🔍
          </span>
        </div>

        <button
          className="btn-sleek ms-2" // ms-2 adds a small gap
          type="button"
          onClick={handleSearchClick}
          disabled={pendingRequests.has(inputValue.toUpperCase())}
        >
          {pendingRequests.has(inputValue.toUpperCase()) ? "..." : "Search"}
        </button>
      </div>

      {/* Recent Buttons Section */}
      <div className="d-flex flex-wrap justify-content-center px-4">
        {buttons.map((btnLabel) => (
          <button
            className="btn-sleek me-2 mb-2"
            key={btnLabel}
            type="button"
            onClick={() => handleButtonClick(btnLabel)}
          >
            {btnLabel}
          </button>
        ))}
      </div>
    </>
  );
};

export default SearchBar;

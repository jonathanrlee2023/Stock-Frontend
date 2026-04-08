import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { on } from "process";
import { useButtons } from "./ButtonContext";
import { usePriceStream } from "./PriceContext";
import "../../App.css";
import { useWS } from "./WSContest";

interface SearchBarProps {
  setSearchQuery: (query: string) => void; // Function to update search query
  searchQuery: string; // Prop to hold the current search query
  inputMessage: string;
  onEnter: (input: string) => void; // NEW
  onSearchClick: (input: string) => void;
  setPreviousID: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  setSearchQuery,
  searchQuery,
  onEnter,
  onSearchClick,
  setPreviousID,
}) => {
  const [inputValue, setInputValue] = useState<string>(searchQuery); // Local state to keep input value
  const [showDropdown, setShowDropdown] = useState(false); // Track visibility
  const searchContainerRef = useRef<HTMLDivElement>(null); // To detect clicks outside
  const { buttons, setButtons } = useButtons();
  const { pendingRequests, startStockStream } = usePriceStream();
  const { previousID } = useWS();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the clicked element is NOT inside our searchContainerRef, close it
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRecent = (value: string) => {
    setInputValue(value);
    setSearchQuery(value);
    onSearchClick(value);
    setPreviousID(value);
    setShowDropdown(false);
  };
  const filteredHistory = buttons.filter((item) =>
    item.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleSearchClick = async () => {
    setSearchQuery(inputValue);
    onSearchClick(inputValue);
    setPreviousID(inputValue);
    setShowDropdown(false); // Close after searching

    if (inputValue.trim() !== "" && !buttons.includes(inputValue)) {
      setButtons((prev) => [...prev, inputValue]);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center px-3 py-2"
      style={{
        backgroundColor: "#050505",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <div
        ref={searchContainerRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <div style={{ position: "relative", display: "flex", gap: "0px" }}>
          {/* Symbol Icon/Prefix */}
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7e7cf3",
              fontSize: "0.7rem",
              fontWeight: "900",
              fontFamily: "monospace",
              pointerEvents: "none",
            }}
          >
            $
          </div>

          <input
            className="search-bar w-100"
            style={{
              backgroundColor: "#000",
              border: "1px solid #333",
              borderRadius: "2px", // Sharp corners
              padding: "8px 12px 8px 30px",
              color: "#00ff88", // Active terminal green text
              height: "38px",
              fontSize: "0.85rem",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#7e7cf3";
              e.target.style.boxShadow = "0 0 8px rgba(126, 124, 243, 0.2)";
              setShowDropdown(true);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#333";
              e.target.style.boxShadow = "none";
            }}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value.toUpperCase()); // Force uppercase for symbols
              setShowDropdown(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchClick();
                setShowDropdown(false);
              }
            }}
            placeholder="ENTER_TICKER_ID..."
          />

          {/* DROPDOWN MENU */}
          {showDropdown && filteredHistory.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "#0a0a0a",
                border: "1px solid #333",
                borderTop: "none",
                zIndex: 10000,
                boxShadow: "0px 10px 20px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  padding: "6px 12px",
                  fontSize: "9px",
                  color: "#444",
                  fontWeight: "800",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                RECENT_QUERIES
              </div>
              {filteredHistory.map((item, index) => (
                <div
                  key={index}
                  className="dropdown-item-custom"
                  onClick={() => handleSelectRecent(item)}
                  style={{
                    padding: "10px 15px",
                    color: "#ccc",
                    fontSize: "0.8rem",
                    fontFamily: "monospace",
                    cursor: "pointer",
                    borderBottom: "1px solid #111",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{item}</span>
                  <span style={{ color: "#333", fontSize: "0.7rem" }}>
                    SELECT ↵
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        className="btn-sleek ms-2"
        type="button"
        style={{
          height: "38px",
          borderRadius: "2px",
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          fontSize: "0.7rem",
          fontWeight: "bold",
          padding: "0 20px",
        }}
        onClick={handleSearchClick}
        disabled={pendingRequests.has(inputValue.toUpperCase())}
      >
        {pendingRequests.has(inputValue.toUpperCase())
          ? "LOADING..."
          : "SEARCH"}
      </button>
    </div>
  );
};

export default SearchBar;

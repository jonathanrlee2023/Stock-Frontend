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
    <>
      {/* Main Search Row */}
      <div className="d-flex justify-content-center align-items-center mb-4 mt-2 px-2">
        <div
          ref={searchContainerRef}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "500px",
          }}
        >
          <div style={{ position: "relative", flexGrow: 1 }}>
            <input
              className="search-bar w-100"
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "24px",
                paddingLeft: "45px",
                color: "white",
                height: "45px",
              }}
              value={inputValue}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchClick();
                  setShowDropdown(false);
                }
              }}
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

            {/* DROPDOWN MENU */}
            {showDropdown && filteredHistory.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  zIndex: 1000,
                  overflow: "hidden",
                  boxShadow: "0px 8px 16px rgba(0,0,0,0.5)",
                }}
              >
                {filteredHistory.map((item, index) => (
                  <div
                    key={index}
                    className="dropdown-item-custom"
                    onClick={() => handleSelectRecent(item)}
                    style={{
                      padding: "10px 20px",
                      color: "white",
                      cursor: "pointer",
                      borderBottom:
                        index !== filteredHistory.length - 1
                          ? "1px solid #222"
                          : "none",
                    }}
                  >
                    <span style={{ opacity: 0.6, marginRight: "10px" }}>
                      🕒
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
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
    </>
  );
};

export default SearchBar;

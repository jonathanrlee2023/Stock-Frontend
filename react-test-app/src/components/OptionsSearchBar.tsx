import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
interface OptionsSearchBarProps {
  setSearchQuery: (query: string) => void; // Function to update search query
  searchQuery: string; // Prop to hold the current search query
  inputMessage: string;
  onEnter: (input: string) => void; // NEW
  onSearchClick: (input: string) => void;
}

const OptionsSearchBar: React.FC<OptionsSearchBarProps> = ({
  setSearchQuery,
  searchQuery,
  inputMessage,
  onEnter,
  onSearchClick,
}) => {
  const [inputValue, setInputValue] = useState<string>(searchQuery); // Local state to keep input value

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(inputValue);
      onEnter(inputValue);
    }
  };

  const handleSearchClick = async () => {
    setSearchQuery(inputValue);
    onSearchClick(inputValue);
  };

  return (
    <div
      className="d-flex align-items-center"
      style={{
        flex: "1 1 auto",
        // Remove individual margins, handle them in the parent with gap-0
      }}
    >
      <input
        type="text"
        className="search-bar search-bar-small flex-grow-1"
        style={{
          // ... previous styles
          border: "1px solid #222",
          borderRight: "none", // Input joins button
          borderRadius: "0", // Sharp edges for a more industrial look
        }}
        placeholder={inputMessage}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="btn-sleek btn-sleek-short d-flex align-items-center justify-content-center"
        type="button"
        style={{
          // ... previous styles
          border: "1px solid #222",
          backgroundColor: "#0a0a0a",
          borderRadius: "0",
        }}
        onClick={handleSearchClick}
      >
        <span style={{ fontSize: "0.8rem", filter: "grayscale(100%)" }}>
          ✅
        </span>
      </button>
    </div>
  );
};

export default OptionsSearchBar;

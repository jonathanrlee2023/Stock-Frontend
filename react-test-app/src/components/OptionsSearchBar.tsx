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
    <div className="d-flex mb-2 mt-2 mx-2 w-100" style={{ maxWidth: "15%" }}> 
      <input
        type="text"
        className="search-bar search-bar-small flex-grow-1"
        style={{ minWidth: "150px" }}
        placeholder={inputMessage}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="btn-sleek btn-sleek-short d-flex align-items-center justify-content-center"
        type="button"
        style={{ 
          minWidth: "40px",
          padding: "0",
          aspectRatio: "1/1"
        }}
        onClick={handleSearchClick}
      >
        <span style={{ lineHeight: "1" }}>✅</span>
      </button>
    </div>
  );
};

export default OptionsSearchBar;

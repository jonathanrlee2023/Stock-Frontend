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
    <div className="d-flex mb-2 mt-2 mx-2" style={{ maxWidth: "800px" }}>
      <input
        type="text"
        className="search-bar"
        placeholder={inputMessage}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} // Update local state
        onKeyDown={handleKeyDown} // Handle Enter key press
      />
      <button
        className="btn-sleek"
        type="button"
        onClick={handleSearchClick} // Handle search button click
        style={{ fontSize: "8px", width: "175px" }}
      >
        Confirm
      </button>
    </div>
  );
};

export default OptionsSearchBar;

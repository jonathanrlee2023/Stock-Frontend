import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { on } from "process";

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
    <div className="input-group my-3">
      <input
        type="text"
        className="form-control"
        placeholder={inputMessage}
        value={inputValue} // Use local state for the input field value
        onChange={(e) => setInputValue(e.target.value)} // Update local state
        onKeyDown={handleKeyDown} // Handle Enter key press
      />
      <button
        className="btn btn-primary"
        type="button"
        onClick={handleSearchClick} // Handle search button click
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;

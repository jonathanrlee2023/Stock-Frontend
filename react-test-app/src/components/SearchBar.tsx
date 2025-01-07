import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface SearchBarProps {
  setSearchQuery: (query: string) => void; // Function to update search query
  searchQuery: string; // Prop to hold the current search query
}

const SearchBar: React.FC<SearchBarProps> = ({
  setSearchQuery,
  searchQuery,
}) => {
  const [inputValue, setInputValue] = useState<string>(searchQuery); // Local state to keep input value

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(inputValue); // Update the global search query state on Enter key press
    }
  };

  const handleSearchClick = () => {
    setSearchQuery(inputValue); // Update the global search query state on button click
  };

  return (
    <div className="input-group my-3">
      <input
        type="text"
        className="form-control"
        placeholder="Enter stock symbol..."
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

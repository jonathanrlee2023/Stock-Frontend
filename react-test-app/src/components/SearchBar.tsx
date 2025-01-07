import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface SearchBarProps {
  setSearchQuery: (query: string) => void; // Function to update search query
}

const SearchBar: React.FC<SearchBarProps> = ({ setSearchQuery }) => {
  const [inputValue, setInputValue] = useState<string>(""); // Local input state

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(inputValue);
    }
  };

  const handleSearchClick = () => {
    setSearchQuery(inputValue); // Pass inputValue to parent on button click
  };

  return (
    <div className="input-group my-3">
      <input
        type="text"
        className="form-control"
        placeholder="Enter stock symbol..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} // Update local state
        onKeyDown={handleKeyDown} // Handle Enter key press
      />
      <button
        className="btn btn-primary"
        type="button"
        onClick={handleSearchClick} // Handle button click
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;

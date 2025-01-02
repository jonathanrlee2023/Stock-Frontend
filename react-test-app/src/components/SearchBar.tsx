import React, { useState } from "react";

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

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Enter stock symbol..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} // Update local state
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default SearchBar;

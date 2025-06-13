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

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(inputValue); // Update the global search query state on Enter key press
      try {
        // Replace with your actual API endpoint
        const response = await fetch(
          `http://localhost:8080/startStockStream?symbol=${inputValue}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text();
      } catch (error) {
        console.error("API call failed:", error);
      }
    }
  };

  const handleSearchClick = async () => {
    setSearchQuery(inputValue); // Update the global search query state on button click
    try {
      // Replace with your actual API endpoint
      const response = await fetch(
        `http://localhost:8080/startStockStream?symbol=${inputValue}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.text();
    } catch (error) {
      console.error("API call failed:", error);
    }
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

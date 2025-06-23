import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { on } from "process";
import { useButtons } from "./ButtonContext";

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
  const { buttons, setButtons } = useButtons();
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(inputValue);
      onEnter(inputValue);
      if (inputValue.trim() !== "" && !buttons.includes(inputValue)) {
        setButtons((prev) => [...prev, inputValue]);
      }
    }
  };

  const handleSearchClick = async () => {
    setSearchQuery(inputValue);
    onSearchClick(inputValue);

    if (inputValue.trim() !== "" && !buttons.includes(inputValue)) {
      setButtons((prev) => [...prev, inputValue]);
    }
  };
  const handleButtonClick = (value: string) => {
    setSearchQuery(value);
    setInputValue(value);
    onSearchClick(value);
  };

  return (
    <>
      <div className="d-flex mb-2 mt-2 mx-2">
        <input
          type="text"
          className="form-control"
          placeholder={inputMessage}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleSearchClick}
        >
          Search
        </button>
      </div>

      <div>
        {buttons.map((btnLabel) => (
          <button
            key={btnLabel}
            type="button"
            className="btn btn-success me-2 mb-2 mx-2"
            onClick={() => handleButtonClick(btnLabel)}
          >
            {btnLabel}
          </button>
        ))}
      </div>
    </>
  );
};

export default SearchBar;

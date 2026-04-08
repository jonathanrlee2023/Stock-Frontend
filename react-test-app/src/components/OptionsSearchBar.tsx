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
      className="d-flex align-items-center gap-1"
      style={{
        flex: "1 1 auto",
        backgroundColor: "transparent",
      }}
    >
      <input
        type="text"
        className="search-bar search-bar-small flex-grow-1"
        style={{
          border: "1px solid #222",
          borderRight: "none",
          borderRadius: "0",
          backgroundColor: "#050505",
          color: "#fff",
          height: "32px", // Explicit height to match button
          fontSize: "0.75rem",
          paddingLeft: "10px",
        }}
        placeholder={inputMessage}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        style={{
          height: "40px", // Match input height
          padding: "0 12px",
          backgroundColor: "#0a0a0a",
          border: "1px solid #222",
          borderRadius: "0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.1s ease-in-out",
        }}
        onClick={handleSearchClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#7e7cf3";
          e.currentTarget.style.backgroundColor = "#111";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#222";
          e.currentTarget.style.backgroundColor = "#0a0a0a";
        }}
      >
        <span
          style={{
            fontSize: "0.6rem",
            fontFamily: "monospace",
            fontWeight: "900", // Extra heavy for that "system label" feel
            color: "#7e7cf3",
            letterSpacing: "1.5px",
          }}
        >
          EXEC
        </span>
      </button>
    </div>
  );
};

export default OptionsSearchBar;

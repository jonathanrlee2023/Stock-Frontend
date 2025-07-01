import React, { useEffect, useRef } from "react";
import { useWS } from "./WSContest";

interface IdButtonsProps {
  setActiveID: (query: string) => void;
  setActiveCard: (query: string) => void;
}

export const IdButtons: React.FC<IdButtonsProps> = ({
  setActiveID,
  setActiveCard,
}) => {
  const { ids, setIds } = useWS();
  const previousIdsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    previousIdsRef.current = ids; // just track the latest ids
  }, [ids]);

  const handleButtonClick = (id: string) => {
    setActiveID(id);
    if (id.length > 6) {
      setActiveCard("fixedOption");
    } else {
      setActiveCard("fixedStock");
    }
  };

  return (
    <div className="d-flex gap-2 mb-2 mx-2">
      {Object.entries(ids).map(([id, amount]) => (
        <button
          key={id + " Amount: " + amount}
          onClick={() => handleButtonClick(id)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#4200bd",
            color: "white",
          }}
        >
          {id} ({amount})
        </button>
      ))}
    </div>
  );
};

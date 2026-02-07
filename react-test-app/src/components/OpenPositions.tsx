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
    setActiveCard(id.length > 6 ? "fixedOption" : "fixedStock");
  };

  return (
    <div className="d-flex gap-2 mb-2 mx-2">
      {Object.keys(ids).length === 0 ? (
        // 2. Return the fallback UI
        <div style={{ color: "#666", padding: "8px", fontStyle: "italic" }}>
          No open Positions
        </div>
      ) : (
        Object.entries(ids).map(([id, amount]) => (
          <button
            className="btn btn-primary btn-lg mb-3 mx-2"
            key={id} // Best to use just 'id' as the key
            onClick={() => handleButtonClick(id)}
            // style={{
            //   padding: "8px 12px",
            //   borderRadius: "6px",
            //   border: "none",
            //   cursor: "pointer",
            //   backgroundColor: "#4200bd",
            //   color: "white",
            // }}
          >
            {id} ({amount})
          </button>
        ))
      )}
    </div>
  );
};

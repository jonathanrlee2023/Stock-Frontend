import React, { useEffect, useRef, useState } from "react";
import { useWS } from "./WSContest";
import { usePriceStream } from "./PriceContext";

interface IdButtonsProps {
  setActiveID: (query: string) => void;
  setActiveCard: (query: string) => void;
}

export const IdButtons: React.FC<IdButtonsProps> = ({
  setActiveID,
  setActiveCard,
}) => {
  const { ids } = useWS();
  const previousIdsRef = useRef<Record<string, number>>({});
  const { historicalStockPoints } = usePriceStream();
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set(),
  );

  const startStockStream = (symbol: string) => {
    if (historicalStockPoints[symbol]) return;
    if (pendingRequests.has(symbol)) return;
    setPendingRequests((prev) => new Set(prev).add(symbol));
    fetch(`http://localhost:8080/startStockStream?symbol=${symbol}`)
      .then((res) => res.text())
      .then((data) => console.log("Data:", data))
      .catch((err) => console.error("API error:", err))
      .finally(() => {
        // 4. Clean up pending state regardless of success or failure
        setPendingRequests((prev) => {
          const next = new Set(prev);
          next.delete(symbol);
          return next;
        });
      });
  };

  useEffect(() => {
    previousIdsRef.current = ids; // just track the latest ids
  }, [ids]);

  const handleButtonClick = (id: string) => {
    startStockStream(id);
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
            className="btn-sleek mb-3 mx-2"
            key={id} // Best to use just 'id' as the key
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
        ))
      )}
    </div>
  );
};

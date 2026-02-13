import React, { useEffect, useRef } from "react";
import { useWS } from "./WSContest";

interface TrackerButtonsProps {
  setActiveID: (query: string) => void;
  setActiveCard: (query: string) => void;
}

export const TrackerButtons: React.FC<TrackerButtonsProps> = ({
  setActiveID,
  setActiveCard,
}) => {
  const { trackers, setTrackers } = useWS();
  const previousTrackersRef = useRef<string[]>([]);

  useEffect(() => {
    previousTrackersRef.current = trackers; // just track the latest ids
  }, [trackers]);

  const handleButtonClick = (id: string) => {
    setActiveID(id);
    if (id.length > 6) {
      setActiveCard("fixedOption");
    } else {
      setActiveCard("fixedStock");
    }
  };

  return (
    <div className="d-flex flex-wrap gap-2 mb-2 mx-2">
      {trackers.map((tracker) => (
        <button
          key={tracker}
          onClick={() => handleButtonClick(tracker)}
          className="btn-sleek"
        >
          {tracker}
        </button>
      ))}
    </div>
  );
};

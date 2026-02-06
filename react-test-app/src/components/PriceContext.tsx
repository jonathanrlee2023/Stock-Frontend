import React, { createContext, useContext, useState, useEffect } from "react";

export type OptionPoint = {
  Symbol: string; // Capitalized in JSON
  Mark: number; // Capitalized in JSON
  timestamp: number; // Lowercase in JSON
  IV: number; // Double-check Go tags for these
  Delta: number;
  Gamma: number;
  Theta: number;
  Vega: number;
};

export type StockPoint = {
  Symbol: string;
  Mark: number; // Changed from 'Mark' to 'Mark'
  timestamp: number;
};

type PriceStreamContextValue = {
  optionPoints: Record<string, OptionPoint[]>;
  stockPoints: Record<string, StockPoint[]>;
  updateOptionPoint: (symbol: string, point: OptionPoint) => void;
  updateStockPoint: (symbol: string, point: StockPoint) => void;
};

const PriceStreamContext = createContext<PriceStreamContextValue | undefined>(
  undefined,
);

export const PriceStreamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [optionPoints, setOptionPoints] = useState<
    Record<string, OptionPoint[]>
  >({});
  const [stockPoints, setStockPoints] = useState<Record<string, StockPoint[]>>(
    {},
  );

  const updateOptionPoint = (symbol: string, point: OptionPoint) => {
    setOptionPoints((prev) => {
      const prevPoints = prev[symbol] || [];
      return {
        ...prev,
        [symbol]: [...prevPoints.slice(-99), point],
      };
    });
  };

  const updateStockPoint = (symbol: string, point: StockPoint) => {
    setStockPoints((prev) => {
      const prevPoints = prev[symbol] || [];
      return {
        ...prev,
        [symbol]: [...prevPoints.slice(-99), point],
      };
    });
  };

  return (
    <PriceStreamContext.Provider
      value={{
        optionPoints,
        stockPoints,
        updateOptionPoint,
        updateStockPoint,
      }}
    >
      {children}
    </PriceStreamContext.Provider>
  );
};

export const usePriceStream = () => {
  const ctx = useContext(PriceStreamContext);
  if (!ctx) {
    throw new Error("usePriceStream must be used inside PriceStreamProvider");
  }
  return ctx;
};

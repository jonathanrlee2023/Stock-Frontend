import React, { createContext, useContext, useState, useEffect } from "react";

type PricePoint = {
  mark: number;
  timestamp: number;
};

type Greeks = {
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
};

type PriceStreamContextValue = {
  symbolPricePoints: Record<string, PricePoint[]>;
  updatePricePoint: (symbol: string, point: PricePoint) => void;
  greeks: Record<
    string,
    { iv: number; delta: number; gamma: number; theta: number; vega: number }
  >;
  updateGreeks: (symbol: string, g: Greeks) => void;
};

const PriceStreamContext = createContext<PriceStreamContextValue | undefined>(
  undefined
);

export const PriceStreamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [symbolPricePoints, setSymbolPricePoints] = useState<
    Record<string, PricePoint[]>
  >({});
  const [greeks, setGreeks] = useState<
    Record<
      string,
      { iv: number; delta: number; gamma: number; theta: number; vega: number }
    >
  >({});

  const updatePricePoint = (symbol: string, point: PricePoint) => {
    setSymbolPricePoints((prev) => {
      const prevPoints = prev[symbol] || [];
      return {
        ...prev,
        [symbol]: [...prevPoints.slice(-99), point],
      };
    });
  };

  const updateGreeks = (
    symbol: string,
    g: { iv: number; delta: number; gamma: number; theta: number; vega: number }
  ) => {
    setGreeks((prev) => ({
      ...prev,
      [symbol]: g,
    }));
  };

  return (
    <PriceStreamContext.Provider
      value={{ symbolPricePoints, updatePricePoint, greeks, updateGreeks }}
    >
      {children}
    </PriceStreamContext.Provider>
  );
};

export const usePriceStream = () => {
  const ctx = useContext(PriceStreamContext);
  if (!ctx)
    throw new Error("useOptionStream must be used inside OptionStreamProvider");
  return ctx;
};

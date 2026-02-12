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
  Mark: number;
  BidPrice: number;
  AskPrice: number;
  LastPrice: number;
  timestamp: number;
};

export type HistoricalStockPoint = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
};

export type CompanyStats = {
  Symbol: string;
  MarketCap: number;
  PEG: number | null;
  Sloan: number | null;
  ROIC: number | null;
  HistGrowth: number | null;
  ForecastedGrowth: number | null;
  TrailingPEG: number | null;
  ForwardPEG: number | null;
  IntrinsicPrice: number | null;
  DividendPrice: number | null;
  PriceAtReport: number | null;
  WACC: number | null;
  FCFF: number | null;
  FCF: number | null;
  NWC: number | null;
  PriceTarget: number | null;
  StrongBuy: number | null;
  Buy: number | null;
  Hold: number | null;
  Sell: number | null;
  StrongSell: number | null;
  PriceHistory: HistoricalStockPoint[] | null;
};

type PriceStreamContextValue = {
  optionPoints: Record<string, OptionPoint[]>;
  stockPoints: Record<string, StockPoint[]>;
  companyStats: Record<string, CompanyStats>;
  historicalStockPoints: Record<string, HistoricalStockPoint[]>;
  updateOptionPoint: (symbol: string, point: OptionPoint) => void;
  updateStockPoint: (symbol: string, point: StockPoint) => void;
  updateCompanyStats: (symbol: string, stats: CompanyStats) => void;
  updateHistoricalStockPoint: (
    symbol: string,
    point: HistoricalStockPoint[],
  ) => void;
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
  const [companyStats, setCompanyStats] = useState<
    Record<string, CompanyStats>
  >({});
  const [historicalStockPoints, setHistoricalStockPoints] = useState<
    Record<string, HistoricalStockPoint[]>
  >({});

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

  const updateCompanyStats = (symbol: string, stats: CompanyStats) => {
    setCompanyStats((prev) => ({
      ...prev,
      [symbol]: stats,
    }));
  };

  const updateHistoricalStockPoint = (
    symbol: string,
    newPoints: HistoricalStockPoint[],
  ) => {
    setHistoricalStockPoints((prev) => {
      const prevPoints = prev[symbol] || [];
      if (prevPoints.length > 0) {
        return prev;
      }
      const combined = [...prevPoints, ...newPoints];
      return {
        ...prev,
        [symbol]: combined,
      };
    });
  };

  return (
    <PriceStreamContext.Provider
      value={{
        optionPoints,
        stockPoints,
        companyStats,
        historicalStockPoints,
        updateOptionPoint,
        updateStockPoint,
        updateCompanyStats,
        updateHistoricalStockPoint,
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

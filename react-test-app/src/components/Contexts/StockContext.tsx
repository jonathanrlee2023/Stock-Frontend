import { createContext, useCallback, useContext, useState } from "react";

export type HistoricalStockPoint = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
};

export type StockPoint = {
  Symbol: string;
  Mark: number;
  BidPrice: number;
  AskPrice: number;
  LastPrice: number;
  timestamp: number;
};

interface StockContextValue {
  stockPoints: Record<string, StockPoint[]>;
  historicalStockPoints: Record<string, HistoricalStockPoint[]>;
  updateHistoricalStockPoint: (
    symbol: string,
    point: HistoricalStockPoint[],
  ) => void;
  updateStockPoint: (symbol: string, point: StockPoint) => void;
  pendingRequests: Set<string>;
}

const StockContext = createContext<StockContextValue | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stockPoints, setStockPoints] = useState<Record<string, StockPoint[]>>(
    {},
  );
  const [historicalStockPoints, setHistoricalStockPoints] = useState<
    Record<string, HistoricalStockPoint[]>
  >({});
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set(),
  );

  const updateStockPoint = useCallback((symbol: string, point: StockPoint) => {
    setStockPoints((prev) => ({
      ...prev,
      [symbol]: [...(prev[symbol] || []).slice(-1920), point],
    }));
  }, []);

  const updateHistoricalStockPoint = useCallback(
    (symbol: string, point: HistoricalStockPoint[]) => {
      setHistoricalStockPoints((prev) => ({
        ...prev,
        [symbol]: [...(prev[symbol] || []).slice(-1920), ...point],
      }));
    },
    [],
  );

  return (
    <StockContext.Provider
      value={{
        stockPoints,
        updateStockPoint,
        pendingRequests,
        historicalStockPoints,
        updateHistoricalStockPoint,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStockContext must be inside StockProvider");
  return ctx;
};

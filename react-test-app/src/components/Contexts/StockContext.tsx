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

export interface BacktestPoint {
  datetime: string;
  Capital: number;
}

export interface ValueAtRisk {
  alpha: number;
  value: number;
}

export interface PerformanceMetrics {
  total_return: number;
  cagr: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  annualized_volatility: number;
  standard_deviation: number;
  period_mean_return: number;
}

export interface RiskMetrics {
  max_drawdown: number;
  var: ValueAtRisk;
  cvar: ValueAtRisk;
}

export interface CountMetrics {
  periods: number;
}

export interface BacktestStats {
  performance: PerformanceMetrics;
  risk: RiskMetrics;
  counts: CountMetrics;
  period_dynamics: PeriodDynamics;
}
export interface PeriodDynamics {
  profit_factor_ratio: number;
  win_rate: number;
}
export interface BacktestPayload {
  User: BacktestPoint[];
  Benchmark: BacktestPoint[];
  Stats: BacktestStats;
  ClientID: string;
}

interface StockContextValue {
  stockPoints: Record<string, StockPoint[]>;
  backtestPayload: BacktestPayload | null;
  historicalStockPoints: Record<string, HistoricalStockPoint[]>;
  updateHistoricalStockPoint: (
    symbol: string,
    point: HistoricalStockPoint[],
  ) => void;
  updateStockPoint: (symbol: string, point: StockPoint) => void;
  updateBacktestPayload: (data: BacktestPayload | null) => void;
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

  const [backtestPayload, setBacktestPayload] =
    useState<BacktestPayload | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set(),
  );

  const updateBacktestPayload = (data: BacktestPayload | null) => {
    setBacktestPayload(data);
  };

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
        [symbol]: point,
      }));
    },
    [],
  );

  return (
    <StockContext.Provider
      value={{
        stockPoints,
        backtestPayload,
        updateStockPoint,
        pendingRequests,
        historicalStockPoints,
        updateHistoricalStockPoint,
        updateBacktestPayload,
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

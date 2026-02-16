import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

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
  Quote: StockPoint | null;
};

export type OptionExpiration = {
  Call: string[];
  Put: string[];
};

type PriceStreamContextValue = {
  optionPoints: Record<string, OptionPoint[]>;
  stockPoints: Record<string, StockPoint[]>;
  companyStats: Record<string, CompanyStats>;
  historicalStockPoints: Record<string, HistoricalStockPoint[]>;
  pendingRequests: Set<string>;
  optionExpirations: Record<string, OptionExpiration>;
  startStockStream: (symbol: string) => Promise<void>;
  startOptionStream: (
    stockSymbol: string,
    strikePrice: string,
    day: string,
    month: string,
    year: string,
    type: string,
  ) => Promise<void>;
  updateOptionPoint: (symbol: string, point: OptionPoint) => void;
  updateStockPoint: (symbol: string, point: StockPoint) => void;
  updateCompanyStats: (symbol: string, stats: CompanyStats) => void;
  updateHistoricalStockPoint: (
    symbol: string,
    point: HistoricalStockPoint[],
  ) => void;
  updateOptionExpirations: (
    symbol: string,
    expirations: OptionExpiration,
  ) => void;
};

const PriceStreamContext = createContext<PriceStreamContextValue | undefined>(
  undefined,
);

function formatOptionSymbol(
  stock: string,
  day: string,
  month: string,
  year: string,
  type: string,
  strike: string,
): string {
  const yy = year.length === 4 ? year.slice(2) : year; // Convert YYYY to YY if needed
  const typeLetter = type.toUpperCase().startsWith("C") ? "C" : "P";

  // Convert strike price string to number, then format
  const strikeNum = parseFloat(strike);
  const strikeStr = (strikeNum * 1000).toFixed(0).padStart(8, "0");

  return `${stock.toUpperCase()}_${yy}${month.padStart(2, "0")}${day.padStart(
    2,
    "0",
  )}${typeLetter}${strikeStr}`;
}

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

  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set(),
  );

  const [optionExpirations, setOptionExpirations] = useState<
    Record<string, OptionExpiration>
  >({});

  const startStockStream = useCallback(
    async (symbol: string) => {
      const cleanSymbol = symbol.toUpperCase().trim();

      // 1. Guard: Don't fetch if we have data OR if a request is already flying
      if (
        historicalStockPoints[cleanSymbol] ||
        pendingRequests.has(cleanSymbol)
      )
        return;

      // 2. Mark as pending
      setPendingRequests((prev) => new Set(prev).add(cleanSymbol));

      // 3. Setup Timeout Controller (Cancel fetch if cloud takes > 5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const baseUrl = "http://localhost:8080";
        const response = await fetch(
          `${baseUrl}/startStockStream?symbol=${cleanSymbol}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        console.log(`Stream initialized for ${cleanSymbol}`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.error(`Fetch for ${cleanSymbol} timed out.`);
        } else {
          console.error("API error:", err);
        }
      } finally {
        clearTimeout(timeoutId);
        // 4. Remove from pending regardless of outcome
        setPendingRequests((prev) => {
          const next = new Set(prev);
          next.delete(cleanSymbol);
          return next;
        });
      }
    },
    [historicalStockPoints, pendingRequests],
  );

  const startOptionStream = useCallback(
    async (
      stockSymbol: string,
      strikePrice: string,
      day: string,
      month: string,
      year: string,
      type: string,
    ) => {
      const cleanSymbol = stockSymbol.toUpperCase().trim();

      const optionID = formatOptionSymbol(
        cleanSymbol,
        day,
        month,
        year,
        type,
        strikePrice,
      );

      // 1. Guard: Don't fetch if we have data OR if a request is already flying
      if (pendingRequests.has(optionID)) return;

      // 2. Mark as pending
      setPendingRequests((prev) => new Set(prev).add(optionID));

      // 3. Setup Timeout Controller (Cancel fetch if cloud takes > 5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const baseUrl = "http://localhost:8080";
        const response = await fetch(
          `${baseUrl}/startOptionStream?symbol=${stockSymbol}&price=${strikePrice}&day=${day}&month=${month}&year=${year}&type=${type}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        console.log(`Stream initialized for ${cleanSymbol}`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.error(`Fetch for ${cleanSymbol} timed out.`);
        } else {
          console.error("API error:", err);
        }
      } finally {
        clearTimeout(timeoutId);
        // 4. Remove from pending regardless of outcome
        setPendingRequests((prev) => {
          const next = new Set(prev);
          next.delete(optionID);
          return next;
        });
      }
    },
    [optionPoints, pendingRequests],
  );

  const updateOptionPoint = (symbol: string, point: OptionPoint) => {
    setOptionPoints((prev) => {
      const prevPoints = prev[symbol] || [];
      return {
        ...prev,
        [symbol]: [...prevPoints.slice(-1920), point],
      };
    });
  };

  const updateStockPoint = (symbol: string, point: StockPoint) => {
    setStockPoints((prev) => {
      const prevPoints = prev[symbol] || [];
      return {
        ...prev,
        [symbol]: [...prevPoints.slice(-1920), point],
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

  const updateOptionExpirations = (
    symbol: string,
    expirations: OptionExpiration,
  ) => {
    setOptionExpirations((prev) => ({
      ...prev,
      [symbol]: expirations,
    }));
  };

  return (
    <PriceStreamContext.Provider
      value={{
        optionPoints,
        stockPoints,
        companyStats,
        historicalStockPoints,
        pendingRequests,
        optionExpirations,
        startStockStream,
        startOptionStream,
        updateOptionPoint,
        updateStockPoint,
        updateCompanyStats,
        updateHistoricalStockPoint,
        updateOptionExpirations,
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

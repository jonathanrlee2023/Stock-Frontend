import { createContext, useCallback, useContext, useState } from "react";

export type BalancePoint = {
  timestamp: number;
  Balance: number;
  Cash: number;
  PortfolioID: number;
};

export type PortfolioBalancePoint = Record<number, BalancePoint[]>;

export type GlobalNews = Record<string, string>;
interface BalanceContextValue {
  balancePoints: PortfolioBalancePoint;
  updateBalancePoint: (point: BalancePoint) => void;
  news: GlobalNews;
  updateNews: (point: GlobalNews) => void;
}

const BalanceContext = createContext<BalanceContextValue | undefined>(
  undefined,
);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [balancePoints, setBalancePoints] = useState<PortfolioBalancePoint>({});
  const [news, setNews] = useState<GlobalNews>({});

  const updateNews = useCallback((newItems: GlobalNews) => {
    setNews((prev) => {
      const merged = { ...prev, ...newItems };

      const keys = Object.keys(merged);
      if (keys.length > 25) {
        const keptKeys = keys.slice(-25);
        const trimmed: GlobalNews = {};
        keptKeys.forEach((key) => {
          trimmed[key] = merged[key];
        });
        return trimmed;
      }

      return merged;
    });
  }, []);

  const updateBalancePoint = useCallback((point: BalancePoint) => {
    setBalancePoints((prev) => {
      const id = point.PortfolioID;
      const existingHistory = prev[id] || [];
      return {
        ...prev,
        [id]: [...existingHistory, point].slice(-1000),
      };
    });
  }, []);

  return (
    <BalanceContext.Provider
      value={{ balancePoints, updateBalancePoint, news, updateNews }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalanceContext = () => {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalanceContext must be inside BalanceProvider");
  return ctx;
};

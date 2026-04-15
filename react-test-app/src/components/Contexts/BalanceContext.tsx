import { createContext, useCallback, useContext, useState } from "react";

export type BalancePoint = {
  timestamp: number;
  Balance: number;
  Cash: number;
  PortfolioID: number;
};

export type PortfolioBalancePoint = Record<number, BalancePoint[]>;
interface BalanceContextValue {
  balancePoints: PortfolioBalancePoint;
  updateBalancePoint: (point: BalancePoint) => void;
}

const BalanceContext = createContext<BalanceContextValue | undefined>(
  undefined,
);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [balancePoints, setBalancePoints] = useState<PortfolioBalancePoint>({});

  const updateBalancePoint = (point: BalancePoint) => {
    setBalancePoints((prev) => {
      const id = point.PortfolioID;

      const existingHistory = prev[id] || [];

      const updatedHistory = [...existingHistory, point].slice(-1000);

      return {
        ...prev,
        [id]: updatedHistory,
      };
    });
  };

  return (
    <BalanceContext.Provider value={{ balancePoints, updateBalancePoint }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalanceContext = () => {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalanceContext must be inside BalanceProvider");
  return ctx;
};

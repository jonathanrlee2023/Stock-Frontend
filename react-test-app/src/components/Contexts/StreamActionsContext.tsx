import React from "react";
import { useCallback } from "react";
import { useCompanyContext } from "./CompanyContext";
import { useOptionContext } from "./OptionContext";
import { useStockContext } from "./StockContext";

export type Position = {
  id: string;
  price: number;
  amount: number;
  portfolio_id: number;
  client_id: string;
};
interface StreamActionsContextValue {
  startStockStream: (symbol: string, clientID: string) => Promise<void>;
  startOptionStream: (
    stockSymbol: string,
    strikePrice: string,
    day: string,
    month: string,
    year: string,
    type: string,
    clientID: string,
  ) => Promise<void>;
  pendingRequests: Set<string>;
}

export const StreamActionsContext = React.createContext<
  StreamActionsContextValue | undefined
>(undefined);
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

export const StreamActionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pendingRequests, setPendingRequests] = React.useState<Set<string>>(
    new Set(),
  );
  const { companyStats } = useCompanyContext();
  const { historicalStockPoints } = useStockContext();
  const { optionPoints, optionExpirations } = useOptionContext();
  const startOptionStream = useCallback(
    async (
      stockSymbol: string,
      strikePrice: string,
      day: string,
      month: string,
      year: string,
      type: string,
      clientID: string,
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
          `${baseUrl}/startOptionStream?symbol=${stockSymbol}&price=${strikePrice}&day=${day}&month=${month}&year=${year}&type=${type}&clientID=${clientID}`,
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
  const startStockStream = useCallback(
    async (symbol: string, clientID: string) => {
      const cleanSymbol = symbol.toUpperCase().trim();

      if (
        !companyStats[cleanSymbol] ||
        !historicalStockPoints[cleanSymbol] ||
        !optionExpirations[cleanSymbol]
      ) {
        if (pendingRequests.has(cleanSymbol)) return;
      }

      // 2. Mark as pending
      setPendingRequests((prev) => new Set(prev).add(cleanSymbol));

      // 3. Setup Timeout Controller (Cancel fetch if cloud takes > 5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const baseUrl = "http://localhost:8080";
        const response = await fetch(
          `${baseUrl}/startStockStream?symbol=${cleanSymbol}&clientID=${clientID}`,
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
    [companyStats, pendingRequests],
  );
  return (
    <StreamActionsContext.Provider
      value={{ startOptionStream, startStockStream, pendingRequests }}
    >
      {children}
    </StreamActionsContext.Provider>
  );
};

export const useStreamActionsContext = () => {
  const ctx = React.useContext(StreamActionsContext);
  if (!ctx)
    throw new Error(
      "useStreamActionsContext must be inside StreamActionsProvider",
    );
  return ctx;
};

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BalancePoint, useBalanceContext } from "./BalanceContext";
import { CompanyStats, useCompanyContext } from "./CompanyContext";
import { OptionPoint, useOptionContext } from "./OptionContext";
import {
  HistoricalStockPoint,
  StockPoint,
  useStockContext,
} from "./StockContext";

interface WSContextValue {
  sendMessage: (msg: any) => void;
  lastMessage: any | null;
  ids: Record<number, Record<string, number>>;
  setIds: React.Dispatch<
    React.SetStateAction<Record<number, Record<string, number>>>
  >;
  trackers: string[];
  setTrackers: React.Dispatch<React.SetStateAction<string[]>>;
  previousBalance: Record<number, number>;
  previousCard: string;
  setPreviousCard: React.Dispatch<React.SetStateAction<string>>;
  previousID: string;
  setPreviousID: React.Dispatch<React.SetStateAction<string>>;
  portfolioNames: Record<number, string>;
  setPortfolioNames: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}
const WSContext = createContext<WSContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
  clientId: string;
}

export const WSProvider = ({ children, clientId }: Props): JSX.Element => {
  const ws = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [ids, setIds] = useState<Record<number, Record<string, number>>>({});
  const [trackers, setTrackers] = useState<string[]>([]);
  const [previousBalance, setPreviousBalance] = useState<
    Record<number, number>
  >({});
  const [previousCard, setPreviousCard] = useState<string>("");
  const [previousID, setPreviousID] = useState<string>("");
  const [portfolioNames, setPortfolioNames] =
    useState<Record<number, string>>("");

  const { updateBalancePoint } = useBalanceContext();
  const { updateCompanyStats } = useCompanyContext();
  const { updateOptionExpirations, updateOptionPoint } = useOptionContext();
  const { updateStockPoint, updateHistoricalStockPoint } = useStockContext();

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8080/connect?id=${clientId}`);

    ws.current.onopen = () => {
      console.log(`Websocket connected ${clientId}`);
    };

    ws.current.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setLastMessage(parsed);

      if (parsed.openIdList !== undefined && parsed.prevBalance !== undefined) {
        setIds(parsed.openIdList);
        setTrackers(parsed.trackerIdList ?? []);
        setPreviousBalance(parsed.prevBalance);
        setPortfolioNames(parsed.portfolioNames ?? {});
        return;
      }

      if (parsed.PortfolioID !== undefined || parsed.Balance !== undefined) {
        updateBalancePoint(parsed as BalancePoint);
        return;
      }

      if (parsed.MarketCap !== undefined) {
        updateCompanyStats(parsed.Symbol, parsed as CompanyStats);
        return;
      }

      if (parsed.Call !== undefined) {
        updateOptionExpirations(parsed.Symbol, {
          Call: parsed.Call,
          Put: parsed.Put,
          Quote: parsed.Quote,
          PriceHistory: parsed.PriceHistory,
        });
        updateHistoricalStockPoint(
          parsed.Symbol,
          parsed.PriceHistory as HistoricalStockPoint[],
        );
        updateStockPoint(parsed.Symbol, parsed.Quote as StockPoint);
      }

      // 2) Batch array of OptionPoint or StockPoint
      if (Array.isArray(parsed)) {
        const first = parsed[0] as any;
        if (first?.IV !== undefined) {
          (parsed as OptionPoint[]).forEach((opt) =>
            updateOptionPoint(opt.Symbol, opt as OptionPoint),
          );
          return;
        } else {
          (parsed as StockPoint[]).forEach((stk) =>
            updateStockPoint(stk.Symbol, {
              Symbol: stk.Symbol,
              BidPrice: stk.BidPrice,
              AskPrice: stk.AskPrice,
              LastPrice: stk.LastPrice,
              Mark: stk.Mark,
              timestamp: stk.timestamp,
            }),
          );
          return;
        }
      }

      // 3) Single object (e.g. balance or lone stock point)
      if (parsed.symbol) {
        updateStockPoint(parsed.symbol, {
          Symbol: parsed.symbol,
          Mark: parsed.Mark,
          BidPrice: parsed.BidPrice,
          AskPrice: parsed.AskPrice,
          LastPrice: parsed.LastPrice,
          timestamp: parsed.timestamp,
        });

        return;
      }

      // 4) Truly unexpected
      console.warn("Unhandled WS message:", parsed);
    };

    ws.current.onclose = () => {
      console.log("Websocket connection closed");
    };

    // Cleanup on unmount or clientId change
    return () => {
      ws.current?.close();
    };
  }, [clientId]);

  const sendMessage = (msg: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }
  };

  return (
    <WSContext.Provider
      value={{
        sendMessage,
        lastMessage,
        ids,
        setIds,
        trackers,
        setTrackers,
        previousBalance,
        previousCard,
        setPreviousCard,
        previousID,
        setPreviousID,
        portfolioNames,
        setPortfolioNames,
      }}
    >
      {children}
    </WSContext.Provider>
  );
};

export const useWS = () => {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error("useWS must be used within WSProvider");
  return ctx;
};

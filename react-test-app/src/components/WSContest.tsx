import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePriceStream, OptionPoint, StockPoint } from "./PriceContext";

interface WSContextValue {
  sendMessage: (msg: any) => void;
  lastMessage: any | null;
  ids: Record<string, number>;
  setIds: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  trackers: string[];
  setTrackers: React.Dispatch<React.SetStateAction<string[]>>;
  previousBalance: number;
}
const WSContext = createContext<WSContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
  clientId: string;
}

export const WSProvider = ({ children, clientId }: Props): JSX.Element => {
  const ws = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [ids, setIds] = useState<Record<string, number>>({});
  const [trackers, setTrackers] = useState<string[]>([]);
  const [previousBalance, setPreviousBalance] = useState<number>(0);

  const { updateStockPoint, updateOptionPoint } = usePriceStream();

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8080/connect?id=${clientId}`);

    ws.current.onopen = () => {
      console.log(`Websocket connected ${clientId}`);
    };

    ws.current.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setLastMessage(parsed);

      // 1) Initialization object
      if (
        parsed.openIdList !== undefined &&
        parsed.trackerIdList !== undefined &&
        parsed.prevBalance !== undefined
      ) {
        setIds(parsed.openIdList);
        setTrackers(parsed.trackerIdList);
        setPreviousBalance(parsed.prevBalance);
        return;
      }

      // 2) Batch array of OptionPoint or StockPoint
      if (Array.isArray(parsed)) {
        const first = parsed[0] as any;
        if (first?.iv !== undefined) {
          (parsed as OptionPoint[]).forEach((opt) =>
            updateOptionPoint(opt.symbol, {
              symbol: opt.symbol,
              mark: opt.mark,
              timestamp: opt.timestamp,
              iv: opt.iv,
              delta: opt.delta,
              gamma: opt.gamma,
              theta: opt.theta,
              vega: opt.vega,
            })
          );
          return;
        } else {
          (parsed as StockPoint[]).forEach((stk) =>
            updateStockPoint(stk.symbol, {
              symbol: stk.symbol,
              mark: stk.mark,
              timestamp: stk.timestamp,
            })
          );
          return;
        }
      }

      // 3) Single object (e.g. balance or lone stock point)
      if (parsed.symbol) {
        console.log("called");
        updateStockPoint(parsed.symbol, {
          symbol: parsed.symbol,
          mark: parsed.mark,
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

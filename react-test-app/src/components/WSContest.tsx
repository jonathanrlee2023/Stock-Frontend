import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePriceStream } from "./PriceContext";

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
      console.log("Received message:", parsed);

      const {
        symbol,
        mark,
        timestamp,
        iv,
        delta,
        gamma,
        theta,
        vega,
        prevBalance,
        openIdList,
        trackerIdList,
      } = parsed;
      if (
        openIdList !== undefined &&
        prevBalance !== undefined &&
        trackerIdList !== undefined
      ) {
        setIds(openIdList);
        setTrackers(trackerIdList);
        setPreviousBalance(prevBalance);
      } else if (
        symbol &&
        delta !== undefined &&
        gamma !== undefined &&
        theta !== undefined &&
        vega !== undefined &&
        iv !== undefined
      ) {
        updateOptionPoint(symbol, {
          mark,
          timestamp,
          iv,
          delta,
          gamma,
          theta,
          vega,
        });
      } else {
        updateStockPoint(symbol, { mark, timestamp });
      }
    };

    ws.current.onclose = () => {
      console.log("Websocket connection closed");
    };

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

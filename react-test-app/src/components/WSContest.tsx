import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface WSContextValue {
  sendMessage: (msg: any) => void;
  lastMessage: any | null;
}

const WSContext = createContext<WSContextValue | undefined>(undefined);
interface Props {
  children: ReactNode;
}

export const WSProvider = ({ children }: Props): JSX.Element => {
  const ws = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const clientId = "TSX_CLIENT";
    ws.current = new WebSocket(`ws://localhost:8080/connect?id=${clientId}`);

    ws.current.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      console.log("Received message:", parsed);
      setLastMessage(parsed); // This should trigger the useEffect in your component
    };

    ws.current.onclose = () => {
      console.log("Websocket connection closed");
      ws.current = new WebSocket(`ws://localhost:8080/connect?id=${clientId}`);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = (msg: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }
  };

  return (
    <WSContext.Provider value={{ sendMessage, lastMessage }}>
      {children}
    </WSContext.Provider>
  );
};

export const useWS = () => {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error("useWS must be used within WSProvider");
  return ctx;
};

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";
import { ButtonsProvider } from "./components/ButtonContext";
import { PriceStreamProvider } from "./components/PriceContext";
import { WSProvider } from "./components/WSContest";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ButtonsProvider>
    <PriceStreamProvider>
      <WSProvider clientId="STOCK_CLIENT">
        <App />
      </WSProvider>
    </PriceStreamProvider>
  </ButtonsProvider>,
);

import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";
import { ButtonsProvider } from "./components/ButtonContext";
import { StockProvider } from "./components/Contexts/StockContext";
import { BalanceProvider } from "./components/Contexts/BalanceContext";
import { OptionProvider } from "./components/Contexts/OptionContext";
import { CompanyProvider } from "./components/Contexts/CompanyContext";
import { StreamActionsProvider } from "./components/Contexts/StreamActionsContext";
import { WSProvider } from "./components/Contexts/WSContest";
import Login from "./components/LoginPage";
import Register from "./components/CreateLoginPage";
import { MetalFilter } from "./components/MetalFilter";
import { on } from "events";

const Main = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  if (!userId) {
    return (
      <>
        {/* Render the filter here so Login/Register can see it */}
        <MetalFilter />
        {isRegistering ? (
          <Register
            onBackToLogin={() => setIsRegistering(false)}
            onLogin={(id) => setUserId(id)}
          />
        ) : (
          <Login
            onLogin={(id) => setUserId(id)}
            onGoToRegister={() => setIsRegistering(true)}
          />
        )}
      </>
    );
  }

  // Once logged in, render the app with all Contexts
  return (
    <ButtonsProvider>
      <StockProvider>
        <OptionProvider>
          <BalanceProvider>
            <CompanyProvider>
              <StreamActionsProvider>
                <WSProvider clientID={`STOCK_CLIENT_${userId}`}>
                  <MetalFilter />
                  <App />
                </WSProvider>
              </StreamActionsProvider>
            </CompanyProvider>
          </BalanceProvider>
        </OptionProvider>
      </StockProvider>
    </ButtonsProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Main />,
);

import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";
import { ButtonsProvider } from "./components/ButtonContext";
import { PriceStreamProvider } from "./components/PriceContext";
import { WSProvider } from "./components/WSContest";
import Login from "./components/LoginPage";
import Register from "./components/CreateLoginPage";

const Main = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  if (!userId) {
    return isRegistering ? (
      <Register onBackToLogin={() => setIsRegistering(false)} />
    ) : (
      <Login
        onLogin={(id) => setUserId(id)}
        onGoToRegister={() => setIsRegistering(true)}
      />
    );
  }

  // Once logged in, render the app with all Contexts
  return (
    <ButtonsProvider>
      <PriceStreamProvider>
        <WSProvider clientId={`STOCK_CLIENT_${userId}`}>
          <App />
        </WSProvider>
      </PriceStreamProvider>
    </ButtonsProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Main />,
);

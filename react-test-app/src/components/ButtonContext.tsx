import React, { createContext, useContext, useState } from "react";

interface ButtonsContextValue {
  buttons: string[];
  setButtons: React.Dispatch<React.SetStateAction<string[]>>;
}

const ButtonsContext = createContext<ButtonsContextValue | undefined>(
  undefined
);

export const ButtonsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [buttons, setButtons] = useState<string[]>([]);
  return (
    <ButtonsContext.Provider value={{ buttons, setButtons }}>
      {children}
    </ButtonsContext.Provider>
  );
};

export const useButtons = () => {
  const context = useContext(ButtonsContext);
  if (!context)
    throw new Error("useButtons must be used within ButtonsProvider");
  return context;
};

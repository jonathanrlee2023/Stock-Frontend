import { Position } from "./Contexts/StreamActionsContext";

interface OptionParts {
  ticker: string;
  month: string;
  day: string;
  year: string;
  type: string;
  strike: string;
}
export const postData = async (
  openOrClose: string,
  ID: string,
  price: number,
  amount: number,
  portfolio_id: number,
  clientID: string,
) => {
  const data = { id: ID, price, amount, portfolio_id, client_id: clientID };

  try {
    const response = await fetch(`http://localhost:8080/${openOrClose}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.text();
    console.log("Server response:", result);
  } catch (error) {
    console.error("POST request failed:", error);
  }
};

export const CreatePortfolio = async (
  PID: number,
  name: string,
  clientID: string,
  positions: Position[],
) => {
  const data = {
    id: PID,
    name: name,
    clientID: clientID,
    positions: positions,
  };

  try {
    const response = await fetch(`http://localhost:8080/newPortfolio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.text();
    console.log("Server response:", result);
  } catch (error) {
    console.error("POST request failed:", error);
  }
};

export function formatOptionSymbol(
  stock: string,
  day: string,
  month: string,
  year: string,
  type: string,
  strike: string,
): string {
  const ticker = stock.toUpperCase().padEnd(6, " ");

  const yy = year.length === 4 ? year.slice(2) : year;

  const typeLetter = type.toUpperCase().startsWith("C") ? "C" : "P";

  const strikeNum = parseFloat(strike);
  const strikeStr = Math.round(strikeNum * 1000)
    .toString()
    .padStart(8, "0");

  return `${ticker}${yy}${month.padStart(2, "0")}${day.padStart(2, "0")}${typeLetter}${strikeStr}`;
}

export const ParseOptionId = (optionId: string): OptionParts | null => {
  const cleanId = optionId.trim();
  const regex = /^([A-Z]+)\s*(\d{2})(\d{2})(\d{2})([CP])(\d+)$/;
  const match = cleanId.match(regex);

  if (!match) return null;

  return {
    ticker: match[1],
    year: match[2],
    month: match[3],
    day: match[4],
    type: match[5],
    strike: String(parseInt(match[6]) / 1000),
  };
};

export const ModifyTracker = async (action: string, id: string) => {
  let data: { id: string } = { id: id };

  try {
    const response = await fetch(`http://localhost:8080/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.text();
    console.log("Server response:", result);
  } catch (error) {
    console.error("POST request failed:", error);
  }
};

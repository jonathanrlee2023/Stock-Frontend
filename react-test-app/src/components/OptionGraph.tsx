import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export type CombinedOptions = {
  price: number; // Corresponds to float64 in Go
  timestamp: string; // Changed to string since JSON typically returns ISO timestamps
};

export type OptionsSymbol = {
  symbol: CombinedOptions[]; // Array of OptionsPrices
  price: number;
  ticker: string;
  expirationDate: string;
};

export type ImpliedVolatility = {
  volatility: number;
};
interface StockStatisticsProps {
  stockSymbol: string; // The stock symbol to fetch data for
  optionType: string;
}

export const OptionsDataComponent: React.FC<StockStatisticsProps> = ({
  stockSymbol,
  optionType,
}) => {
  const [optionsData, setOptionsData] = useState<OptionsSymbol | null>(null);
  const [volatilityData, setVolatilityData] =
    useState<ImpliedVolatility | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const getMostRecentWeekday = () => {
      const today = new Date();
      today.setDate(today.getDate() - 1); // Start with Today
      let dayOfWeek = today.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)

      // If it's Sunday (0) or Saturday (6), adjust to the most recent Friday (5)
      if (dayOfWeek === 0) {
        today.setDate(today.getDate() - 2); // Move back to Friday
      } else if (dayOfWeek === 6) {
        today.setDate(today.getDate() - 1); // Move back to Friday
      }

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };
    const fetchOptionsData = async () => {
      const mostRecentWeekday = getMostRecentWeekday();
      try {
        const optionsResponse = await fetch(
          `http://localhost:8080/options?symbol=${stockSymbol}&start=${mostRecentWeekday}&end=${mostRecentWeekday}&timeframe=10Min&type=${optionType}`,
          {
            method: "GET",
            headers: {
              "APCA-API-KEY-ID": "AK5Y9SVP72X34QDD7EKI",
              "APCA-API-SECRET-KEY": "wbY3o9CLbWDNdaGzaBXHjmLMiO1cbFLkl7sUz6VU",
              Accept: "application/json",
            },
          }
        );
        const volatilityResponse = await fetch(
          `http://localhost:8080/impliedVolatility?ticker=${stockSymbol}&type=${optionType}`,
          {
            method: "GET",
            headers: {
              "APCA-API-KEY-ID": "AK5Y9SVP72X34QDD7EKI",
              "APCA-API-SECRET-KEY": "wbY3o9CLbWDNdaGzaBXHjmLMiO1cbFLkl7sUz6VU",
              Accept: "application/json",
            },
          }
        );

        if (!optionsResponse.ok || !volatilityResponse.ok)
          throw new Error(`HTTP error! Status: ${optionsResponse.status}`);

        const optionsData: OptionsSymbol = await optionsResponse.json();
        setOptionsData(optionsData);

        const volatilityData: ImpliedVolatility =
          await volatilityResponse.json();
        setVolatilityData(volatilityData);
      } catch (error) {
        console.error("Failed to fetch options data", error);
        setErrorMessage("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptionsData();
  }, [stockSymbol]);

  if (!stockSymbol) return <div>Enter Stock Symbol...</div>;
  if (loading) return <div>Loading...</div>;
  if (!optionsData || !optionsData.symbol) return <div>No data available</div>;

  const sortedOptions = optionsData?.symbol
    ? [...optionsData.symbol].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : [];

  const labels = sortedOptions.map((option) =>
    new Date(option.timestamp).toLocaleString()
  );
  const dataValues = sortedOptions.map((option) => option.price);

  const graphData = {
    labels,
    datasets: [
      {
        label: `Price`,
        data: dataValues,
        fill: false,
        borderColor: "rgb(66, 0, 189)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `$${optionsData.price} ${optionType} Expiring ${optionsData.expirationDate}`,
      },
    },
  };

  return (
    <div className="card" style={{ padding: "20px" }}>
      <strong>Implied Volatility:</strong> {volatilityData?.volatility}%
      <Line options={options} data={graphData} />
    </div>
  );
};

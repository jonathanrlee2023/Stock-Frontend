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

export type CombinedStock = {
  price: number; // Corresponds to float64 in Go
  timestamp: string; // Changed to string since JSON typically returns ISO timestamps
};

export type StockSymbol = {
  symbol: CombinedStock[]; // Array of OptionsPrices
  price: number;
  ticker: string;
  expirationDate: string;
};
interface StockStatisticsProps {
  stockSymbol: string; // The stock symbol to fetch data for
}

export const TodayStockComponent: React.FC<StockStatisticsProps> = ({
  stockSymbol,
}) => {
  const [stockData, setStockData] = useState<StockSymbol | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const getMostRecentWeekday = () => {
      const today = new Date();
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
    const makeApiCalls = async () => {
      try {
        await fetch(
          `http://localhost:8080/earningsCalender?symbol=${stockSymbol}&apikey=6UBNJGP08SOGI9HV`
        ); // First API call
        await fetch(
          `http://localhost:8080/stock?symbol=${stockSymbol}&apikey=X8531ZcJaqW6j7l9tG1PVFBZnwMNRs72`
        ); // Second API call
      } catch (error) {
        console.error("Error making API calls:", error);
      }
    };
    const fetchTodayStockData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/todayStock?symbol=${stockSymbol}&timeframe=5Min`,
          {
            method: "GET",
            headers: {
              "APCA-API-KEY-ID": "AK5Y9SVP72X34QDD7EKI",
              "APCA-API-SECRET-KEY": "wbY3o9CLbWDNdaGzaBXHjmLMiO1cbFLkl7sUz6VU",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data: StockSymbol = await response.json();
        setStockData(data);
      } catch (error) {
        console.error("Failed to fetch options data", error);
        setErrorMessage("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
      makeApiCalls();
    };

    fetchTodayStockData();
  }, [stockSymbol]);

  if (!stockSymbol) return;
  if (loading) return <div>Loading...</div>;
  if (!stockData || !stockData.symbol) return <div>No data available</div>;

  const sortedStocks = stockData?.symbol
    ? [...stockData.symbol].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : [];

  const labels = sortedStocks.map((stock) =>
    new Date(stock.timestamp).toLocaleString()
  );
  const dataValues = sortedStocks.map((stock) => stock.price);

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
        text: `${stockData.ticker}`,
      },
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <Line options={options} data={graphData} />
    </div>
  );
};

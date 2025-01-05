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

export type OptionsPrices = {
  options: CombinedOptions[]; // Array of CombinedOptions
};

export type OptionsSymbol = {
  symbol: OptionsPrices; // Array of OptionsPrices
};
interface StockStatisticsProps {
  stockSymbol: string; // The stock symbol to fetch data for
}

export const OptionsDataComponent: React.FC<StockStatisticsProps> = ({
  stockSymbol,
}) => {
  const [optionsData, setOptionsData] = useState<OptionsSymbol | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const getYesterday = () => {
      const today = new Date();
      today.setDate(today.getDate() - 1);
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const fetchEarningsData = async () => {
      const yesterday = getYesterday();
      try {
        const response = await fetch(
          `http://localhost:8080/options?symbol=${stockSymbol}&start=${yesterday}&end=${yesterday}&timeframe=10Min`,
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

        const data: OptionsSymbol = await response.json();
        setOptionsData(data);
      } catch (error) {
        console.error("Failed to fetch options data", error);
        setErrorMessage("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [stockSymbol]);

  if (!stockSymbol) return <div>Enter Stock Symbol...</div>;
  if (loading) return <div>Loading...</div>;
  if (!optionsData || !optionsData.symbol.options)
    return <div>No data available</div>;

  const sortedOptions = optionsData?.symbol?.options
    ? [...optionsData.symbol.options].sort(
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
        label: `Options Prices`,
        data: dataValues,
        fill: false,
        borderColor: "rgb(37, 186, 106)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `Options Chart` },
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <Line options={options} data={graphData} />
    </div>
  );
};

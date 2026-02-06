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
  Legend,
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

interface StockStatisticsProps {
  stockSymbol: string; // The stock symbol to fetch data for
}

export const CombinedOptionsDataComponent: React.FC<StockStatisticsProps> = ({
  stockSymbol,
}) => {
  const [optionsData, setOptionsData] = useState<OptionsSymbol | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCombinedOptionsData = async () => {
      try {
        const optionsResponse = await fetch(
          `http://localhost:8080/combinedOptions?symbol=${stockSymbol}`,
          {
            method: "GET",
            headers: {
              "APCA-API-KEY-ID": "AK5Y9SVP72X34QDD7EKI",
              "APCA-API-SECRET-KEY": "wbY3o9CLbWDNdaGzaBXHjmLMiO1cbFLkl7sUz6VU",
              Accept: "application/json",
            },
          },
        );

        if (!optionsResponse.ok)
          throw new Error(`HTTP error! Status: ${optionsResponse.status}`);

        const optionsData: OptionsSymbol = await optionsResponse.json();
        setOptionsData(optionsData);
      } catch (error) {
        console.error("Failed to fetch options data", error);
        setErrorMessage("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCombinedOptionsData();
  }, [stockSymbol]);

  if (!stockSymbol) return <div>Enter Stock Symbol...</div>;
  if (loading) return <div>Loading...</div>;
  if (!optionsData || !optionsData.symbol) return <div>No data available</div>;

  const sortedOptions = optionsData?.symbol
    ? [...optionsData.symbol].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
    : [];

  const labels = sortedOptions.map((option) =>
    new Date(option.timestamp).toLocaleString(),
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
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `$${optionsData.price} Options Expiring ${optionsData.expirationDate}`,
      },
    },
  };

  return (
    <div
      style={{
        flex: "1 1 auto", // This allows the chart to grow/shrink to fit
        width: "100%",
        minHeight: "0",
        position: "relative",
      }}
    >
      <Line options={options} data={graphData} />
    </div>
  );
};

import React, { useState, useEffect } from "react";

export type StockStatistics = {
  Volatility: number;
  StandardDeviation: number;
};

interface StockStatisticsProps {
  stockSymbol: string; // The stock symbol to fetch data for
}

export const StockStatisticsComponent: React.FC<StockStatisticsProps> = ({
  stockSymbol,
}) => {
  const [stockStatistics, setStockStatistics] =
    useState<StockStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVolatility = async () => {
      setLoading(true); // Reset loading state
      setError(null); // Reset error state
      setStockStatistics(null); // Reset stock statistics

      try {
        const response = await fetch(
          `http://localhost:8080/stock?symbol=${stockSymbol}&apikey=X8531ZcJaqW6j7l9tG1PVFBZnwMNRs72`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        setStockStatistics({
          Volatility: data.Volatility,
          StandardDeviation: data.StandardDeviation,
        });
      } catch (error) {
        setError((error as Error).message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchVolatility();
  }, [stockSymbol]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!stockStatistics) return <div>No data available</div>;

  return (
    <div className="card">
      <p>
        <strong>Volatility:</strong> {stockStatistics.Volatility.toFixed(6)}%
      </p>
      <p>
        <strong>Standard Deviation:</strong>{" "}
        {stockStatistics.StandardDeviation.toFixed(6)}%
      </p>
      <p>
        The stock's volatility reflects the degree of variation in its trading
        price over time. Higher volatility indicates more significant price
        swings.
      </p>
    </div>
  );
};

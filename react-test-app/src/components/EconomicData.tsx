import React, { useState, useEffect } from "react";

type EconomicDataResult = {
  date: string;
  ffr: string;
  inflation: number;
};

export const EconomicDataComponent: React.FC = () => {
  const [economicData, setEconomicData] = useState<EconomicDataResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEconomicData = async () => {
      setLoading(true);
      setError(null);
      setEconomicData(null);

      try {
        const response = await fetch(
          `http://localhost:8080/economicData?apikey=6UBNJGP08SOGI9HV`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: EconomicDataResult = await response.json();

        setEconomicData(data);
      } catch (error) {
        setError((error as Error).message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEconomicData();
  }, []); // Removed dependency on undefined `stockSymbol`

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!economicData) return <div>No data available</div>;

  return (
    <div className="card">
      <h2>Economic Data</h2>
      <div className="economic-data">
        <p>
          <strong>Date:</strong> {economicData.date}
        </p>
        <p>
          <strong>Federal Funds Rate (FFR):</strong> {economicData.ffr}
        </p>
        <p>
          <strong>Inflation:</strong> {economicData.inflation.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

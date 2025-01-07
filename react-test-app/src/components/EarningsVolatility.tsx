import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "/App.css";

type EarningsVolatility = {
  ticker: string;
  volatility: Array<{
    reportedDate: string;
    dollarDifference: number;
    percentDifference: number;
  }>;
};

interface StockStatisticsProps {
  stockSymbol: string; // The stock symbol to fetch data for
}

export const EarningsVolatilityComponent: React.FC<StockStatisticsProps> = ({
  stockSymbol,
}) => {
  const [earningsData, setEarningsData] = useState<EarningsVolatility | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      setEarningsData(null);
      try {
        const response = await fetch(
          `http://localhost:8080/earningsVolatility?ticker=${stockSymbol}`
        );
        const data: EarningsVolatility = await response.json();
        setEarningsData(data);
      } catch (error) {
        console.error("Failed to fetch earnings data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [stockSymbol]);

  if (loading) return <div>Loading...</div>;

  if (!earningsData || earningsData.volatility.length === 0) {
    return <div>No earnings data available.</div>;
  }

  const sortedVolatility = [...earningsData.volatility].sort((a, b) =>
    a.reportedDate.localeCompare(b.reportedDate)
  );

  const markdown = `
| Reported Date | Day-to-Day Change | Percent Change |
|---------------|-------------------|----------------|
${sortedVolatility
  .map(
    (item) =>
      `| ${item.reportedDate} | $${item.dollarDifference.toFixed(
        2
      )} | ${item.percentDifference.toFixed(2)}% |`
  )
  .join("\n")}`;

  return (
    <div className="earnings-volatility-container">
      <h1>Earnings Data</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
};

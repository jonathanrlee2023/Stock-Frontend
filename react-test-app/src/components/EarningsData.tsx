import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "/App.css";

export type EarningsDateResponse = {
  fiscalDateEnding: string;
  reportedDate: string;
  reportedEPS: string;
  estimatedEPS: string;
  surprise: string;
  surprisePercentage: string;
  reportTime: string;
}[];

interface StockStatisticsProps {
  stockSymbol: string; // The stock symbol to fetch data for
}

export const EarningsDateComponent: React.FC<StockStatisticsProps> = ({
  stockSymbol,
}) => {
  const [earningsData, setEarningsData] = useState<EarningsDateResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      setEarningsData(null);
      try {
        const response = await fetch(
          `http://localhost:8080/earningsCalender?symbol=${stockSymbol}&apikey=6UBNJGP08SOGI9HV`
        );
        const data: EarningsDateResponse = await response.json();
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

  if (!earningsData || earningsData.length === 0) {
    return <div>No earnings data available.</div>;
  }

  const markdown = `
| Fiscal Date Ending | Reported Date | Reported EPS | Estimated EPS | Surprise | Surprise Percentage | Report Time |
|---------------------|---------------|--------------|---------------|----------|----------------------|-------------|
${earningsData
  .map(
    (item) =>
      `| ${item.fiscalDateEnding} | ${item.reportedDate} | ${item.reportedEPS} | ${item.estimatedEPS} | ${item.surprise} | ${item.surprisePercentage}% | ${item.reportTime} |`
  )
  .join("\n")}
`;

  return (
    <div className="earnings-data-container">
      <h1>Earnings Data</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
};

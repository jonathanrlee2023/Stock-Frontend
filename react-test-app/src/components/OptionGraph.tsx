import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useWS } from "./WSContest"; // adjust import
import "chartjs-adapter-date-fns";
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type PricePoint = {
  mark: number;
  timestamp: number;
};
interface OptionWSProps {
  stockSymbol: string;
  day: string;
  month: string;
  year: string;
  strikePrice: string;
  type: string;
}

export const OptionWSComponent: React.FC<OptionWSProps> = ({
  stockSymbol,
  day,
  month,
  year,
  strikePrice,
  type,
}) => {
  const { sendMessage, lastMessage } = useWS();
  const [symbolPricePoints, setSymbolPricePoints] = useState<
    Record<string, PricePoint[]>
  >({});
  const [delta, setDelta] = useState<number | null>(null);
  const [gamma, setGamma] = useState<number | null>(null);
  const [theta, setTheta] = useState<number | null>(null);
  const [vega, setVega] = useState<number | null>(null);
  useEffect(() => {
    if (lastMessage) {
      console.log("Processing lastMessage", lastMessage);
      const { symbol, mark, timestamp, delta, gamma, theta, vega } =
        lastMessage;

      if (mark !== undefined && timestamp !== undefined) {
        const point: PricePoint = { mark, timestamp };
        setSymbolPricePoints((prev) => {
          const prevPoints = prev[symbol] || [];
          setDelta(delta);
          setGamma(gamma);
          setTheta(theta);
          setVega(vega);
          return {
            ...prev,
            [symbol]: [...prevPoints.slice(-99), point],
          };
        });
      } else {
        if (mark === undefined)
          console.warn("Message missing mark", lastMessage);
        if (timestamp === undefined)
          console.warn("Message missing timestamp", lastMessage);
      }
    }
  }, [lastMessage]);

  const graphData = React.useMemo(() => {
    const points = symbolPricePoints[stockSymbol] || [];
    return {
      datasets: [
        {
          label: `${stockSymbol} $${strikePrice} ${type} Expiring ${month}/${day}/${year}`,
          data: points.map((p) => ({
            x: new Date(p.timestamp * 1000),
            y: p.mark,
          })),
          fill: false,
          borderColor: "rgb(66, 0, 189)",
          tension: 0.1,
        },
      ],
    };
  }, [symbolPricePoints, stockSymbol]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `Price History`,
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          tooltipFormat: "HH:mm:ss",
        },
      },
    },
  };

  return (
    <div>
      <h1>
        Delta: {delta} Gamma: {gamma} Theta: {theta} Vega: {vega}
      </h1>
      <div style={{ padding: "20px" }}>
        <Line key={stockSymbol} options={options} data={graphData} />
      </div>
    </div>
  );
};

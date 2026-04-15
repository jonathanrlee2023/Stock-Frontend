// components/PortfolioAllocationChart.tsx
import React, { act, useMemo, useState } from "react";
import { useCompanyContext } from "./Contexts/CompanyContext";
import { useStockContext } from "./Contexts/StockContext";
import { useBalanceContext } from "./Contexts/BalanceContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
} from "recharts";
import { useWS } from "./Contexts/WSContest";
import { COLORS } from "../constants/Colors";

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    name,
  } = props;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* 3A. Main Slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8} // "Pops" outward slightly on hover
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.5))" }}
      />
      {/* 3B. Outer Decorative Ring */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
        fillOpacity={0.6}
      />

      {/* 3C. Central text label (only visible on hover) */}
      <text
        x={cx}
        y={cy}
        dy={4}
        textAnchor="middle"
        fill="#fff"
        fontSize="1rem"
        fontFamily="monospace"
      >
        {name}
      </text>
      <text
        x={cx}
        y={cy}
        dy={24}
        textAnchor="middle"
        fill="#aaa"
        fontSize="0.75rem"
        fontFamily="monospace"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};
interface SectorAllocationProps {
  activePortfolio: number;
}

export const SectorAllocation: React.FC<SectorAllocationProps> = ({
  activePortfolio,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const { ids } = useWS();
  const { companyStats } = useCompanyContext();
  const { stockPoints } = useStockContext();
  const { balancePoints } = useBalanceContext();
  const currentBalance = balancePoints[activePortfolio]?.slice(-1)[0];
  const balance = currentBalance?.Balance || 0;
  const cash = currentBalance?.Cash || 0;

  const chartData = useMemo(() => {
    const activeIds = ids[activePortfolio] || {};
    const sectorTotals: Record<string, number> = {};

    // 1. Calculate dollar amounts per sector
    Object.entries(activeIds).forEach(([id, quantity]) => {
      const sector = companyStats[id]?.Sector || "Other";
      const currentMark = stockPoints[id]?.slice(-1)[0]?.Mark || 0;
      const totalValue = currentMark * quantity;

      sectorTotals[sector] = (sectorTotals[sector] || 0) + totalValue;
    });

    const colors: Record<string, string> = {
      TECHNOLOGY: "#0804ff", // Brand Purple
      "FINANCIAL SERVICES": "#B8860B", // Gold
      HEALTHCARE: "#888", // Silver
      "CONSUMER DEFENSIVE": "#4B0082", // Indigo
      ENERGY: "#167a00", // Dark Steel
      UTILITIES: "#555", // Graphite
      INDUSTRIALS: "#FFD700", // Gold
      "BASIC MATERIALS": "#ff9393", // Silver
      "COMMUNICATION SERVICES": "#8B0000", // Dark Red
      "CONSUMER CYCLICAL": "#00BFFF", // Light Blue
      "REAL ESTATE": "#2F4F4F", // Dark Slate Gray
      CASH: "#ffffff",
    };

    const data = Object.entries(sectorTotals).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || colors.Other,
      percent: balance > 0 ? value / balance : 0,
    }));

    // 4. Add Cash as its own slice
    if (cash > 0) {
      data.push({
        name: "CASH",
        value: cash,
        color: colors.CASH,
        percent: balance > 0 ? cash / balance : 0,
      });
    }

    return data;
  }, [ids, activePortfolio, companyStats, stockPoints, balance, cash]);
  return (
    <div
      className="card chart-card text-light p-3"
      style={{
        flex: 1, // ADD THIS: Tells the card to grow
        height: "100%", // ADD THIS: Ensures it fills the flex item
        border: "1px solid " + COLORS.cardSoftBorder,
        borderRadius: "0",
        fontFamily: "monospace",
        backgroundColor: COLORS.cardBackground,
        boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.8)",
        display: "flex", // ADD THIS: To make internal card-body flex
        flexDirection: "column",
      }}
    >
      <div className="card-header border-0 bg-transparent p-0 mb-3 d-flex align-items-center justify-content-between">
        <h6
          className="m-0 text-light text-uppercase font-weight-bold"
          style={{ letterSpacing: "1px" }}
        >
          Sector Allocation
        </h6>
        <span style={{ fontSize: "0.8rem", color: "#aaa" }}>
          NAV: ${balance.toLocaleString()}
        </span>
      </div>

      <div className="card-body p-0" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              stroke="#000"
              strokeWidth={1}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={
                    activeIndex === undefined || activeIndex === index ? 1 : 0.3
                  }
                  style={{ transition: "all 0.1s ease-in-out" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

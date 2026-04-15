import React from "react";
import {
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  EarningsReport,
} from "./Contexts/CompanyContext";
import { COLORS } from "../constants/Colors";

interface GridProps {
  data: any[]; // The active slice from CompanyStats
  type: "Income" | "Balance" | "Cash" | "Earnings";
}

export const FinancialGrid: React.FC<GridProps> = ({ data, type }) => {
  if (!data || data.length === 0)
    return <div className="p-4 text-muted">No data available.</div>;

  const sortedData = [...data].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatValue = (val: number | null) => {
    if (val === null || val === undefined) return "—";
    if (Math.abs(val) >= 1.0e9) return (val / 1.0e9).toFixed(2) + "B";
    if (Math.abs(val) >= 1.0e6) return (val / 1.0e6).toFixed(2) + "M";
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const DataCell = ({ value }: { value: any }) => (
    <td
      className="text-end"
      style={{
        padding: "10px 15px",
        borderBottom: "1px solid " + COLORS.headerBottomBorder,
        color: COLORS.mainFontColor,
      }}
    >
      {formatValue(value)}
    </td>
  );

  const PercentCell = ({ value }: { value: any }) => (
    <td
      className="text-end"
      style={{
        padding: "10px 15px",
        borderBottom: "1px solid " + COLORS.headerBottomBorder,
        color: COLORS.secondaryTextColor,
      }}
    >
      {(value ? value * 100 : 0).toFixed(2)}%
    </td>
  );

  return (
    <div
      className="table-responsive custom-scrollbar"
      style={{
        height: "100%",
        width: "100%", // Ensure it takes full container width
        overflowY: "auto",
        overflowX: "auto", // Explicitly enable horizontal scroll
        backgroundColor: COLORS.cardBackground,
        border: "1px solid " + COLORS.borderColor,
      }}
    >
      <table
        className="table table-dark mb-0 text-nowrap"
        style={{
          fontSize: "0.75rem",
          fontFamily: "monospace",
          minWidth: "max-content", // CRITICAL: Forces table to expand to fit all columns
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        <thead
          className="sticky-top"
          style={{
            zIndex: 10,
            backgroundColor: COLORS.cardBackground,
            borderBottom: "2px solid " + COLORS.borderColor,
          }}
        >
          <tr>
            <th
              style={{ color: COLORS.secondaryTextColor, padding: "12px 15px" }}
              className="text-start"
            >
              PERIOD_END
            </th>
            {type === "Income" && (
              <>
                <th className="border-secondary text-end">Gross Profit</th>
                <th className="border-secondary text-end">Total Revenue</th>
                <th className="border-secondary text-end">Cost of Revenue</th>
                <th className="border-secondary text-end">
                  Cost of Goods and Services Sold
                </th>
                <th className="border-secondary text-end">Operating Income</th>
                <th className="border-secondary text-end">
                  Selling General and Administrative
                </th>
                <th className="border-secondary text-end">
                  Research and Development
                </th>
                <th className="border-secondary text-end">
                  Operating Expenses
                </th>
                <th className="border-secondary text-end">
                  Net Interest Income
                </th>
                <th className="border-secondary text-end">Interest Income</th>
                <th className="border-secondary text-end">Interest Expense</th>
                <th className="border-secondary text-end">
                  Depreciation and Amortization
                </th>
                <th className="border-secondary text-end">Income Before Tax</th>
                <th className="border-secondary text-end">
                  Income Tax Expense
                </th>
                <th className="border-secondary text-end">
                  Net Income From Continuing Operations
                </th>
                <th className="border-secondary text-end">EBIT</th>
                <th className="border-secondary text-end">EBITDA</th>
                <th className="border-secondary text-end">Net Income</th>
                <th className="border-secondary text-end">
                  Effective Tax Rate
                </th>
                <th className="border-secondary text-end">Revenue Growth</th>
                <th className="border-secondary text-end">EBIT Margin</th>
                <th className="border-secondary text-end">CapEx % Revenue</th>
                <th className="border-secondary text-end">NWC % Revenue</th>
                <th className="border-secondary text-end">
                  Depreciation and Amortization % Revenue
                </th>
                <th className="border-secondary text-end">EBIT Growth</th>
                <th className="border-secondary text-end">ROIC</th>
              </>
            )}
            {type === "Balance" && (
              <>
                <th className="border-secondary text-end">Total Assets</th>
                <th className="border-secondary text-end">
                  Total Current Assets
                </th>
                <th className="border-secondary text-end">
                  Cash and Cash Equivalents
                </th>
                <th className="border-secondary text-end">
                  Cash and Short Term Investments
                </th>
                <th className="border-secondary text-end">Inventory</th>
                <th className="border-secondary text-end">
                  Current Net Receivables
                </th>
                <th className="border-secondary text-end">
                  Total Non Current Assets
                </th>
                <th className="border-secondary text-end">
                  Property Plant Equipment
                </th>
                <th className="border-secondary text-end">Intangible Assets</th>
                <th className="border-secondary text-end">
                  Intangible Assets - Goodwill
                </th>
                <th className="border-secondary text-end">Goodwill</th>
                <th className="border-secondary text-end">LT Investments</th>
                <th className="border-secondary text-end">ST Investments</th>
                <th className="border-secondary text-end">
                  Other Current Assets
                </th>
                <th className="border-secondary text-end">Total Liabilities</th>
                <th className="border-secondary text-end">
                  Total Current Liabilities
                </th>
                <th className="border-secondary text-end">
                  Current Accounts Payable
                </th>
                <th className="border-secondary text-end">ST Debt</th>
                <th className="border-secondary text-end">
                  Total Non Current Liabilities
                </th>
                <th className="border-secondary text-end">
                  Capital Lease Obligations
                </th>
                <th className="border-secondary text-end">Long Term Debt</th>
                <th className="border-secondary text-end">
                  Current Long Term Debt
                </th>
                <th className="border-secondary text-end">
                  Short Long Term Debt
                </th>
                <th className="border-secondary text-end">
                  Other Current Liablilities
                </th>
                <th className="border-secondary text-end">
                  Other Non Current Liabilities
                </th>
                <th className="border-secondary text-end">
                  Total Shareholder Equity
                </th>
                <th className="border-secondary text-end">Treasury Stock</th>
                <th className="border-secondary text-end">Retained Earnings</th>
                <th className="border-secondary text-end">Common Stock</th>
                <th className="border-secondary text-end">
                  Common Stock Shares Outstanding
                </th>
                <th className="border-secondary text-end">NWC</th>
                <th className="border-secondary text-end">Change in NWC</th>
                <th className="border-secondary text-end">NWC Ratio</th>
              </>
            )}
            {type === "Cash" && (
              <>
                <th className="border-secondary text-end">
                  Operating Cash Flow
                </th>
                <th className="border-secondary text-end">
                  Depreciation Depletion and Amortization
                </th>
                <th className="border-secondary text-end">CapEx</th>
                <th className="border-secondary text-end">
                  Change in Receivables
                </th>
                <th className="border-secondary text-end">
                  Change in Inventory
                </th>
                <th className="border-secondary text-end">
                  Cash Flow From Investment
                </th>
                <th className="border-secondary text-end">
                  Cash Flow From Financing
                </th>
                <th className="border-secondary text-end">Dividend Payout</th>
                <th className="border-secondary text-end">
                  Dividend Payout Common Stock
                </th>
                <th className="border-secondary text-end">
                  Dividend Payout Preferred Stock
                </th>
                <th className="border-secondary text-end">
                  Proceeds From Repurchase of Equity
                </th>
                <th className="border-secondary text-end">
                  Stock Based Compensation
                </th>
                <th className="border-secondary text-end">
                  Change in Cash and Cash Equivalents
                </th>
                <th className="border-secondary text-end">
                  Change in Exchange Rate
                </th>
                <th className="border-secondary text-end">Net Income</th>
                <th className="border-secondary text-end">FCF</th>
                <th className="border-secondary text-end">FCF YoY Growth</th>
                <th className="border-secondary text-end">FCF Per Share</th>
                <th className="border-secondary text-end">FCFF</th>
              </>
            )}
            {type === "Earnings" && (
              <>
                <th className="border-secondary text-end">Report Date</th>
                <th className="border-secondary text-end">Reported EPS</th>
                <th className="border-secondary text-end">Estimate</th>
                <th className="border-secondary text-end">Surprise %</th>
                <th className="border-secondary text-end">Time</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx}>
              <td className="fw-bold text-start">
                {row.date?.split("T")[0] || "—"}
              </td>

              {type === "Income" && (
                <>
                  {/* Top Line & Gross Profit */}
                  <DataCell value={(row as IncomeStatement).grossProfit} />
                  <DataCell value={(row as IncomeStatement).totalRevenue} />
                  <DataCell value={(row as IncomeStatement).costOfRevenue} />
                  <DataCell
                    value={(row as IncomeStatement).costOfGoodsAndServicesSold}
                  />

                  {/* Operating Items */}
                  <DataCell value={(row as IncomeStatement).operatingIncome} />
                  <DataCell
                    value={
                      (row as IncomeStatement).sellingGeneralAndAdministrative
                    }
                  />
                  <DataCell
                    value={(row as IncomeStatement).researchAndDevelopment}
                  />
                  <DataCell
                    value={(row as IncomeStatement).operatingExpenses}
                  />

                  {/* Interest & D&A */}
                  <DataCell
                    value={(row as IncomeStatement).netInterestIncome}
                  />
                  <DataCell value={(row as IncomeStatement).interestIncome} />
                  <DataCell value={(row as IncomeStatement).interestExpense} />
                  <DataCell
                    value={(row as IncomeStatement).depreciationAndAmortization}
                  />

                  {/* Pre-Tax & Tax */}
                  <DataCell value={(row as IncomeStatement).incomeBeforeTax} />
                  <DataCell value={(row as IncomeStatement).incomeTaxExpense} />
                  <DataCell
                    value={
                      (row as IncomeStatement).netIncomeFromContinuingOperations
                    }
                  />

                  {/* EBIT Variants */}
                  <DataCell value={(row as IncomeStatement).ebit} />
                  <DataCell value={(row as IncomeStatement).ebitda} />

                  {/* Bottom Line */}
                  <DataCell value={(row as IncomeStatement).netIncome} />

                  {/* Ratios & Growth (formatted as Percentages) */}
                  <PercentCell
                    value={(row as IncomeStatement).effectiveTaxRate}
                  />
                  <PercentCell value={(row as IncomeStatement).revGrowth} />
                  <PercentCell value={(row as IncomeStatement).ebitMargin} />
                  <PercentCell
                    value={(row as IncomeStatement).capexPctRevenue}
                  />
                  <PercentCell value={(row as IncomeStatement).nwcPctRevenue} />
                  <PercentCell value={(row as IncomeStatement).daPctRevenue} />
                  <PercentCell value={(row as IncomeStatement).ebitGrowth} />

                  {/* Final Efficiency Metric */}
                  <PercentCell value={(row as IncomeStatement).roic} />
                </>
              )}

              {type === "Balance" && (
                <>
                  {/* Assets */}
                  <DataCell value={(row as BalanceSheet).totalAssets} />
                  <DataCell value={(row as BalanceSheet).totalCurrentAssets} />
                  <DataCell
                    value={(row as BalanceSheet).cashAndCashEquivalents}
                  />
                  <DataCell
                    value={(row as BalanceSheet).cashAndShortTermInvestments}
                  />
                  <DataCell value={(row as BalanceSheet).inventory} />
                  <DataCell
                    value={(row as BalanceSheet).currentNetReceivables}
                  />
                  <DataCell
                    value={(row as BalanceSheet).totalNonCurrentAssets}
                  />
                  <DataCell
                    value={(row as BalanceSheet).propertyPlantEquipment}
                  />
                  <DataCell value={(row as BalanceSheet).intangibleAssets} />
                  <DataCell
                    value={
                      (row as BalanceSheet).intangibleAssetsExcludingGoodwill
                    }
                  />
                  <DataCell value={(row as BalanceSheet).goodwill} />
                  <DataCell value={(row as BalanceSheet).longTermInvestments} />
                  <DataCell
                    value={(row as BalanceSheet).shortTermInvestments}
                  />
                  <DataCell value={(row as BalanceSheet).otherCurrentAssets} />

                  {/* Liabilities */}
                  <DataCell value={(row as BalanceSheet).totalLiabilities} />
                  <DataCell
                    value={(row as BalanceSheet).totalCurrentLiabilities}
                  />
                  <DataCell
                    value={(row as BalanceSheet).currentAccountsPayable}
                  />
                  <DataCell value={(row as BalanceSheet).shortTermDebt} />
                  <DataCell
                    value={(row as BalanceSheet).totalNonCurrentLiabilities}
                  />
                  <DataCell
                    value={(row as BalanceSheet).capitalLeaseObligations}
                  />
                  <DataCell value={(row as BalanceSheet).longTermDebt} />
                  <DataCell value={(row as BalanceSheet).currentLongTermDebt} />
                  <DataCell value={(row as BalanceSheet).shortLongTermDebt} />
                  <DataCell
                    value={(row as BalanceSheet).otherCurrentLiabilities}
                  />
                  <DataCell
                    value={(row as BalanceSheet).otherNonCurrentLiabilities}
                  />

                  {/* Equity Section */}
                  <DataCell
                    value={(row as BalanceSheet).totalShareholderEquity}
                  />
                  <DataCell value={(row as BalanceSheet).treasuryStock} />
                  <DataCell value={(row as BalanceSheet).retainedEarnings} />
                  <DataCell value={(row as BalanceSheet).commonStock} />
                  <DataCell
                    value={(row as BalanceSheet).commonStockSharesOutstanding}
                  />

                  {/* Calculated Ratios (NWC is a dollar amount, Ratio is a scalar) */}
                  <DataCell value={(row as BalanceSheet).NWC} />
                  <DataCell value={(row as BalanceSheet).deltaNWC} />
                  <td
                    className="text-end"
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid " + COLORS.headerBottomBorder,
                      color: COLORS.mainFontColor,
                    }}
                  >
                    {((row as BalanceSheet).nwcRatio || 0).toFixed(2)}
                  </td>
                </>
              )}
              {type === "Cash" && (
                <>
                  {/* Operations */}
                  <DataCell
                    value={(row as CashFlowStatement).operatingCashflow}
                  />
                  <DataCell
                    value={
                      (row as CashFlowStatement)
                        .depreciationDepletionAndAmortization
                    }
                  />
                  <DataCell
                    value={(row as CashFlowStatement).capitalExpenditures}
                  />
                  <DataCell
                    value={(row as CashFlowStatement).changeInReceivables}
                  />
                  <DataCell
                    value={(row as CashFlowStatement).changeInInventory}
                  />

                  {/* Investing & Financing */}
                  <DataCell
                    value={(row as CashFlowStatement).cashflowFromInvestment}
                  />
                  <DataCell
                    value={(row as CashFlowStatement).cashflowFromFinancing}
                  />

                  {/* Dividends */}
                  <DataCell value={(row as CashFlowStatement).dividendPayout} />
                  <DataCell
                    value={(row as CashFlowStatement).dividendPayoutCommonStock}
                  />
                  <DataCell
                    value={
                      (row as CashFlowStatement).dividendPayoutPreferredStock
                    }
                  />

                  {/* Equity & Compensation */}
                  <DataCell
                    value={
                      (row as CashFlowStatement).proceedsFromRepurchaseOfEquity
                    }
                  />
                  <DataCell
                    value={(row as CashFlowStatement).stockBasedCompensation}
                  />

                  {/* Reconciliation */}
                  <DataCell
                    value={
                      (row as CashFlowStatement).changeInCashAndCashEquivalents
                    }
                  />
                  <DataCell
                    value={(row as CashFlowStatement).changeInExchangeRate}
                  />
                  <DataCell value={(row as CashFlowStatement).netIncome} />

                  {/* Free Cash Flow Metrics */}
                  <DataCell value={(row as CashFlowStatement).FCF} />
                  <PercentCell
                    value={(row as CashFlowStatement).FCF_yoy_growth}
                  />
                  <td
                    className="text-end"
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid " + COLORS.headerBottomBorder,
                      color: COLORS.mainFontColor,
                    }}
                  >
                    {((row as CashFlowStatement).FCF_per_share || 0).toFixed(2)}
                  </td>
                  <DataCell value={(row as CashFlowStatement).FCFF} />
                </>
              )}
              {type === "Earnings" && (
                <>
                  {/* Report Date */}
                  <td
                    className="text-end"
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid " + COLORS.headerBottomBorder,
                      color: COLORS.mainFontColor,
                    }}
                  >
                    {(row as EarningsReport).reportedDate || "—"}
                  </td>

                  {/* Reported EPS */}
                  <td
                    className="text-end"
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid " + COLORS.headerBottomBorder,
                      color: COLORS.mainFontColor,
                    }}
                  >
                    {(row as EarningsReport).reportedEPS?.toFixed(2) || "—"}
                  </td>

                  {/* Estimate EPS */}
                  <td
                    className="text-end"
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid" + COLORS.headerBottomBorder,
                      color: COLORS.mainFontColor,
                    }}
                  >
                    {(row as EarningsReport).estimatedEPS?.toFixed(2) || "—"}
                  </td>

                  {/* Surprise Percentage with Conditional Color */}
                  <td
                    className="text-end"
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid " + COLORS.headerBottomBorder,
                      fontWeight: "bold",
                      color:
                        (row as EarningsReport).surprisePercentage! > 0
                          ? COLORS.green.positive
                          : COLORS.red.negative,
                    }}
                  >
                    {(row as EarningsReport).surprisePercentage?.toFixed(2)}%
                  </td>

                  {/* Report Time (Before Market Open / After Market Close) */}
                  <td
                    className="text-end"
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid " + COLORS.headerBottomBorder,
                      color: COLORS.mainFontColor,
                      fontSize: "0.65rem",
                    }}
                  >
                    {(row as EarningsReport).reportTime}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

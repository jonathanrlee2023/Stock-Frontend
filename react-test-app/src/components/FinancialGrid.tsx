import React from 'react';
import { 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement, 
  EarningsReport 
} from './PriceContext';

interface GridProps {
  data: any[]; // The active slice from CompanyStats
  type: 'Income' | 'Balance' | 'Cash' | 'Earnings';
}

export const FinancialGrid: React.FC<GridProps> = ({ data, type }) => {
  if (!data || data.length === 0) return <div className="p-4 text-muted">No data available.</div>;

  const sortedData = [...data].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatValue = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    if (Math.abs(val) >= 1.0e+9) return (val / 1.0e+9).toFixed(2) + "B";
    if (Math.abs(val) >= 1.0e+6) return (val / 1.0e+6).toFixed(2) + "M";
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div className="table-responsive border rounded border-secondary" style={{ maxHeight: '600px', overflowY: 'auto' }}>
      <table className="table table-dark table-hover mb-0 text-nowrap">
        <thead className="sticky-top bg-dark" style={{ zIndex: 10 }}>
          <tr>
            <th className="border-secondary  text-start">Date</th>
            {type === 'Income' && (
              <>
                <th className="border-secondary text-end">Gross Profit</th>
                <th className="border-secondary text-end">Total Revenue</th>
                <th className="border-secondary text-end">Cost of Revenue</th>
                <th className="border-secondary text-end">Cost of Goods and Services Sold</th>
                <th className="border-secondary text-end">Operating Income</th>
                <th className="border-secondary text-end">Selling General and Administrative</th>
                <th className="border-secondary text-end">Research and Development</th>
                <th className="border-secondary text-end">Operating Expenses</th>
                <th className="border-secondary text-end">Net Interest Income</th>
                <th className="border-secondary text-end">Interest Income</th>
                <th className="border-secondary text-end">Interest Expense</th>
                <th className="border-secondary text-end">Depreciation and Amortization</th>
                <th className="border-secondary text-end">Income Before Tax</th>
                <th className="border-secondary text-end">Income Tax Expense</th>
                <th className="border-secondary text-end">Net Income From Continuing Operations</th>
                <th className="border-secondary text-end">EBIT</th>
                <th className="border-secondary text-end">EBITDA</th>
                <th className="border-secondary text-end">Net Income</th>
                <th className="border-secondary text-end">Effective Tax Rate</th>
                <th className="border-secondary text-end">Revenue Growth</th>
                <th className="border-secondary text-end">EBIT Margin</th>
                <th className="border-secondary text-end">CapEx % Revenue</th>
                <th className="border-secondary text-end">NWC % Revenue</th>
                <th className="border-secondary text-end">Depreciation and Amortization % Revenue</th>
                <th className="border-secondary text-end">EBIT Growth</th>
                <th className="border-secondary text-end">ROIC</th>
              </>
            )}
            {type === 'Balance' && (
              <>
                <th className="border-secondary text-end">Total Assets</th>
                <th className="border-secondary text-end">Total Current Assets</th>
                <th className="border-secondary text-end">Cash and Cash Equivalents</th>
                <th className="border-secondary text-end">Cash and Short Term Investments</th>
                <th className="border-secondary text-end">Inventory</th>
                <th className="border-secondary text-end">Current Net Receivables</th>
                <th className="border-secondary text-end">Total Non Current Assets</th>
                <th className="border-secondary text-end">Property Plant Equipment</th>
                <th className="border-secondary text-end">Intangible Assets</th>
                <th className="border-secondary text-end">Intangible Assets - Goodwill</th>
                <th className="border-secondary text-end">Goodwill</th>
                <th className="border-secondary text-end">LT Investments</th>
                <th className="border-secondary text-end">ST Investments</th>
                <th className="border-secondary text-end">Other Current Assets</th>
                <th className="border-secondary text-end">Total Liabilities</th>
                <th className="border-secondary text-end">Total Current Liabilities</th>
                <th className="border-secondary text-end">Current Accounts Payable</th>
                <th className="border-secondary text-end">ST Debt</th>
                <th className="border-secondary text-end">Total Non Current Liabilities</th>
                <th className="border-secondary text-end">Capital Lease Obligations</th>
                <th className="border-secondary text-end">Long Term Debt</th>
                <th className="border-secondary text-end">Current Long Term Debt</th>
                <th className="border-secondary text-end">Short Long Term Debt Total</th>
                <th className="border-secondary text-end">Other Current Liablilities</th>
                <th className="border-secondary text-end">Other Non Current Liabilities</th>
                <th className="border-secondary text-end">Total Shareholder Equity</th>
                <th className="border-secondary text-end">Treasury Stock</th>
                <th className="border-secondary text-end">Retained Earnings</th>
                <th className="border-secondary text-end">Common Stock</th>
                <th className="border-secondary text-end">Common Stock Shares Outstanding</th>
                <th className="border-secondary text-end">NWC</th>
                <th className="border-secondary text-end">Change in NWC</th>
                <th className="border-secondary text-end">NWC Ratio</th>
              </>
            )}
            {type === 'Cash' && (
              <>
                <th className="border-secondary text-end">Operating Cash Flow</th>
                <th className="border-secondary text-end">Depreciation Depletion and Amortization</th>
                <th className="border-secondary text-end">CapEx</th>
                <th className="border-secondary text-end">Change in Receivables</th>
                <th className="border-secondary text-end">Change in Inventory</th>
                <th className="border-secondary text-end">Cash Flow From Investment</th>
                <th className="border-secondary text-end">Cash Flow From Financing</th>
                <th className="border-secondary text-end">Dividend Payout</th>
                <th className="border-secondary text-end">Dividend Payout Common Stock</th>
                <th className="border-secondary text-end">Dividend Payout Preferred Stock</th>
                <th className="border-secondary text-end">Proceeds From Repurchase of Equity</th>
                <th className="border-secondary text-end">Stock Based Compensation</th>
                <th className="border-secondary text-end">Change in Cash and Cash Equivalents</th>
                <th className="border-secondary text-end">Change in Exchange Rate</th>
                <th className="border-secondary text-end">Net Income</th>
                <th className="border-secondary text-end">FCF</th>
                <th className="border-secondary text-end">FCF YoY Growth</th>
                <th className="border-secondary text-end">FCF Per Share</th>
                <th className="border-secondary text-end">FCFF</th>

              </>
            )}
            {type === 'Earnings' && (
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
              <td className="fw-bold text-start">{row.date?.split('T')[0] || '—'}</td>
              
              {type === 'Income' && (
                <>
                  {/* Top Line & Gross Profit */}
                  <td className="text-end">{formatValue((row as IncomeStatement).grossProfit)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).totalRevenue)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).costOfRevenue)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).costOfGoodsAndServices)}</td>
                  
                  {/* Operating Items */}
                  <td className="text-end">{formatValue((row as IncomeStatement).operatingIncome)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).sellingGeneralAndAdministrative)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).researchAndDevelopment)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).operatingExpenses)}</td>
                  
                  {/* Interest & D&A */}
                  <td className="text-end">{formatValue((row as IncomeStatement).netInterestIncome)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).interestIncome)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).interestExpense)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).depreciationAndAmortization)}</td>
                  
                  {/* Pre-Tax & Tax */}
                  <td className="text-end">{formatValue((row as IncomeStatement).incomeBeforeTax)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).incomeTaxExpense)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).netIncomeFromContinuingOperations)}</td>
                  
                  {/* EBIT Variants */}
                  <td className="text-end">{formatValue((row as IncomeStatement).ebit)}</td>
                  <td className="text-end">{formatValue((row as IncomeStatement).ebitda)}</td>
                  
                  {/* Bottom Line */}
                  <td className="text-end">{formatValue((row as IncomeStatement).netIncome)}</td>
                  
                  {/* Ratios & Growth (formatted as Percentages) */}
                  <td className="text-end">{((row as IncomeStatement).effectiveTaxRate || 0 * 100).toFixed(2)}%</td>
                  <td className="text-end">{((row as IncomeStatement).revGrowth || 0 * 100).toFixed(2)}%</td>
                  <td className="text-end">{((row as IncomeStatement).ebitMargin || 0 * 100).toFixed(2)}%</td>
                  <td className="text-end">{((row as IncomeStatement).capexPctRevenue || 0 * 100).toFixed(2)}%</td>
                  <td className="text-end">{((row as IncomeStatement).nwcPctRevenue || 0 * 100).toFixed(2)}%</td>
                  <td className="text-end ">{((row as IncomeStatement).daPctRevenue || 0 * 100).toFixed(2)}%</td>
                  <td className="text-end ">{((row as IncomeStatement).ebitGrowth || 0 * 100).toFixed(2)}%</td>
                  
                  {/* Final Efficiency Metric */}
                  <td className="text-end">{((row as IncomeStatement).roic || 0 * 100).toFixed(2)}%</td>
                </>
              )}

              {type === 'Balance' && (
                <>
                  <td className="text-end">{formatValue((row as BalanceSheet).totalAssets)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).totalCurrentAssets)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).cashAndCashEquivalents)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).cashAndShortTermInvestments)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).inventory)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).currentNetReceivables)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).totalNonCurrentAssets)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).propertyPlantEquipment)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).intangibleAssets)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).intangibleAssetsExcludingGoodwill)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).goodwill)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).longTermInvestments)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).shortTermInvestments)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).otherCurrentAssets)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).totalLiabilities)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).intangibleAssetsExcludingGoodwill)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).goodwill)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).longTermInvestments)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).shortTermInvestments)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).otherCurrentAssets)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).totalLiabilities)}</td>

                  <td className="text-end">{formatValue((row as BalanceSheet).totalCurrentLiabilities)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).currentAccountsPayable)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).shortTermDebt)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).totalNonCurrentLiabilities)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).capitalLeaseObligations)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).longTermDebt)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).currentLongTermDebt)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).shortLongTermDebt)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).otherCurrentLiabilities)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).otherNonCurrentLiabilities)}</td>
                  
                  {/* Equity Section */}
                  <td className="text-end">{formatValue((row as BalanceSheet).totalShareholderEquity)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).treasuryStock)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).retainedEarnings)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).commonStock)}</td>
                  <td className="text-end">{formatValue((row as BalanceSheet).commonStockSharesOutstanding)}</td>
                  
                  {/* Calculated Ratios */}
                  <td className="text-end ">{formatValue((row as BalanceSheet).NWC)}</td>
                  <td className="text-end ">{formatValue((row as BalanceSheet).deltaNWC)}</td>
                  <td className="text-end ">{((row as BalanceSheet).nwcRatio || 0).toFixed(2)}</td>
                </>
              )}

              {type === 'Cash' && (
                <>
                  {/* Operations */}
                  <td className="text-end">{formatValue((row as CashFlowStatement).operatingCashflow)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).depreciationDepletionAndAmortization)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).capitalExpenditures)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).changeInReceivables)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).changeInInventory)}</td>
                  
                  {/* Investing & Financing */}
                  <td className="text-end">{formatValue((row as CashFlowStatement).cashflowFromInvestment)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).cashflowFromFinancing)}</td>
                  
                  {/* Dividends */}
                  <td className="text-end">{formatValue((row as CashFlowStatement).dividendPayout)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).dividendPayoutCommonStock)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).dividendPayoutPreferredStock)}</td>
                  
                  {/* Equity & Compensation */}
                  <td className="text-end">{formatValue((row as CashFlowStatement).proceedsFromRepurchaseOfEquity)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).stockBasedCompensation)}</td>
                  
                  {/* Reconciliation */}
                  <td className="text-end">{formatValue((row as CashFlowStatement).changeInCashAndCashEquivalents)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).changeInExchangeRate)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).netIncome)}</td>
                  
                  {/* Free Cash Flow Metrics */}
                  <td className="text-end">{formatValue((row as CashFlowStatement).FCF)}</td>
                  <td className="text-end">
                    {((row as CashFlowStatement).FCF_yoy_growth ? (row as CashFlowStatement).FCF_yoy_growth! * 100 : 0).toFixed(2)}%
                  </td>
                  <td className="text-end">{((row as CashFlowStatement).FCF_per_share || 0).toFixed(2)}</td>
                  <td className="text-end">{formatValue((row as CashFlowStatement).FCFF)}</td>
                </>
              )}

              {type === 'Earnings' && (
                <>
                  <td className="text-end">{(row as EarningsReport).reportedDate || '—'}</td>
                  <td className="text-end">{(row as EarningsReport).reportedEPS?.toFixed(2) || '—'}</td>
                  <td className="text-end">{(row as EarningsReport).estimatedEPS?.toFixed(2) || '—'}</td>
                  <td className={`text-end ${(row as EarningsReport).surprisePercentage! > 0 ? 'text-success' : 'text-danger'}`}>
                    {(row as EarningsReport).surprisePercentage?.toFixed(2)}%
                  </td>
                  <td className="text-end">{(row as EarningsReport).reportTime}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
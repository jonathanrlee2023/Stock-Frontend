import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export type CompanyStats = {
  Symbol: string;
  MarketCap: number;
  PEG: number | null;
  Sloan: number | null;
  ROIC: number | null;
  HistGrowth: number | null;
  ForecastedGrowth: number | null;
  TrailingPEG: number | null;
  ForwardPEG: number | null;
  IntrinsicPrice: number | null;
  DividendPrice: number | null;
  PriceAtReport: number | null;
  WACC: number | null;
  FCFF: number | null;
  FCF: number | null;
  FCFPerShare: number | null;
  NWC: number | null;
  PriceTarget: number | null;
  StrongBuy: number | null;
  Buy: number | null;
  Hold: number | null;
  Sell: number | null;
  StrongSell: number | null;
  EarningsDate: string | null;
  Grade: number | null;
  Sector: string | null;
  Industry: string | null;
  AnnualIncome: IncomeStatement[] | null;
  AnnualBalance: BalanceSheet[] | null;
  AnnualCash: CashFlowStatement[] | null;
  AnnualEarnings: EarningsReport[] | null;
  QuarterlyIncome: IncomeStatement[] | null;
  QuarterlyBalance: BalanceSheet[] | null;
  QuarterlyCash: CashFlowStatement[] | null;
  QuarterlyEarnings: EarningsReport[] | null;
};

export type EarningsReport = {
  date: string;
  ticker: string;
  report_type: string;
  symbol_id: number;
  reportedDate: string;
  reportTime: string;
  reportedEPS: number | null;
  estimatedEPS: number | null;
  surprise: number | null;
  surprisePercentage: number | null;
};

export type CashFlowStatement = {
  date: string;
  reportedCurrency: string;
  ticker: string;
  report_type: string;
  symbol_id: number;
  operatingCashflow: number | null;
  paymentsForOperatingActivities: number | null;
  proceedsFromOperatingActivities: number | null;
  changeInOperatingAssets: number | null;
  changeInOperatingLiabilities: number | null;
  depreciationDepletionAndAmortization: number | null;
  changeInReceivables: number | null;
  changeInInventory: number | null;
  stockBasedCompensation: number | null;
  capitalExpenditures: number | null;
  cashflowFromInvestment: number | null;
  cashflowFromFinancing: number | null;
  dividendPayout: number | null;
  dividendPayoutCommonStock: number | null;
  dividendPayoutPreferredStock: number | null;
  proceedsFromRepurchaseOfEquity: number | null;
  paymentsForRepurchaseOfEquity: number | null;
  proceedsFromIssuanceOfDebt: number | null;
  netIncome: number | null;
  profitLoss: number | null;
  changeInCashAndCashEquivalents: number | null;
  changeInExchangeRate: number | null;
  FCF: number | null;
  FCF_yoy_growth: number | null;
  FCF_per_share: number | null;
  FCFF: number | null;
};

export type IncomeStatement = {
  date: string; // ISO string format
  reportedCurrency: string;
  ticker: string;
  report_type: string;
  symbol_id: number;
  grossProfit: number | null;
  totalRevenue: number | null;
  costOfRevenue: number | null;
  costOfGoodsAndServicesSold: number | null;
  operatingIncome: number | null;
  sellingGeneralAndAdministrative: number | null;
  researchAndDevelopment: number | null;
  operatingExpenses: number | null;
  investmentIncome: number | null;
  netInterestIncome: number | null;
  interestIncome: number | null;
  interestExpense: number | null;
  nonInterestIncome: number | null;
  otherNonOperatingIncome: number | null;
  depreciation: number | null;
  depreciationAndAmortization: number | null;
  incomeBeforeTax: number | null;
  incomeTaxExpense: number | null;
  interestAndDebtExpense: number | null;
  netIncomeFromContinuingOperations: number | null;
  comprehensiveIncome: number | null;
  ebit: number | null;
  ebitda: number | null;
  netIncome: number | null;
  effectiveTaxRate: number | null;
  revGrowth: number | null;
  ebitMargin: number | null;
  capexPctRevenue: number | null;
  nwcPctRevenue: number | null;
  daPctRevenue: number | null;
  ebitGrowth: number | null;
  roic: number | null;
};

export type BalanceSheet = {
  date: string;
  reportedCurrency: string;
  totalAssets: number | null;
  totalCurrentAssets: number | null;
  cashAndCashEquivalents: number | null;
  cashAndShortTermInvestments: number | null;
  inventory: number | null;
  currentNetReceivables: number | null;
  totalNonCurrentAssets: number | null;
  propertyPlantEquipment: number | null;
  accumulatedDepreciation: number | null;
  intangibleAssets: number | null;
  intangibleAssetsExcludingGoodwill: number | null;
  goodwill: number | null;
  investments: number | null;
  longTermInvestments: number | null;
  shortTermInvestments: number | null;
  otherCurrentAssets: number | null;
  otherNonCurrentAssets: number | null;
  totalLiabilities: number | null;
  totalCurrentLiabilities: number | null;
  currentAccountsPayable: number | null;
  deferredRevenue: number | null;
  currentDebt: number | null;
  shortTermDebt: number | null;
  totalNonCurrentLiabilities: number | null;
  capitalLeaseObligations: number | null;
  longTermDebt: number | null;
  currentLongTermDebt: number | null;
  longTermDebtNonCurrent: number | null;
  shortLongTermDebt: number | null;
  otherCurrentLiabilities: number | null;
  otherNonCurrentLiabilities: number | null;
  totalShareholderEquity: number | null;
  treasuryStock: number | null;
  retainedEarnings: number | null;
  commonStock: number | null;
  commonStockSharesOutstanding: number | null;
  ticker: string;
  report_type: string;
  NWC: number | null;
  deltaNWC: number | null;
  nwcRatio: number | null;
  symbol_id: number;
};

interface CompanyContextValue {
  companyStats: Record<string, CompanyStats>;
  updateCompanyStats: (symbol: string, stats: CompanyStats) => void;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(
  undefined,
);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [companyStats, setCompanyStats] = useState<
    Record<string, CompanyStats>
  >({});

  const MAX_COMPANY_CACHE = 30;
  const companyQueue = useRef<string[]>([]);
  const inQueue = useRef<Set<string>>(new Set());

  const updateCompanyStats = (symbol: string, stats: CompanyStats) => {
    setCompanyStats((prev) => {
      const next = { ...prev, [symbol]: stats };

      if (!inQueue.current.has(symbol)) {
        companyQueue.current.push(symbol);
        inQueue.current.add(symbol);
      }

      if (companyQueue.current.length > MAX_COMPANY_CACHE) {
        const oldest = companyQueue.current.shift()!;
        inQueue.current.delete(oldest);
        delete next[oldest];
      }

      return next;
    });
  };

  return (
    <CompanyContext.Provider value={{ companyStats, updateCompanyStats }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompanyContext = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompanyContext must be inside CompanyProvider");
  return ctx;
};

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export type OptionPoint = {
  Symbol: string; // Capitalized in JSON
  Mark: number; // Capitalized in JSON
  HighPrice: number;
  LastPrice: number;
  AskPrice: number;
  BidPrice: number;
  timestamp: number; // Lowercase in JSON
  IV: number; // Double-check Go tags for these
  Delta: number;
  Gamma: number;
  Theta: number;
  Vega: number;
};

export type StockPoint = {
  Symbol: string;
  Mark: number;
  BidPrice: number;
  AskPrice: number;
  LastPrice: number;
  timestamp: number;
};

export type BalancePoint = {
  timestamp: number;
  Balance: number;
  Cash: number;
  PortfolioID: number;
};

export type PortfolioBalancePoint = Record<number, BalancePoint[]>;

export type HistoricalStockPoint = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
};

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
  costOfGoodsAndServices: number | null;
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

export type OptionExpiration = {
  Call: string[];
  Put: string[];
  PriceHistory: HistoricalStockPoint[];
  Quote: StockPoint;
};

type PriceStreamContextValue = {
  optionPoints: Record<string, OptionPoint[]>;
  stockPoints: Record<string, StockPoint[]>;
  companyStats: Record<string, CompanyStats>;
  historicalStockPoints: Record<string, HistoricalStockPoint[]>;
  pendingRequests: Set<string>;
  optionExpirations: Record<string, OptionExpiration>;
  balancePoints: PortfolioBalancePoint;
  startStockStream: (symbol: string) => Promise<void>;
  startOptionStream: (
    stockSymbol: string,
    strikePrice: string,
    day: string,
    month: string,
    year: string,
    type: string,
  ) => Promise<void>;
  updateOptionPoint: (symbol: string, point: OptionPoint) => void;
  updateStockPoint: (symbol: string, point: StockPoint) => void;
  updateCompanyStats: (symbol: string, stats: CompanyStats) => void;
  updateHistoricalStockPoint: (
    symbol: string,
    point: HistoricalStockPoint[],
  ) => void;
  updateOptionExpirations: (
    symbol: string,
    expirations: OptionExpiration,
  ) => void;
  updateBalancePoint: (point: BalancePoint) => void;
};

const PriceStreamContext = createContext<PriceStreamContextValue | undefined>(
  undefined,
);

function formatOptionSymbol(
  stock: string,
  day: string,
  month: string,
  year: string,
  type: string,
  strike: string,
): string {
  const yy = year.length === 4 ? year.slice(2) : year; // Convert YYYY to YY if needed
  const typeLetter = type.toUpperCase().startsWith("C") ? "C" : "P";

  // Convert strike price string to number, then format
  const strikeNum = parseFloat(strike);
  const strikeStr = (strikeNum * 1000).toFixed(0).padStart(8, "0");

  return `${stock.toUpperCase()}_${yy}${month.padStart(2, "0")}${day.padStart(
    2,
    "0",
  )}${typeLetter}${strikeStr}`;
}

export const PriceStreamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [optionPoints, setOptionPoints] = useState<
    Record<string, OptionPoint[]>
  >({});
  const [stockPoints, setStockPoints] = useState<Record<string, StockPoint[]>>(
    {},
  );
  const [companyStats, setCompanyStats] = useState<
    Record<string, CompanyStats>
  >({});
  const [historicalStockPoints, setHistoricalStockPoints] = useState<
    Record<string, HistoricalStockPoint[]>
  >({});

  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set(),
  );

  const [optionExpirations, setOptionExpirations] = useState<
    Record<string, OptionExpiration>
  >({});

  const [balancePoints, setBalancePoints] = useState<PortfolioBalancePoint>({});

  const startStockStream = useCallback(
    async (symbol: string) => {
      const cleanSymbol = symbol.toUpperCase().trim();

      // 1. Guard: Don't fetch if we have data OR if a request is already flying
      if (
        historicalStockPoints[cleanSymbol] ||
        pendingRequests.has(cleanSymbol)
      )
        return;

      // 2. Mark as pending
      setPendingRequests((prev) => new Set(prev).add(cleanSymbol));

      // 3. Setup Timeout Controller (Cancel fetch if cloud takes > 5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const baseUrl = "http://localhost:8080";
        const response = await fetch(
          `${baseUrl}/startStockStream?symbol=${cleanSymbol}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        console.log(`Stream initialized for ${cleanSymbol}`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.error(`Fetch for ${cleanSymbol} timed out.`);
        } else {
          console.error("API error:", err);
        }
      } finally {
        clearTimeout(timeoutId);
        // 4. Remove from pending regardless of outcome
        setPendingRequests((prev) => {
          const next = new Set(prev);
          next.delete(cleanSymbol);
          return next;
        });
      }
    },
    [historicalStockPoints, pendingRequests],
  );

  const startOptionStream = useCallback(
    async (
      stockSymbol: string,
      strikePrice: string,
      day: string,
      month: string,
      year: string,
      type: string,
    ) => {
      const cleanSymbol = stockSymbol.toUpperCase().trim();

      const optionID = formatOptionSymbol(
        cleanSymbol,
        day,
        month,
        year,
        type,
        strikePrice,
      );

      // 1. Guard: Don't fetch if we have data OR if a request is already flying
      if (pendingRequests.has(optionID)) return;

      // 2. Mark as pending
      setPendingRequests((prev) => new Set(prev).add(optionID));

      // 3. Setup Timeout Controller (Cancel fetch if cloud takes > 5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const baseUrl = "http://localhost:8080";
        const response = await fetch(
          `${baseUrl}/startOptionStream?symbol=${stockSymbol}&price=${strikePrice}&day=${day}&month=${month}&year=${year}&type=${type}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        console.log(`Stream initialized for ${cleanSymbol}`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.error(`Fetch for ${cleanSymbol} timed out.`);
        } else {
          console.error("API error:", err);
        }
      } finally {
        clearTimeout(timeoutId);
        // 4. Remove from pending regardless of outcome
        setPendingRequests((prev) => {
          const next = new Set(prev);
          next.delete(optionID);
          return next;
        });
      }
    },
    [optionPoints, pendingRequests],
  );

  const updateOptionPoint = (symbol: string, point: OptionPoint) => {
    setOptionPoints((prev) => {
      const prevPoints = prev[symbol] || [];
      return {
        ...prev,
        [symbol]: [...prevPoints.slice(-1920), point],
      };
    });
  };

  const updateStockPoint = (symbol: string, point: StockPoint) => {
    setStockPoints((prev) => {
      const prevPoints = prev[symbol] || [];
      return {
        ...prev,
        [symbol]: [...prevPoints.slice(-1920), point],
      };
    });
  };

  const updateCompanyStats = (symbol: string, stats: CompanyStats) => {
    setCompanyStats((prev) => ({
      ...prev,
      [symbol]: stats,
    }));
  };

  const updateHistoricalStockPoint = (
    symbol: string,
    newPoints: HistoricalStockPoint[],
  ) => {
    setHistoricalStockPoints((prev) => {
      const prevPoints = prev[symbol] || [];
      if (prevPoints.length > 0) {
        return prev;
      }
      const combined = [...prevPoints, ...newPoints];
      return {
        ...prev,
        [symbol]: combined,
      };
    });
  };

  const updateOptionExpirations = (
    symbol: string,
    expirations: OptionExpiration,
  ) => {
    setOptionExpirations((prev) => ({
      ...prev,
      [symbol]: expirations,
    }));
  };

  const updateBalancePoint = (point: BalancePoint) => {
    setBalancePoints((prev) => {
      const id = point.PortfolioID;

      const existingHistory = prev[id] || [];

      const updatedHistory = [...existingHistory, point].slice(-1000);

      return {
        ...prev,
        [id]: updatedHistory,
      };
    });
  };

  return (
    <PriceStreamContext.Provider
      value={{
        optionPoints,
        stockPoints,
        companyStats,
        historicalStockPoints,
        pendingRequests,
        optionExpirations,
        balancePoints,
        startStockStream,
        startOptionStream,
        updateOptionPoint,
        updateStockPoint,
        updateCompanyStats,
        updateHistoricalStockPoint,
        updateOptionExpirations,
        updateBalancePoint,
      }}
    >
      {children}
    </PriceStreamContext.Provider>
  );
};

export const usePriceStream = () => {
  const ctx = useContext(PriceStreamContext);
  if (!ctx) {
    throw new Error("usePriceStream must be used inside PriceStreamProvider");
  }
  return ctx;
};

import React, { useState } from 'react';
import { CompanyStats, usePriceStream } from "./PriceContext";
import { FinancialGrid } from './FinancialGrid';
import { useWS } from './WSContest';

type Period = 'Annual' | 'Quarterly';
type ReportType = 'Income' | 'Balance' | 'Cash' | 'Earnings';

const getActiveReport = (
  stats: CompanyStats, 
  period: Period, 
  type: ReportType
) => {
  const key = `${period}${type}` as keyof CompanyStats;
  return stats[key] as any[]; // Type assertion to help TS understand it's an array
};
interface FinancialsCardProps {
  setActiveCard: (query: string) => void;
}

export const FinancialsCard: React.FC<FinancialsCardProps> = ({ setActiveCard }) => {
  const [period, setPeriod] = useState<Period>('Annual');
  const [reportType, setReportType] = useState<ReportType>('Income');
  const { companyStats } = usePriceStream();
  const { previousID, previousCard} = useWS();
  
  const stats = companyStats[previousID];
  const activeData = getActiveReport(stats, period, reportType);

  return (
    <div className="card bg-dark text-white p-4 h-100 d-flex flex-column" 
        style={{ minHeight: '80vh', maxHeight: '95vh' }}>
      
      {/* Header Section (Static) */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center">
          {previousCard && (
            <button
              className="btn btn-outline-light me-2"
              onClick={() => setActiveCard(previousCard)}
              style={{ borderRadius: "50%", padding: "5px 12px" }}
            >
              ←
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setActiveCard("home")}>
            Back to Home
          </button>
        </div>

        <h2 className="mb-0 text-truncate">
          {stats.Symbol} <small className="text-muted fs-6">{stats.Sector}</small>
        </h2>
        
        <div className="d-flex gap-2">
          {/* Period Toggle */}
          <div className="btn-group">
            {['Annual', 'Quarterly'].map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
                onClick={() => setPeriod(p as Period)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Report Toggle */}
          <div className="btn-group">
            {['Income', 'Balance', 'Cash', 'Earnings'].map((r) => (
              <button
                key={r}
                className={`btn btn-sm ${reportType === r ? 'btn-info' : 'btn-outline-secondary text-white'}`}
                onClick={() => setReportType(r as ReportType)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="report-container flex-grow-1 d-flex flex-column overflow-hidden mt-2">
        {/* The Scroll Window: This is the actual "viewbox" */}
        <div className="flex-grow-1 overflow-auto border border-secondary rounded custom-scrollbar">
              {activeData && activeData.length > 0 ? (
                /* Ensure FinancialGrid parent allows internal scrolling */
                  <FinancialGrid data={activeData} type={reportType} />
              ) : (
                <div className="text-center py-5 text-muted border border-secondary rounded h-100 d-flex align-items-center justify-content-center">
                  No {period} {reportType} data available.
                </div>
              )}
        </div>
      </div>
    </div>
  );
};
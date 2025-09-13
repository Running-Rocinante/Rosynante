export enum ViewMode {
  TOP_PICKS = 'TOP_PICKS',
  KEYWORD = 'KEYWORD',
  TRENDS = 'TRENDS',
  SECTOR = 'SECTOR',
  SCREENER = 'SCREENER',
  MOMENTUM = 'MOMENTUM',
  VIRTUAL_INVESTMENT = 'VIRTUAL_INVESTMENT',
}

export interface Company {
  name: string;
  ticker: string;
}

export interface KeywordTrend {
  keyword: string;
  reason: string;
  trendData: number[];
  companies: Company[];
}

export interface Trend {
  trendName: string;
  explanation: string;
  companies: Company[];
}

export interface SectorCompany extends Company {
    rationale: string;
}

export interface SectorAnalysis {
    sectorOverview: string;
    growthDrivers: string[];
    risks: string[];
    promisingCompanies: SectorCompany[];
}

export interface ScreenedCompany extends Company {
    summary: string;
    justification: string;
}

export interface ScreeningCriteria {
    marketCap: string;
    peRatio: string;
    growthPotential: string;
}

export interface MomentumStock {
    name: string;
    ticker: string;
    signal: string;
}

export interface StockDetailInfo {
  name: string;
  ticker: string;
  context: string; // The reason it was recommended
}

export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TechnicalAnalysis {
  entryPrice: string;
  targetPrice: string;
  stopLossPrice: string;
  analysisSummary: string;
  previousClose: string;
  previousAllTimeHigh: string;
  currentPrice: string;
  keywords: string[];
  chartData: CandlestickData[];
}

export interface TopPickStock extends Company {
  rationale: string;
}

export interface TopPicksAnalysis {
  highGrowth: TopPickStock[];
  mediumRisk: TopPickStock[];
  safe: TopPickStock[];
}

export interface VirtualInvestment {
  id: string;
  name: string;
  ticker: string;
  purchaseDate: string;
  quantity: number;
  avgPrice: number;
}

export interface InvestmentProjection {
  currentValue: number;
  projectedValue6M: number;
  targetPrice6M: number;
  rationale: string;
}

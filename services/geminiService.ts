import { GoogleGenAI, Type } from "@google/genai";
import type { ScreeningCriteria, StockDetailInfo, VirtualInvestment } from '../types';

// FIX: Use process.env.API_KEY as per the coding guidelines. This also resolves the TypeScript error.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const keywordTrendSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      keyword: { type: Type.STRING, description: '트래픽이 증가하는 키워드' },
      reason: { type: Type.STRING, description: '트래픽 증가 이유에 대한 간략한 설명' },
      trendData: {
        type: Type.ARRAY,
        items: { type: Type.NUMBER },
        description: '지난 한 달간의 트래픽 추이를 나타내는 3개의 숫자 배열 (예: [10, 45, 90])'
      },
      companies: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: '회사 이름' },
            ticker: { type: Type.STRING, description: '회사의 티커 심볼' },
          },
        },
        description: '키워드와 관련된 추천 종목 목록'
      },
    },
  },
};

const trendSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      trendName: { type: Type.STRING, description: '트렌드의 이름' },
      explanation: { type: Type.STRING, description: '트렌드에 대한 간략한 설명' },
      companies: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: '회사 이름' },
            ticker: { type: Type.STRING, description: '회사의 티커 심볼' },
          },
        },
      },
    },
  },
};

const sectorSchema = {
    type: Type.OBJECT,
    properties: {
        sectorOverview: { type: Type.STRING, description: "섹터에 대한 전반적인 개요" },
        growthDrivers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "성장 동력 목록" },
        risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "잠재적 위험 요소 목록" },
        promisingCompanies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "회사 이름" },
                    ticker: { type: Type.STRING, description: "회사의 티커 심볼" },
                    rationale: { type: Type.STRING, description: "회사가 유망한 이유" },
                },
            },
        },
    },
};

const screenerSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "회사 이름" },
            ticker: { type: Type.STRING, description: "회사의 티커 심볼" },
            summary: { type: Type.STRING, description: "회사의 사업 개요" },
            justification: { type: Type.STRING, description: "선정 기준에 부합하는 이유" },
        },
    },
};

const momentumSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "회사 이름" },
            ticker: { type: Type.STRING, description: "회사의 티커 심볼" },
            signal: { type: Type.STRING, description: "포착된 구체적인 기술적 상승 모멘텀 신호" },
        },
    },
};

const technicalAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        entryPrice: { type: Type.STRING, description: "기술적 분석에 기반한 진입 추천 가격 범위" },
        targetPrice: { type: Type.STRING, description: "기술적 분석에 기반한 목표 가격" },
        stopLossPrice: { type: Type.STRING, description: "리스크 관리를 위한 손절 추천 가격" },
        analysisSummary: { type: Type.STRING, description: "제시된 가격들의 근거가 되는 기술적 분석 요약" },
        previousClose: { type: Type.STRING, description: "가장 최근 거래일의 종가 (전일 종가). chartData의 마지막에서 두 번째 종가와 일치해야 함." },
        previousAllTimeHigh: { type: Type.STRING, description: "분석 시점 이전의 사상 최고가(All-Time High)" },
        currentPrice: { type: Type.STRING, description: "분석 시점의 현재가. chartData의 마지막 종가와 일치해야 함." },
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "분석에 사용된 주요 기술적 지표나 패턴 키워드 목록 (예: '골든 크로스', 'RSI 과매수', '지지선')"
      },
      chartData: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "날짜 (YYYY-MM-DD 형식)" },
            open: { type: Type.NUMBER },
            high: { type: Type.NUMBER },
            low: { type: Type.NUMBER },
            close: { type: Type.NUMBER },
          },
        },
        description: "차트 생성을 위한 과거 12주간의 주간 캔들스틱 데이터"
      }
    },
};

const topPicksSchema = {
  type: Type.OBJECT,
  properties: {
    highGrowth: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          ticker: { type: Type.STRING },
          rationale: { type: Type.STRING, description: "이 종목을 고수익 성장주로 추천하는 이유" },
        },
      },
      description: "고수익 성장 투자 종목 2개"
    },
    mediumRisk: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          ticker: { type: Type.STRING },
          rationale: { type: Type.STRING, description: "이 종목을 중위험 중수익 투자 종목으로 추천하는 이유" },
        },
      },
      description: "중위험 중수익 투자 종목 1개"
    },
    safe: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          ticker: { type: Type.STRING },
          rationale: { type: Type.STRING, description: "이 종목을 안전 투자 종목으로 추천하는 이유" },
        },
      },
      description: "안전 투자 종목 1개"
    },
  },
};

const investmentProjectionSchema = {
    type: Type.OBJECT,
    properties: {
        currentValue: { type: Type.NUMBER, description: "매입 수량에 따른 현재 추정 가치" },
        projectedValue6M: { type: Type.NUMBER, description: "6개월 후의 예상 가치" },
        targetPrice6M: { type: Type.NUMBER, description: "6개월 후의 예상 목표 주가" },
        rationale: { type: Type.STRING, description: "예측의 근거가 되는 시장 동향 및 기업 분석 요약" },
    },
};

export const getKeywordTrends = async () => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "최근 1개월 동안 유튜브, 뉴스 포털, SNS에서 트래픽이 눈에 띄게 증가한 기술 및 투자 관련 키워드를 5개 찾아주세요. 각 키워드에 대해 트래픽 증가 이유를 간략히 설명하고, 지난 한 달간의 트래픽 추이를 나타내는 3개의 숫자 배열(예: [10, 45, 90])을 'trendData'로 포함해 주세요. 또한, 각 키워드와 관련된 유망 상장 기업 2-3개를 이름과 티커 심볼과 함께 추천해주세요. 결과는 JSON 형식으로 제공해 주세요.",
            config: {
                responseMimeType: "application/json",
                responseSchema: keywordTrendSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error fetching keyword trends:", error);
        throw new Error("급상승 키워드를 가져오는 데 실패했습니다.");
    }
};

export const getMarketTrends = async () => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "현재 글로벌 시장을 분석하고 다음 분기를 위한 상위 5개 신흥 투자 트렌드를 식별해 주세요. 각 트렌드에 대해 간략한 설명과 2-3개의 대표적인 상장 기업(티커 심볼 포함)을 나열해 주세요. 결과는 JSON 형식으로 제공해 주세요.",
            config: {
                responseMimeType: "application/json",
                responseSchema: trendSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error fetching market trends:", error);
        throw new Error("시장 트렌드를 가져오는 데 실패했습니다.");
    }
};

export const analyzeSector = async (sector: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `'${sector}' 섹터를 분석해 주세요. 주요 성장 동력, 잠재적 위험, 주요 기업은 무엇인가요? 이 섹터 내에서 유망한 기업 3개를 선정하고 그들이 성장에 유리한 위치에 있는 이유를 설명해 주세요. 티커 심볼도 함께 제공해 주세요. 결과는 JSON 형식으로 제공해 주세요.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: sectorSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error analyzing sector ${sector}:`, error);
        throw new Error("섹터 분석에 실패했습니다.");
    }
};

export const screenCompanies = async (criteria: ScreeningCriteria) => {
    const criteriaText = `시가총액: ${criteria.marketCap}, P/E 비율: ${criteria.peRatio}, 성장 잠재력: ${criteria.growthPotential}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `다음 기준: [${criteriaText}]에 부합하는 상장 기업 5개를 찾아주세요. 각 기업에 대해 이름, 티커 심볼, 간략한 사업 개요, 그리고 해당 기준에 부합하는 이유를 설명해 주세요. 결과는 JSON 형식으로 제공해 주세요.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: screenerSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error screening companies:", error);
        throw new Error("기업 스크리닝에 실패했습니다.");
    }
};

export const findMomentumStocks = async (market: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `'${market}' 시장에서 최근 차트상 강한 상승 모멘텀 신호를 보이는 주식 5개를 찾아주세요. 신호의 종류는 골든 크로스(단기 이동평균선이 장기 이동평균선을 상향 돌파), 거래량 급증을 동반한 주요 저항선 돌파, MACD 상향 돌파 등이 될 수 있습니다. 각 주식에 대해 회사명, 티커 심볼, 그리고 어떤 기술적 신호가 포착되었는지 구체적으로 설명해주세요. 결과는 JSON 형식으로 제공해주세요.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: momentumSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error finding momentum stocks for ${market}:`, error);
        throw new Error("모멘텀 신호 종목을 찾는 데 실패했습니다.");
    }
};

export const getTechnicalAnalysis = async (stockInfo: StockDetailInfo) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `주식 ${stockInfo.name}(${stockInfo.ticker})이(가) '${stockInfo.context}'라는 이유로 추천되었습니다. 이 맥락을 바탕으로 해당 주식에 대한 기술적 분석을 수행해주세요. 이동평균선, RSI, MACD, 지지/저항선 등을 고려하여 적정 매수가(진입 추천가), 목표가, 그리고 손절가를 제시해주세요. 또한, 이러한 가격을 제안하는 근거에 대한 분석 요약을 포함해주세요.
            가장 최근 거래일의 종가('previousClose')와 분석 시점 이전의 사상 최고가('previousAllTimeHigh'), 그리고 분석 시점의 현재가('currentPrice')도 알려주세요.
            마지막으로, 분석에 사용된 핵심 기술적 지표나 패턴을 나타내는 키워드 배열('keywords')을 3~4개 포함해주세요 (예: '골든 크로스', 'RSI 과매수', '지지선 확인').
            
            추가적으로, 분석 내용을 시각화할 수 있는 캔들스틱 차트 데이터를 생성해주세요. 'chartData' 필드에 과거 12주 동안의 주간 캔들스틱 데이터(날짜, 시가, 고가, 저가, 종가)를 12개 생성하여 포함해주세요. 이 데이터는 당신이 제안한 매수가, 목표가, 손절가와 일관된 흐름을 보여야 합니다. 'currentPrice'는 'chartData'의 마지막 종가와 일치해야 하고, 'previousClose'는 'chartData'의 마지막에서 두 번째 종가와 일치해야 합니다. 결과는 JSON 형식으로 제공해주세요.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: technicalAnalysisSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error getting technical analysis for ${stockInfo.ticker}:`, error);
        throw new Error("종목 기술적 분석에 실패했습니다.");
    }
};

export const getTopPicks = async () => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `당신은 "마라톤투자자 로시난테"라는 이름의 경험 많은 투자 전문가입니다. 시장 트렌드, 기술적 모멘텀, 펀더멘털 분석 등 다양한 분석 기법을 종합적으로 활용하여 오늘의 Top Pick 종목을 추천해주세요. 추천 종목은 다음 세 가지 카테고리로 분류하여 제시해야 합니다.
1. 고수익 성장투자 (2개 종목): 높은 성장 잠재력을 가진 종목.
2. 중위험 중수익 투자 (1개 종목): 안정성과 성장의 균형이 잡힌 종목.
3. 안전투자 (1개 종목): 가치와 안정성에 중점을 둔 방어적인 성격의 종목.

각 종목에 대해 회사 이름, 티커 심볼, 그리고 해당 카테고리로 추천하는 명확한 이유(rationale)를 포함해주세요. 결과는 반드시 JSON 형식으로 제공해주세요.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: topPicksSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error fetching top picks:", error);
        throw new Error("오늘의 Top Pick을 가져오는 데 실패했습니다.");
    }
};

export const getInvestmentProjection = async (investment: VirtualInvestment) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `다음 가상 투자 건에 대한 미래 수익률 예측 리포트를 작성해주세요:
- 종목명: ${investment.name} (${investment.ticker})
- 매입일: ${investment.purchaseDate}
- 수량: ${investment.quantity}
- 평균 단가: ${investment.avgPrice}

리포트에는 다음 내용을 포함해야 합니다:
1. 'currentValue': 현재 시점의 추정 가치 (수량 * 현재 추정가).
2. 'targetPrice6M': 지금으로부터 6개월 후의 예상 목표 주가.
3. 'projectedValue6M': 6개월 후의 예상 총 가치 (수량 * targetPrice6M).
4. 'rationale': 해당 목표 주가를 예측하는 근거. 시장 동향, 기업의 펀더멘털, 예상되는 이벤트 등을 간결하게 요약해주세요.

결과는 반드시 JSON 형식으로 제공해주세요.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: investmentProjectionSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error getting investment projection for ${investment.ticker}:`, error);
        throw new Error("가상투자 수익률 예측에 실패했습니다.");
    }
};

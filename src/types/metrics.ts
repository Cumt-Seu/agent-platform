// 效能度量相关类型定义

export interface KpiData {
  totalCalls: number;
  callTrend: number;
  successRate: number;
  successRateTrend: number;
  avgDuration: number;
  avgDurationTrend: number;
  tokenUsage: number;
  tokenUsageTrend: number;
}

export interface TrendData {
  labels: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

export interface SkillDistribution {
  name: string;
  value: number;
}

export interface RagPerformance {
  p99Latency: { time: string; value: number }[];
  accuracy: { time: string; value: number }[];
}

// 效能度量服务 — 支持 Mock 模式

import request from '../utils/request';
import type { KpiData, TrendData, SkillDistribution, RagPerformance } from '../types';
import { mockKpiData, mockSkillDistribution, mockTrendData, mockRagPerformance } from '../mock/data';

export interface MetricsOverview {
  kpi: KpiData;
  skillDistribution: SkillDistribution[];
}

let useMock = false;

export const _setMockMode = (v: boolean) => { useMock = v; };

export const metricsService = {
  overview: async (params?: { timeRange?: string }): Promise<MetricsOverview> => {
    if (useMock) return { kpi: mockKpiData, skillDistribution: mockSkillDistribution };
    try {
      const result = await request.get<never, MetricsOverview>('/metrics/overview', { params });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { kpi: mockKpiData, skillDistribution: mockSkillDistribution };
    }
  },

  trends: async (params?: { timeRange?: string }): Promise<TrendData> => {
    if (useMock) return mockTrendData;
    try {
      const result = await request.get<never, TrendData>('/metrics/trends', { params });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockTrendData;
    }
  },

  ragPerformance: async (params?: { timeRange?: string }): Promise<RagPerformance> => {
    if (useMock) return mockRagPerformance;
    try {
      const result = await request.get<never, RagPerformance>('/metrics/rag-performance', { params });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockRagPerformance;
    }
  },

  isMockMode: () => useMock,
};

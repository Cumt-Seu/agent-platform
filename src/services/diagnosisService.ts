// 故障排障服务 — 支持 Mock 模式

import request from '../utils/request';
import type { DiagnosisTask, DiagnosisInput, DiagnosisResult, DiagnosisStep } from '../types';
import { mockDiagnosisTasks, mockDiagnosisResults } from '../mock/data';

let useMock = false;

export const _setMockMode = (v: boolean) => { useMock = v; };

export const diagnosisService = {
  analyze: async (params: DiagnosisInput): Promise<DiagnosisTask> => {
    if (useMock) {
      return {
        diagnosisId: `dg-${Date.now()}`, title: `${params.serviceName || '服务'}故障排查`,
        serviceName: params.serviceName || 'unknown', status: 'RUNNING', createdAt: Date.now(),
      };
    }
    try {
      const result = await request.post<never, DiagnosisTask>('/diagnosis', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return {
        diagnosisId: `dg-${Date.now()}`, title: `${params.serviceName || '服务'}故障排查`,
        serviceName: params.serviceName || 'unknown', status: 'RUNNING', createdAt: Date.now(),
      };
    }
  },

  getTasks: async (): Promise<DiagnosisTask[]> => {
    if (useMock) return mockDiagnosisTasks;
    try {
      const result = await request.get<never, DiagnosisTask[]>('/diagnosis');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockDiagnosisTasks;
    }
  },

  getTaskDetail: async (diagnosisId: string): Promise<{ task: DiagnosisTask; result?: DiagnosisResult; steps: DiagnosisStep[] }> => {
    if (useMock) {
      const task = mockDiagnosisTasks.find((t) => t.diagnosisId === diagnosisId) || mockDiagnosisTasks[0];
      const mockData = mockDiagnosisResults[diagnosisId];
      return {
        task,
        result: mockData?.result,
        steps: mockData?.steps || [],
      };
    }
    try {
      const result = await request.get<never, { task: DiagnosisTask; result?: DiagnosisResult; steps: DiagnosisStep[] }>(`/diagnosis/${diagnosisId}`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      const task = mockDiagnosisTasks.find((t) => t.diagnosisId === diagnosisId) || mockDiagnosisTasks[0];
      const mockData = mockDiagnosisResults[diagnosisId];
      return { task, result: mockData?.result, steps: mockData?.steps || [] };
    }
  },

  deleteTask: async (diagnosisId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/diagnosis/${diagnosisId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  isMockMode: () => useMock,
};

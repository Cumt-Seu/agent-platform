// 模型微调服务 — 支持 Mock 模式

import request from '../utils/request';
import type { FinetuneTask, FinetuneTaskCreate, Dataset, DatasetType, DatasetStatus, TrainingLog } from '../types';
import { mockFinetuneTasks, mockDatasets, mockTrainingLogs } from '../mock/data';

let useMock = false;

export const _setMockMode = (v: boolean) => { useMock = v; };

export const finetuneService = {
  // 任务 CRUD
  getTasks: async (): Promise<FinetuneTask[]> => {
    if (useMock) return mockFinetuneTasks;
    try {
      const result = await request.get<never, FinetuneTask[]>('/finetune');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockFinetuneTasks;
    }
  },

  getTaskDetail: async (taskId: string): Promise<FinetuneTask> => {
    if (useMock) return mockFinetuneTasks.find((t) => t.taskId === taskId) || mockFinetuneTasks[0];
    try {
      const result = await request.get<never, FinetuneTask>(`/finetune/${taskId}`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockFinetuneTasks.find((t) => t.taskId === taskId) || mockFinetuneTasks[0];
    }
  },

  createTask: async (params: FinetuneTaskCreate): Promise<FinetuneTask> => {
    if (useMock) {
      const ds = mockDatasets.find((d) => d.datasetId === params.datasetId);
      return {
        taskId: `ft-${Date.now()}`, ...params, datasetName: ds?.name || '未知数据集',
        status: 'PENDING', createdAt: Date.now(),
      };
    }
    try {
      const result = await request.post<never, FinetuneTask>('/finetune', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      const ds = mockDatasets.find((d) => d.datasetId === params.datasetId);
      return {
        taskId: `ft-${Date.now()}`, ...params, datasetName: ds?.name || '未知数据集',
        status: 'PENDING', createdAt: Date.now(),
      };
    }
  },

  deleteTask: async (taskId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/finetune/${taskId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  start: async (taskId: string): Promise<void> => {
    if (useMock) {
      const task = mockFinetuneTasks.find((t) => t.taskId === taskId);
      if (task) task.status = 'TRAINING';
      return;
    }
    try {
      await request.post<never, void>(`/finetune/${taskId}/start`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  stop: async (taskId: string): Promise<void> => {
    if (useMock) {
      const task = mockFinetuneTasks.find((t) => t.taskId === taskId);
      if (task) task.status = 'FAILED';
      return;
    }
    try {
      await request.post<never, void>(`/finetune/${taskId}/stop`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  exportWeights: async (taskId: string): Promise<{ downloadUrl: string }> => {
    if (useMock) return { downloadUrl: `/mock-download/weights-${taskId}.bin` };
    try {
      const result = await request.post<never, { downloadUrl: string }>(`/finetune/${taskId}/export`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { downloadUrl: `/mock-download/weights-${taskId}.bin` };
    }
  },

  getTrainingLogs: async (taskId: string): Promise<TrainingLog[]> => {
    if (useMock) return mockTrainingLogs;
    try {
      const result = await request.get<never, TrainingLog[]>(`/finetune/${taskId}/logs`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockTrainingLogs;
    }
  },

  // 数据集 CRUD
  getDatasets: async (): Promise<Dataset[]> => {
    if (useMock) return mockDatasets;
    try {
      const result = await request.get<never, Dataset[]>('/finetune/datasets');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockDatasets;
    }
  },

  createDataset: async (params: { name: string; type: string }): Promise<Dataset> => {
    if (useMock) {
      return { datasetId: `ds-${Date.now()}`, ...params, type: params.type as DatasetType, sampleCount: 0, status: 'BUILDING' as DatasetStatus, createdAt: Date.now() };
    }
    try {
      const result = await request.post<never, Dataset>('/finetune/datasets', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { datasetId: `ds-${Date.now()}`, ...params, type: params.type as DatasetType, sampleCount: 0, status: 'BUILDING' as DatasetStatus, createdAt: Date.now() };
    }
  },

  deleteDataset: async (datasetId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/finetune/datasets/${datasetId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  getSamples: async (datasetId: string, _params?: { page?: number; pageSize?: number }): Promise<unknown[]> => {
    if (useMock) return [{ id: 1, input: '示例输入', output: '示例输出' }];
    try {
      const result = await request.get<never, unknown[]>(`/finetune/datasets/${datasetId}/samples`, { params: _params });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return [{ id: 1, input: '示例输入', output: '示例输出' }];
    }
  },

  isMockMode: () => useMock,
};

// 模型微调相关类型定义

export type FinetuneStatus = 'PENDING' | 'TRAINING' | 'COMPLETED' | 'FAILED';
export type DatasetStatus = 'BUILDING' | 'READY' | 'ERROR';
export type DatasetType = 'CODE_GEN' | 'CODE_REVIEW' | 'FAULT_DIAG';

export interface FinetuneTask {
  taskId: string;
  name: string;
  baseModel: string;
  datasetId: string;
  datasetName: string;
  status: FinetuneStatus;
  loraR: number;
  loraAlpha: number;
  dropout: number;
  epochs: number;
  learningRate: string;
  targetModules: string[];
  createdAt: number;
}

export interface FinetuneTaskCreate {
  name: string;
  baseModel: string;
  datasetId: string;
  loraR: number;
  loraAlpha: number;
  dropout: number;
  epochs: number;
  learningRate: string;
  targetModules: string[];
}

export interface Dataset {
  datasetId: string;
  name: string;
  type: DatasetType;
  sampleCount: number;
  status: DatasetStatus;
  createdAt: number;
}

export interface TrainingLog {
  timestamp: string;
  epoch: number;
  totalEpochs: number;
  loss: number;
  valLoss?: number;
}

export interface FinetuneResult {
  finalLoss: number;
  finalValLoss: number;
  metrics: Record<string, number>;
}

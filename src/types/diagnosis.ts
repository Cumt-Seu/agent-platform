// 故障排障相关类型定义

export type DiagnosisStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';
export type StepStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DiagnosisTask {
  diagnosisId: string;
  title: string;
  serviceName: string;
  status: DiagnosisStatus;
  createdAt: number;
}

export interface DiagnosisInput {
  exceptionLog: string;
  serviceName?: string;
  exceptionTime?: string;
}

export interface DiagnosisResult {
  summary: string;
  impactScope: string[];
  rootCauses: RootCause[];
  solutions: Solution[];
  similarCases: SimilarCase[];
}

export interface RootCause {
  cause: string;
  confidence: number;
  evidence: string[];
}

export interface Solution {
  description: string;
  steps: string[];
  riskLevel: RiskLevel;
  fixedCode?: string;
}

export interface SimilarCase {
  caseId: string;
  title: string;
  similarity: number;
  resolution: string;
}

export interface DiagnosisStep {
  stepName: string;
  skillName: string;
  status: StepStatus;
  duration?: number;
  output?: string;
  error?: string;
}

export interface MonitorMetric {
  name: string;
  data: { time: string; value: number }[];
  threshold?: number;
  unit: string;
}

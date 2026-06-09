// 代码评审相关类型定义

export type ReviewStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED' | 'FAILED';
export type Severity = 'BLOCKER' | 'MAJOR' | 'MINOR' | 'INFO';
export type IssueCategory = 'NAMING' | 'SECURITY' | 'PERFORMANCE' | 'LOGIC' | 'ARCH';
export type ReviewMode = 'ai' | 'ai_and_human';
export type ReviewDimension = '编码规范' | '安全漏洞' | '性能隐患' | '逻辑审查' | '架构合规';
export type IssueStatus = 'OPEN' | 'FIXED' | 'IGNORED';

export interface ReviewTask {
  reviewId: string;
  mrTitle: string;
  projectId: string;
  projectName: string;
  status: ReviewStatus;
  blockerCount: number;
  majorCount: number;
  minorCount: number;
  infoCount: number;
  qualityScore: number;
  createdAt: number;
}

export interface ReviewIssue {
  issueId: string;
  reviewId: string;
  severity: Severity;
  category: IssueCategory;
  filePath: string;
  startLine: number;
  endLine: number;
  description: string;
  suggestion: string;
  fixedCode: string;
  status: IssueStatus;
}

export interface ReviewSummary {
  qualityScore: number;
  blockerCount: number;
  majorCount: number;
  minorCount: number;
  infoCount: number;
  overallComment: string;
}

export interface MrInfo {
  mrId: string;
  title: string;
  author: string;
  changedFiles: number;
  additions: number;
  deletions: number;
}

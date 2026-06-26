// 代码评审服务 — 支持 Mock 模式

import request from '../utils/request';
import type { ReviewTask, ReviewIssue } from '../types';
import { mockReviewTasks, mockReviewIssues } from '../mock/data';

export interface ReviewSubmitParams {
  projectId: string;
  mrId: string;
  dimensions: string[];
  mode: string;
}

let useMock = false;

export const _setMockMode = (v: boolean) => { useMock = v; };

export const reviewService = {
  submit: async (params: ReviewSubmitParams): Promise<ReviewTask> => {
    if (useMock) {
      return {
        reviewId: `r-${Date.now()}`, mrTitle: '新评审任务', projectId: params.projectId,
        projectName: '示例项目', status: 'REVIEWING', blockerCount: 0, majorCount: 0,
        minorCount: 0, infoCount: 0, qualityScore: 0, createdAt: Date.now(),
      };
    }
    try {
      const result = await request.post<never, ReviewTask>('/review', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return {
        reviewId: `r-${Date.now()}`, mrTitle: '新评审任务', projectId: params.projectId,
        projectName: '示例项目', status: 'REVIEWING', blockerCount: 0, majorCount: 0,
        minorCount: 0, infoCount: 0, qualityScore: 0, createdAt: Date.now(),
      };
    }
  },

  getTasks: async (params?: { projectId?: string; status?: string }): Promise<ReviewTask[]> => {
    if (useMock) {
      let tasks = mockReviewTasks;
      if (params?.status) tasks = tasks.filter((t) => t.status === params.status);
      if (params?.projectId) tasks = tasks.filter((t) => t.projectId === params.projectId);
      return tasks;
    }
    try {
      const result = await request.get<never, ReviewTask[]>('/review', { params });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      let tasks = mockReviewTasks;
      if (params?.status) tasks = tasks.filter((t) => t.status === params.status);
      if (params?.projectId) tasks = tasks.filter((t) => t.projectId === params.projectId);
      return tasks;
    }
  },

  getTaskDetail: async (reviewId: string): Promise<ReviewTask> => {
    if (useMock) return mockReviewTasks.find((t) => t.reviewId === reviewId) || mockReviewTasks[0];
    try {
      const result = await request.get<never, ReviewTask>(`/review/${reviewId}`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockReviewTasks.find((t) => t.reviewId === reviewId) || mockReviewTasks[0];
    }
  },

  getIssues: async (reviewId: string): Promise<ReviewIssue[]> => {
    if (useMock) return mockReviewIssues[reviewId] || [];
    try {
      const result = await request.get<never, ReviewIssue[]>(`/review/${reviewId}/issues`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockReviewIssues[reviewId] || [];
    }
  },

  applyFix: async (reviewId: string, issueId: string): Promise<void> => {
    if (useMock) {
      const issues = mockReviewIssues[reviewId];
      const issue = issues?.find((i) => i.issueId === issueId);
      if (issue) issue.status = 'FIXED';
      return;
    }
    try {
      await request.post<never, void>(`/review/${reviewId}/issues/${issueId}/apply-fix`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  isMockMode: () => useMock,
};

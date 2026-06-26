// 知识库服务 — 支持 Mock 模式

import request from '../utils/request';
import type { KnowledgeBase, KbDocument, KbChunk, SearchResult, EmbeddingModel, ChunkStrategy, KbStatus, DocType, DocFormat, DocStatus } from '../types';
import { mockKnowledgeBases, mockKbDocuments, mockSearchResults } from '../mock/data';

export interface KbCreateParams {
  name: string;
  description?: string;
  embeddingModel: string;
  chunkStrategy: string;
  maxChunkTokens: number;
  overlapTokens: number;
}

export interface GitlabImportParams {
  gitlabUrl: string;
  projectId: string;
  branch: string;
  token?: string;
}

export interface ConfluenceImportParams {
  confluenceUrl: string;
  spaceKey: string;
  token?: string;
}

let useMock = false;

export const _setMockMode = (v: boolean) => { useMock = v; };

export const knowledgeService = {
  // 知识库 CRUD
  getKnowledgeBases: async (): Promise<KnowledgeBase[]> => {
    if (useMock) return mockKnowledgeBases;
    try {
      const result = await request.get<never, KnowledgeBase[]>('/knowledge');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockKnowledgeBases;
    }
  },

  createKnowledgeBase: async (params: KbCreateParams): Promise<KnowledgeBase> => {
    if (useMock) {
      return {
        kbId: `kb-${Date.now()}`,
        name: params.name,
        description: params.description,
        embeddingModel: params.embeddingModel as EmbeddingModel,
        chunkStrategy: params.chunkStrategy as ChunkStrategy,
        maxChunkTokens: params.maxChunkTokens,
        overlapTokens: params.overlapTokens,
        docCount: 0,
        chunkCount: 0,
        status: 'PROCESSING' as KbStatus,
        createdAt: Date.now(),
      };
    }
    try {
      const result = await request.post<never, KnowledgeBase>('/knowledge', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { kbId: `kb-${Date.now()}`, ...params, docCount: 0, chunkCount: 0, status: 'PROCESSING', createdAt: Date.now() } as KnowledgeBase;
    }
  },

  getKnowledgeBase: async (kbId: string): Promise<KnowledgeBase> => {
    if (useMock) return mockKnowledgeBases.find((kb) => kb.kbId === kbId) || mockKnowledgeBases[0];
    try {
      const result = await request.get<never, KnowledgeBase>(`/knowledge/${kbId}`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockKnowledgeBases.find((kb) => kb.kbId === kbId) || mockKnowledgeBases[0];
    }
  },

  updateKnowledgeBase: async (kbId: string, params: Partial<KbCreateParams>): Promise<KnowledgeBase> => {
    if (useMock) {
      const kb = mockKnowledgeBases.find((k) => k.kbId === kbId);
      return kb ? { ...kb, ...params, embeddingModel: (params.embeddingModel ?? kb.embeddingModel) as EmbeddingModel, chunkStrategy: (params.chunkStrategy ?? kb.chunkStrategy) as ChunkStrategy } as KnowledgeBase : mockKnowledgeBases[0];
    }
    try {
      const result = await request.put<never, KnowledgeBase>(`/knowledge/${kbId}`, params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      const kb = mockKnowledgeBases.find((k) => k.kbId === kbId);
      return kb ? { ...kb, ...params, embeddingModel: (params.embeddingModel ?? kb.embeddingModel) as EmbeddingModel, chunkStrategy: (params.chunkStrategy ?? kb.chunkStrategy) as ChunkStrategy } as KnowledgeBase : mockKnowledgeBases[0];
    }
  },

  deleteKnowledgeBase: async (kbId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/knowledge/${kbId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  // 文档管理
  getDocuments: async (kbId: string): Promise<KbDocument[]> => {
    if (useMock) return mockKbDocuments[kbId] || [];
    try {
      const result = await request.get<never, KbDocument[]>(`/knowledge/${kbId}/documents`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockKbDocuments[kbId] || [];
    }
  },

  uploadDocument: async (kbId: string, file: File): Promise<KbDocument> => {
    if (useMock) {
      return {
        docId: `doc-${Date.now()}`, kbId, title: file.name, docType: '规范' as DocType, format: 'PDF' as DocFormat,
        chunkCount: 0, status: 'PROCESSING' as DocStatus, uploadedAt: Date.now(),
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await request.post<never, KbDocument>(`/knowledge/${kbId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return {
        docId: `doc-${Date.now()}`, kbId, title: file.name, docType: '规范' as DocType, format: 'PDF' as DocFormat,
        chunkCount: 0, status: 'PROCESSING' as DocStatus, uploadedAt: Date.now(),
      };
    }
  },

  deleteDocument: async (kbId: string, docId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/knowledge/${kbId}/documents/${docId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  // 检索
  query: async (kbId: string, query: string, topK?: number): Promise<SearchResult[]> => {
    if (useMock) return mockSearchResults.slice(0, topK || 5);
    try {
      const result = await request.post<never, SearchResult[]>(`/knowledge/${kbId}/query`, { query, topK });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockSearchResults.slice(0, topK || 5);
    }
  },

  // GitLab 导入
  importGitlab: async (kbId: string, params: GitlabImportParams): Promise<void> => {
    if (useMock) return;
    try {
      await request.post<never, void>(`/knowledge/${kbId}/import/gitlab`, params);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  // Confluence 同步
  importConfluence: async (kbId: string, params: ConfluenceImportParams): Promise<void> => {
    if (useMock) return;
    try {
      await request.post<never, void>(`/knowledge/${kbId}/import/confluence`, params);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  // 重新解析
  reparse: async (kbId: string, docId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.post<never, void>(`/knowledge/${kbId}/documents/${docId}/reparse`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  // 切片查看
  getChunks: async (kbId: string, docId: string): Promise<KbChunk[]> => {
    if (useMock) return [{ chunkId: 'c1', docId, content: '示例切片内容...', metadata: {} }];
    try {
      const result = await request.get<never, KbChunk[]>(`/knowledge/${kbId}/documents/${docId}/chunks`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return [{ chunkId: 'c1', docId, content: '示例切片内容...', metadata: {} }];
    }
  },

  // 下载文档
  downloadDocument: async (kbId: string, docId: string): Promise<Blob> => {
    if (useMock) return new Blob(['mock content'], { type: 'text/plain' });
    try {
      const result = await request.get<never, Blob>(`/knowledge/${kbId}/documents/${docId}/download`, { responseType: 'blob' });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return new Blob(['mock content'], { type: 'text/plain' });
    }
  },

  isMockMode: () => useMock,
};

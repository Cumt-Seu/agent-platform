// 知识库管理相关类型定义

export type KbStatus = 'ACTIVE' | 'PROCESSING' | 'ERROR';
export type DocType = '规范' | '架构' | '接口' | '故障案例';
export type DocFormat = 'PDF' | 'Word' | 'MD' | 'Confluence';
export type DocStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type ChunkStrategy = '语义切片' | '章节切片' | '代码切片';
export type EmbeddingModel = 'bge-large-zh-v1.5' | 'm3e-large' | 'text-embedding-3-large';

export interface KnowledgeBase {
  kbId: string;
  name: string;
  description?: string;
  embeddingModel: EmbeddingModel;
  chunkStrategy: ChunkStrategy;
  maxChunkTokens: number;
  overlapTokens: number;
  docCount: number;
  chunkCount: number;
  status: KbStatus;
  createdAt: number;
}

export interface KbDocument {
  docId: string;
  kbId: string;
  title: string;
  docType: DocType;
  format: DocFormat;
  chunkCount: number;
  status: DocStatus;
  uploadedAt: number;
}

export interface KbChunk {
  chunkId: string;
  docId: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface SearchResult {
  chunkId: string;
  score: number;
  title: string;
  content: string;
  source: string;
}

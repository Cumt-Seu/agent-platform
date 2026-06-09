// 智能体相关类型定义

export interface Session {
  sessionId: string;
  title: string;
  createdAt: number;
  lastActiveAt: number;
  lastMessageSummary: string;
  pinned: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  type: MessageType;
  content: string;
  timestamp: number;
  toolCalls?: ToolCallInfo[];
  codeBlocks?: CodeBlockInfo[];
  metadata?: MessageMetadata;
}

export type MessageType = 'user' | 'assistant' | 'system' | 'tool_call' | 'tool_result';

export interface MessageMetadata {
  tokens?: number;
  durationMs?: number;
  model?: string;
}

export interface ToolCallInfo {
  skillName: string;
  skillIcon?: string;
  params: Record<string, unknown>;
  result?: string;
  status: 'running' | 'success' | 'error';
  duration?: number;
  error?: string;
}

export interface CodeBlockInfo {
  language: string;
  code: string;
  filePath?: string;
}

export interface ThinkingInfo {
  thinkingContent: string;
  duration: number;
  isCollapsed: boolean;
}

export type SkillType = 'auto' | 'code_generation' | 'code_review' | 'fault_diagnosis' | 'knowledge_qa';

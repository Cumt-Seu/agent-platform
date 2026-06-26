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
  thinkingInfo?: ThinkingInfo;
}

// SSE → MessageType 映射:
// thinking  → thinkingInfo 字段
// tool_call → toolCalls 字段
// tool_result → toolCalls 字段 (更新 status/result)
// content   → content 字段
// done      → 流结束标记
// dag_update → DagPlan 更新
// step_update → DiagnosisStep 更新

export type MessageType = 'user' | 'assistant' | 'system' | 'tool_call' | 'tool_result' | 'thinking';

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

// DAG 相关类型
export type DagNodeStatus = 'PENDING' | 'running' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
export type DagEdgeType = 'FIXED' | 'CONDITIONAL' | 'SEND';

export interface DagNode {
  id: string;
  label: string;
  status: DagNodeStatus;
  skillName?: string;
  data?: Record<string, unknown>;
}

export interface DagEdge {
  id: string;
  source: string;
  target: string;
  type: DagEdgeType;
  condition?: string;
}

export interface DagPlan {
  nodes: DagNode[];
  edges: DagEdge[];
}

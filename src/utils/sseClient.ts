// SSE 客户端封装 — 支持 POST + 7 种事件 + 指数退避重连

import { useAuthStore } from '../stores/useAuthStore';

// 7 种 SSE 事件类型
export type SSEEventType = 'thinking' | 'tool_call' | 'tool_result' | 'content' | 'done' | 'dag_update' | 'step_update';

export interface SSEMessage {
  type: SSEEventType;
  data: unknown;
}

// 命名回调接口
export interface SSEHandlers {
  onThinking?: (data: unknown) => void;
  onToolCall?: (data: unknown) => void;
  onToolResult?: (data: unknown) => void;
  onContent?: (data: unknown) => void;
  onDone?: (data: unknown) => void;
  onDagUpdate?: (data: unknown) => void;
  onStepUpdate?: (data: unknown) => void;
  onError?: (error: string) => void;
}

const EVENT_HANDLER_MAP: Record<SSEEventType, keyof SSEHandlers> = {
  thinking: 'onThinking',
  tool_call: 'onToolCall',
  tool_result: 'onToolResult',
  content: 'onContent',
  done: 'onDone',
  dag_update: 'onDagUpdate',
  step_update: 'onStepUpdate',
};

export class SSEClient {
  private abortController: AbortController | null = null;
  private handlers: SSEHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseDelay = 1000; // 1s, 2s, 4s, 8s, 16s
  private url: string;
  private body?: Record<string, unknown>;
  private isManualClose = false;

  constructor(url: string, body?: Record<string, unknown>) {
    this.url = url;
    this.body = body;
  }

  connect(handlers: SSEHandlers): void {
    this.handlers = handlers;
    this.isManualClose = false;
    this._connect();
  }

  private async _connect(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();
    const token = useAuthStore.getState().token;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const fetchOptions: RequestInit = {
        method: this.body ? 'POST' : 'GET',
        headers,
        signal: this.abortController.signal,
      };

      if (this.body) {
        fetchOptions.body = JSON.stringify(this.body);
      }

      const response = await fetch(this.url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.reconnectAttempts = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE 格式: 以 \n\n 分隔的事件块
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType: SSEEventType | null = null;
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim() as SSEEventType;
            } else if (line.startsWith('data:')) {
              eventData = line.slice(5).trim();
            }
          }

          if (eventType && eventData) {
            this._dispatch(eventType, eventData);
          } else if (eventData) {
            // 无 event 字段，尝试解析为 JSON
            this._dispatch('content', eventData);
          }
        }
      }

      // 流正常结束
      if (!this.isManualClose) {
        this.handlers.onDone?.(null);
      }
    } catch (error) {
      if (this.isManualClose || (error as Error).name === 'AbortError') {
        return;
      }

      this.handlers.onError?.((error as Error).message);

      // 指数退避重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;
        setTimeout(() => this._connect(), delay);
      }
    }
  }

  private _dispatch(eventType: SSEEventType, rawData: string): void {
    let data: unknown;
    try {
      data = JSON.parse(rawData);
    } catch {
      data = rawData;
    }

    const handlerKey = EVENT_HANDLER_MAP[eventType];
    if (handlerKey && this.handlers[handlerKey]) {
      (this.handlers[handlerKey] as (data: unknown) => void)(data);
    }
  }

  disconnect(): void {
    this.isManualClose = true;
    this.abortController?.abort();
    this.abortController = null;
    this.handlers = {};
  }

  isConnected(): boolean {
    return this.abortController !== null && !this.isManualClose;
  }
}

export function createSSEClient(url: string, body?: Record<string, unknown>): SSEClient {
  return new SSEClient(url, body);
}

// SSE 客户端封装

type SSEEventType = 'thinking' | 'tool_call' | 'tool_result' | 'content' | 'done' | 'error';

interface SSEMessage {
  type: SSEEventType;
  data: unknown;
}

type SSEEventHandler = (message: SSEMessage) => void;

export class SSEClient {
  private eventSource: EventSource | null = null;
  private handlers: Map<SSEEventType, SSEEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const token = localStorage.getItem('token');
    const url = token ? `${this.url}?token=${token}` : this.url;

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);
        this.emit(message.type, message);
      } catch {
        // 如果不是 JSON，当作 content 处理
        this.emit('content', { type: 'content', data: event.data });
      }
    };

    this.eventSource.onerror = () => {
      this.eventSource?.close();
      this.emit('error', { type: 'error', data: 'Connection error' });

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
      }
    };
  }

  on(event: SSEEventType, handler: SSEEventHandler): void {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  off(event: SSEEventType, handler: SSEEventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: SSEEventType, message: SSEMessage): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
    this.handlers.clear();
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export function createSSEClient(url: string): SSEClient {
  return new SSEClient(url);
}

// SSE Hook — 封装 SSEClient，管理连接生命周期

import { useEffect, useRef, useCallback } from 'react';
import { SSEClient, createSSEClient } from '../utils/sseClient';
import type { SSEHandlers } from '../utils/sseClient';

interface UseSSEOptions {
  url: string;
  body?: Record<string, unknown>;
  handlers: SSEHandlers;
  enabled?: boolean;
}

export function useSSE({ url, body, handlers, enabled = true }: UseSSEOptions) {
  const clientRef = useRef<SSEClient | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    const client = createSSEClient(url, body);
    clientRef.current = client;
    client.connect(handlersRef.current);
  }, [url, body]);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    // 组件卸载时自动断开
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return { connect, disconnect, client: clientRef };
}

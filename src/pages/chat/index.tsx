// 智能对话页面 — 使用 agentService + ChatPanel + useSSE

import { Layout, Typography, Button, Dropdown } from 'antd';
import {
  PlusOutlined,
  PushpinOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { agentService } from '../../services/agentService';
import SearchBar from '../../components/common/SearchBar';
import ChatPanel from '../../components/business/ChatPanel/ChatPanel';
import { useSSE } from '../../hooks/useSSE';
import { groupByTime, truncateText } from '../../utils/format';
import type { ChatMessage } from '../../types';

const { Sider } = Layout;
const { Text } = Typography;

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams();
  const queryClient = useQueryClient();

  const {
    currentSessionId,
    messages,
    selectedSkill,
    isStreaming,
    setCurrentSessionId,
    setMessages,
    addMessage,
    updateMessage,
    setSelectedSkill,
    setIsStreaming,
  } = useChatStore();

  // 获取会话列表
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => agentService.getSessions(),
  });

  // URL 参数同步
  useEffect(() => {
    if (urlSessionId && urlSessionId !== currentSessionId) {
      setCurrentSessionId(urlSessionId);
    }
  }, [urlSessionId, currentSessionId, setCurrentSessionId]);

  // 获取当前会话消息
  const { data: sessionMessages } = useQuery({
    queryKey: ['messages', currentSessionId],
    queryFn: () => agentService.getMessages(currentSessionId!),
    enabled: !!currentSessionId,
  });

  useEffect(() => {
    if (sessionMessages) {
      setMessages(sessionMessages);
    }
  }, [sessionMessages, setMessages]);

  // SSE 对话
  const streamingMsgRef = useRef<ChatMessage | null>(null);

  const handleSSEContent = useCallback((data: unknown) => {
    const content = typeof data === 'string' ? data : (data as { content?: string })?.content || '';
    if (streamingMsgRef.current) {
      streamingMsgRef.current = {
        ...streamingMsgRef.current,
        content: streamingMsgRef.current.content + content,
      };
      updateMessage(streamingMsgRef.current.id, { content: streamingMsgRef.current.content });
    }
  }, [updateMessage]);

  const handleSSEDone = useCallback(() => {
    setIsStreaming(false);
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
  }, [setIsStreaming, queryClient]);

  useSSE({
    url: '/api/v1/agent/chat',
    body: currentSessionId ? { sessionId: currentSessionId } : undefined,
    handlers: {
      onContent: handleSSEContent,
      onThinking: (data) => {
        if (streamingMsgRef.current) {
          updateMessage(streamingMsgRef.current.id, { thinkingInfo: data as ChatMessage['thinkingInfo'] });
        }
      },
      onToolCall: (data) => {
        if (streamingMsgRef.current) {
          updateMessage(streamingMsgRef.current.id, { toolCalls: [...(streamingMsgRef.current.toolCalls || []), data as ChatMessage['toolCalls'] extends (infer U)[] ? U : never] });
        }
      },
      onDone: handleSSEDone,
      onError: () => setIsStreaming(false),
    },
    enabled: isStreaming,
  });

  // 发送消息
  const handleSend = useCallback((message: string) => {
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: currentSessionId || '',
      type: 'user',
      content: message,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sessionId: currentSessionId || '',
      type: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    addMessage(assistantMsg);
    streamingMsgRef.current = assistantMsg;
    setIsStreaming(true);
  }, [currentSessionId, addMessage, setIsStreaming]);

  // 新建会话
  const handleNewChat = useCallback(async () => {
    try {
      const session = await agentService.createSession();
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setCurrentSessionId(session.sessionId);
      navigate(`/chat/${session.sessionId}`);
    } catch {
      // ignore
    }
  }, [queryClient, setCurrentSessionId, navigate]);

  // 切换会话
  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    navigate(`/chat/${sessionId}`);
  }, [setCurrentSessionId, navigate]);

  // 删除会话
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      await agentService.deleteSession(sessionId);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        navigate('/chat');
      }
    } catch {
      // ignore
    }
  }, [currentSessionId, queryClient, setCurrentSessionId, navigate]);

  // 置顶会话
  const handlePinSession = useCallback(async (sessionId: string, pinned: boolean) => {
    try {
      await agentService.pinSession(sessionId, !pinned);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch {
      // ignore
    }
  }, [queryClient]);

  const groupedSessions = groupByTime(sessions, 'lastActiveAt');

  return (
    <Layout style={{ height: '100%', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
      {/* 左侧：会话列表 */}
      <Sider
        width={280}
        style={{
          background: '#FAFAFA',
          borderRight: '1px solid #F0F0F0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '12px 16px' }}>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            block
            onClick={handleNewChat}
          >
            新建对话
          </Button>
        </div>

        <div style={{ padding: '0 16px 12px' }}>
          <SearchBar placeholder="搜索会话..." />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
          {groupedSessions.map((group) => (
            <div key={group.label}>
              <Text
                type="secondary"
                style={{ fontSize: 12, padding: '8px 8px 4px', display: 'block' }}
              >
                {group.label}
              </Text>
              {group.items.map((session) => (
                <div
                  key={session.sessionId}
                  className={session.sessionId === currentSessionId ? 'list-item-selected' : ''}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginBottom: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onClick={() => handleSelectSession(session.sessionId)}
                >
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Text
                      ellipsis
                      style={{ fontSize: 14, display: 'block', fontWeight: session.pinned ? 600 : 400 }}
                    >
                      {session.pinned && <PushpinOutlined style={{ marginRight: 4, fontSize: 12 }} />}
                      {session.title || '新对话'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {truncateText(session.lastMessageSummary || '', 30)}
                    </Text>
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'pin', icon: <PushpinOutlined />, label: session.pinned ? '取消置顶' : '置顶' },
                        { key: 'rename', icon: <EditOutlined />, label: '重命名' },
                        { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true },
                      ],
                      onClick: ({ key }) => {
                        if (key === 'pin') handlePinSession(session.sessionId, session.pinned);
                        if (key === 'delete') handleDeleteSession(session.sessionId);
                      },
                    }}
                    trigger={['click']}
                  >
                    <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                  </Dropdown>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Sider>

      {/* 右侧：ChatPanel */}
      <ChatPanel
        messages={messages}
        selectedSkill={selectedSkill}
        onSkillChange={setSelectedSkill}
        onSend={handleSend}
        isStreaming={isStreaming}
      />
    </Layout>
  );
};

export default ChatPage;

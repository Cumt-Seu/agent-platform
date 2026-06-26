// ChatPanel — 对话面板主组件

import { useRef, useEffect } from 'react';
import { Typography } from 'antd';
import type { ChatMessage, SkillType } from '../../../types';
import AssistantMessageBubble from './AssistantMessageBubble';
import SkillSelector from './SkillSelector';
import ChatInput from './ChatInput';

const { Text } = Typography;

interface UserMessageBubbleProps {
  content: string;
}

const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({ content }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
    <div className="chat-bubble-user">{content}</div>
  </div>
);

interface ChatPanelProps {
  messages: ChatMessage[];
  selectedSkill: SkillType;
  onSkillChange: (skill: SkillType) => void;
  onSend: (message: string, attachments?: File[]) => void;
  isStreaming: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  selectedSkill,
  onSkillChange,
  onSend,
  isStreaming,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 消息区域 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', paddingTop: 80 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #1677FF 0%, #69B1FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: '#fff',
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              AI
            </div>
            <h3 style={{ marginBottom: 8 }}>你好！我是研发智能体</h3>
            <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 32 }}>
              可以帮你生成代码、评审代码、排查故障、查询知识
            </Text>
          </div>
        ) : (
          messages.map((msg) =>
            msg.type === 'user' ? (
              <UserMessageBubble key={msg.id} content={msg.content} />
            ) : (
              <AssistantMessageBubble key={msg.id} message={msg} />
            )
          )
        )}
        {isStreaming && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div className="chat-bubble-assistant typing-cursor" style={{ padding: '10px 14px' }}>
              <Text type="secondary">正在思考</Text>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区域 */}
      <div style={{ borderTop: '1px solid #F0F0F0', padding: '12px 24px' }}>
        <SkillSelector value={selectedSkill} onChange={onSkillChange} />
        <ChatInput onSend={onSend} disabled={isStreaming} />
      </div>
    </div>
  );
};

export default ChatPanel;

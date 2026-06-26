// AssistantMessageBubble — 左对齐，#F6F6F6 背景，Markdown 渲染

import { Typography } from 'antd';
import DOMPurify from 'dompurify';
import type { ChatMessage } from '../../../types';
import ThinkingCard from './ThinkingCard';
import ToolCallCard from './ToolCallCard';
import CodeBlockCard from './CodeBlockCard';

const { Text } = Typography;

interface AssistantMessageBubbleProps {
  message: ChatMessage;
}

// 简易 Markdown → HTML 转换
function simpleMarkdown(text: string): string {
  let html = text
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // 换行
    .replace(/\n/g, '<br/>');
  return DOMPurify.sanitize(html);
}

const AssistantMessageBubble: React.FC<AssistantMessageBubbleProps> = ({ message }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
      <div style={{ maxWidth: '85%' }}>
        {/* Thinking */}
        {message.thinkingInfo && (
          <ThinkingCard thinkingInfo={message.thinkingInfo} />
        )}

        {/* Tool Calls */}
        {message.toolCalls?.map((tc, idx) => (
          <ToolCallCard key={idx} toolCall={tc} />
        ))}

        {/* Code Blocks */}
        {message.codeBlocks?.map((cb, idx) => (
          <CodeBlockCard
            key={idx}
            language={cb.language}
            code={cb.code}
            filePath={cb.filePath}
          />
        ))}

        {/* Content */}
        {message.content && (
          <div
            className="chat-bubble-assistant"
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(message.content) }}
          />
        )}

        {/* Metadata */}
        {message.metadata && (
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {message.metadata.model && `${message.metadata.model} · `}
              {message.metadata.tokens && `${message.metadata.tokens} tokens · `}
              {message.metadata.durationMs && `${message.metadata.durationMs}ms`}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantMessageBubble;

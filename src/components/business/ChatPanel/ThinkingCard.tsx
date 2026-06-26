// ThinkingCard — 可折叠，灰色斜体 + 脉冲动画

import { Typography } from 'antd';
import { useState } from 'react';
import type { ThinkingInfo } from '../../../types';

const { Text } = Typography;

interface ThinkingCardProps {
  thinkingInfo: ThinkingInfo;
}

const ThinkingCard: React.FC<ThinkingCardProps> = ({ thinkingInfo }) => {
  const [collapsed, setCollapsed] = useState(thinkingInfo.isCollapsed);

  return (
    <div
      style={{
        background: '#FAFAFA',
        border: '1px solid #F0F0F0',
        borderRadius: 8,
        padding: '8px 12px',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span
          style={{
            fontSize: 10,
            transition: 'transform 0.2s',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            display: 'inline-block',
          }}
        >
          ▼
        </span>
        <Text
          type="secondary"
          italic
          className={!collapsed ? 'pulse-animation' : undefined}
          style={{ fontSize: 13 }}
        >
          思考中... {thinkingInfo.duration > 0 ? `(${thinkingInfo.duration}ms)` : ''}
        </Text>
      </div>
      {!collapsed && (
        <div style={{ marginTop: 8, paddingLeft: 16 }}>
          <Text
            type="secondary"
            italic
            style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}
          >
            {thinkingInfo.thinkingContent}
          </Text>
        </div>
      )}
    </div>
  );
};

export default ThinkingCard;

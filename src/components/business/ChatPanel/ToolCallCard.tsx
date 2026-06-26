// ToolCallCard — 左侧蓝色竖条，技能名 + 参数 + 状态

import { Typography, Tag, Space } from 'antd';
import type { ToolCallInfo } from '../../../types';

const { Text } = Typography;

interface ToolCallCardProps {
  toolCall: ToolCallInfo;
}

const STATUS_MAP: Record<ToolCallInfo['status'], { color: string; label: string }> = {
  running: { color: 'processing', label: '执行中' },
  success: { color: 'success', label: '成功' },
  error: { color: 'error', label: '失败' },
};

const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
  const statusInfo = STATUS_MAP[toolCall.status];

  return (
    <div
      className="tool-call-indicator"
      style={{
        background: '#FAFAFA',
        borderRadius: 8,
        padding: '8px 12px',
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Space size={8}>
          <Text strong style={{ fontSize: 14 }}>{toolCall.skillName}</Text>
          <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
        </Space>
        {toolCall.duration != null && (
          <Text type="secondary" style={{ fontSize: 12 }}>{toolCall.duration}ms</Text>
        )}
      </div>
      {Object.keys(toolCall.params).length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            参数: {JSON.stringify(toolCall.params, null, 2).slice(0, 200)}
          </Text>
        </div>
      )}
      {toolCall.result && (
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            结果: {toolCall.result.slice(0, 300)}
          </Text>
        </div>
      )}
      {toolCall.error && (
        <div>
          <Text type="danger" style={{ fontSize: 12 }}>
            错误: {toolCall.error}
          </Text>
        </div>
      )}
    </div>
  );
};

export default ToolCallCard;

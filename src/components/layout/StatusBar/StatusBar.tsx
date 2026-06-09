// 底部状态栏组件

import { Space, Typography, Tooltip } from 'antd';
import { useAppStore } from '../../../stores/useAppStore';
import { formatTokens } from '../../../utils/format';
import { STATUS_BAR_HEIGHT } from '../../../utils/constants';

const { Text } = Typography;

const StatusBar: React.FC = () => {
  const { connectionStatus, currentModel, sessionTokenUsage } = useAppStore();

  const getConnectionInfo = (): { color: string; text: string } => {
    switch (connectionStatus) {
      case 'connected':
        return { color: '#52C41A', text: '已连接' };
      case 'disconnected':
        return { color: '#FF4D4F', text: '已断开' };
      case 'reconnecting':
        return { color: '#FAAD14', text: '重连中' };
    }
  };

  const connInfo = getConnectionInfo() ?? { color: '#8C8C8C', text: '未知' };

  return (
    <div
      style={{
        height: STATUS_BAR_HEIGHT,
        padding: '0 24px',
        background: '#FAFAFA',
        borderTop: '1px solid #F0F0F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* 左侧：连接状态 */}
      <Space size={8}>
        <Tooltip title={connInfo.text}>
          <span
            className={`status-dot ${
              connectionStatus === 'connected'
                ? 'status-dot-success'
                : connectionStatus === 'reconnecting'
                ? 'status-dot-warning pulse-animation'
                : 'status-dot-error'
            }`}
          />
        </Tooltip>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {connInfo.text}
        </Text>
      </Space>

      {/* 中部：当前模型 */}
      <Text type="secondary" style={{ fontSize: 12 }}>
        当前模型: {currentModel}
      </Text>

      {/* 右侧：Token 用量 */}
      <Text type="secondary" style={{ fontSize: 12 }}>
        Token 用量: {formatTokens(sessionTokenUsage)}
      </Text>
    </div>
  );
};

export default StatusBar;

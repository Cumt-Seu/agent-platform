// 状态标签组件

import { Tag } from 'antd';
import type { ReactNode } from 'react';
import { STATUS_COLORS } from '../../../utils/constants';

interface StatusTagProps {
  status: string;
  label?: string;
  dotMode?: boolean;
}

const STATUS_LABEL_MAP: Record<string, string> = {
  ACTIVE: '正常',
  DISABLED: '已禁用',
  ERROR: '异常',
  PROCESSING: '处理中',
  PENDING: '待处理',
  RUNNING: '运行中',
  REVIEWING: '评审中',
  COMPLETED: '已完成',
  FAILED: '失败',
  SUCCESS: '成功',
  TIMEOUT: '超时',
  TRAINING: '训练中',
  BUILDING: '构建中',
  READY: '就绪',
  ENABLED: '启用',
  ONLINE: '在线',
  OFFLINE: '离线',
};

const STATUS_COLOR_MAP: Record<string, string> = {
  ACTIVE: STATUS_COLORS.SUCCESS,
  SUCCESS: STATUS_COLORS.SUCCESS,
  COMPLETED: STATUS_COLORS.SUCCESS,
  READY: STATUS_COLORS.SUCCESS,
  ENABLED: STATUS_COLORS.SUCCESS,
  ONLINE: STATUS_COLORS.SUCCESS,
  DISABLED: STATUS_COLORS.PENDING,
  PENDING: STATUS_COLORS.PENDING,
  ERROR: STATUS_COLORS.ERROR,
  FAILED: STATUS_COLORS.ERROR,
  TIMEOUT: STATUS_COLORS.WARNING,
  PROCESSING: STATUS_COLORS.INFO,
  RUNNING: STATUS_COLORS.INFO,
  REVIEWING: STATUS_COLORS.INFO,
  TRAINING: STATUS_COLORS.INFO,
  BUILDING: STATUS_COLORS.WARNING,
};

const StatusTag: React.FC<StatusTagProps> = ({ status, label, dotMode = true }) => {
  const color = STATUS_COLOR_MAP[status] || STATUS_COLORS.PENDING;
  const displayLabel = label || STATUS_LABEL_MAP[status] || status;

  return (
    <Tag
      color={color}
      style={{ margin: 0 }}
    >
      {dotMode && (
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#fff',
            marginRight: 6,
            verticalAlign: 'middle',
          }}
        />
      )}
      {displayLabel as ReactNode}
    </Tag>
  );
};

export default StatusTag;

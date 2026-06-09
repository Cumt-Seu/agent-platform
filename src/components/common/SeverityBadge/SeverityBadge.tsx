// 严重度徽标组件

import { Tag } from 'antd';
import { SEVERITY_COLORS } from '../../../utils/constants';
import type { Severity } from '../../../types';

interface SeverityBadgeProps {
  severity: Severity;
  count?: number;
}

const SEVERITY_LABELS: Record<Severity, string> = {
  BLOCKER: 'BLOCKER',
  MAJOR: 'MAJOR',
  MINOR: 'MINOR',
  INFO: 'INFO',
};

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, count }) => {
  const color = SEVERITY_COLORS[severity];
  const label = SEVERITY_LABELS[severity];

  return (
    <Tag
      color={color}
      style={{
        margin: 0,
        fontWeight: 500,
      }}
    >
      {count !== undefined ? `${label} ${count}` : label}
    </Tag>
  );
};

export default SeverityBadge;

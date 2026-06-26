// SkillSelector — 底部标签栏

import type { SkillType } from '../../../types';

interface SkillSelectorProps {
  value: SkillType;
  onChange: (value: SkillType) => void;
}

const SKILL_OPTIONS: { key: SkillType; label: string }[] = [
  { key: 'auto', label: '自动' },
  { key: 'code_generation', label: '代码生成' },
  { key: 'code_review', label: '代码评审' },
  { key: 'fault_diagnosis', label: '故障排查' },
  { key: 'knowledge_qa', label: '知识问答' },
];

const SkillSelector: React.FC<SkillSelectorProps> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      {SKILL_OPTIONS.map((option) => (
        <div
          key={option.key}
          onClick={() => onChange(option.key)}
          style={{
            padding: '4px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
            background: value === option.key ? '#1677FF' : 'transparent',
            color: value === option.key ? '#fff' : '#000000A0',
            border: `1px solid ${value === option.key ? '#1677FF' : '#D9D9D9'}`,
            transition: 'all 0.2s',
          }}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};

export default SkillSelector;
